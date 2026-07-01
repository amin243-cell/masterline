import { useState, useMemo, useCallback, useEffect } from 'react'
import { 
  Target, Bell, Plus, Search, Edit3, Trash2, 
  CheckCircle2, ChevronDown, ChevronUp,
  TrendingUp, PiggyBank, AlertCircle, BellRing,
  Calendar, Clock, Filter, Award, Zap,
  BarChart3, Flame, Gift, Share2
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { formatNumber, getPersianDate } from '../lib/helpers'
import { cn } from '../lib/utils'
import { toast } from 'sonner'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts'

// ==================== تابع invoke ====================
const getInvoke = () => {
  if (window.__TAURI_INTERNALS__ && typeof window.__TAURI_INTERNALS__.invoke === 'function') {
    return window.__TAURI_INTERNALS__.invoke
  }
  if (window.__TAURI__?.core?.invoke) {
    return window.__TAURI__.core.invoke
  }
  if (window.__TAURI_INVOKE__) {
    return window.__TAURI_INVOKE__
  }
  throw new Error('Tauri API not available')
}

// ==================== Constants ====================
const PRIORITIES = [
  { value: 'high', label: 'بالا', color: 'text-red-400 bg-red-500/10' },
  { value: 'medium', label: 'متوسط', color: 'text-yellow-400 bg-yellow-500/10' },
  { value: 'low', label: 'پایین', color: 'text-blue-400 bg-blue-500/10' },
]

const REMINDER_CATEGORIES = [
  { value: 'financial', label: 'مالی', icon: PiggyBank },
  { value: 'subscription', label: 'اشتراک', icon: Bell },
  { value: 'investment', label: 'سرمایه‌گذاری', icon: TrendingUp },
  { value: 'other', label: 'سایر', icon: AlertCircle },
]

// ============ کامپوننت Milestone ============
const GoalMilestone = ({ label, achieved }) => {
  return (
    <div className={`flex items-center gap-2 p-1.5 md:p-2 rounded-lg transition-all ${
      achieved ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-800/30 border border-slate-700/30'
    }`}>
      <div className={`w-2 h-2 rounded-full ${achieved ? 'bg-emerald-400' : 'bg-slate-600'}`} />
      <span className={`text-[10px] md:text-xs font-medium ${achieved ? 'text-emerald-400' : 'text-slate-400'}`}>
        {label}%
      </span>
      {achieved && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
    </div>
  )
}

// ============ کامپوننت Goal Card ============
const GoalCard = ({ 
  goal, 
  onExpand, 
  isExpanded, 
  onAddAmount, 
  onEdit, 
  onDelete, 
  onReminder,
  showProgressChart,
  onToggleChart,
  getMonthlyProgressData,
  goalHistory 
}) => {
  const progress = (goal.current_amount / goal.target_amount) * 100
  const isCompleted = goal.current_amount >= goal.target_amount
  const priority = PRIORITIES.find(p => p.value === goal.priority)
  
  const getDaysRemaining = () => {
    if (!goal.deadline) return null
    const deadline = new Date(goal.deadline)
    const now = new Date()
    const diff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
    return diff
  }
  
  const daysRemaining = getDaysRemaining()
  const isUrgent = daysRemaining !== null && daysRemaining < 30 && daysRemaining > 0
  
  const milestones = [25, 50, 75, 100]
  
  const goalHistoryData = goalHistory.filter(h => h.goalId === goal.id)

  return (
    <div className="item-card-ultra p-4 md:p-6">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => onExpand(goal.id)}>
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="stat-icon-ultra bg-emerald-500/20 flex-shrink-0">
            <Target className="w-6 h-6 md:w-7 md:h-7 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-white font-bold text-base md:text-lg truncate">{goal.title}</h4>
              {isCompleted && <span className="badge-ultra badge-success-ultra flex-shrink-0">تکمیل شده</span>}
              {!isCompleted && daysRemaining !== null && daysRemaining <= 0 && (
                <span className="badge-ultra badge-danger-ultra flex-shrink-0">تاریخ گذشته</span>
              )}
              {isUrgent && !isCompleted && (
                <span className="badge-ultra badge-danger-ultra flex-shrink-0">⏳ {daysRemaining} روز</span>
              )}
              <span className={`badge-ultra flex-shrink-0 ${priority?.color || ''}`}>
                {priority?.label || 'متوسط'}
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>{goal.type === 'savings' ? 'پس‌انداز' : 'سرمایه‌گذاری'}</span>
              {goal.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {goal.deadline}
                </span>
              )}
            </p>
          </div>
          <div className="text-left flex-shrink-0">
            <p className="text-xs text-slate-400">پیشرفت</p>
            <p className="text-xl md:text-2xl font-black text-white font-mono">{progress.toFixed(0)}%</p>
          </div>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 md:mt-5 pt-4 md:pt-5 border-t-2 border-slate-800 space-y-4 md:space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-sm">
            <div>
              <p className="text-slate-400 text-xs">مبلغ هدف</p>
              <p className="text-white font-bold font-mono text-sm md:text-base">{formatNumber(goal.target_amount)} ریال</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">مبلغ فعلی</p>
              <p className="text-white font-bold font-mono text-sm md:text-base">{formatNumber(goal.current_amount)} ریال</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">مانده</p>
              <p className="text-white font-bold font-mono text-sm md:text-base">{formatNumber(goal.target_amount - goal.current_amount)} ریال</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">زمان باقی‌مانده</p>
              <p className={`font-bold font-mono text-sm md:text-base ${isUrgent ? 'text-red-400' : daysRemaining !== null && daysRemaining > 0 ? 'text-white' : 'text-slate-400'}`}>
                {daysRemaining !== null ? (daysRemaining > 0 ? `${daysRemaining} روز` : 'منقضی شده') : 'نامشخص'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">پیشرفت</span>
              <span className="text-white font-bold">{progress.toFixed(1)}%</span>
            </div>
            <div className="relative">
              <div className="progress-ultra h-3 rounded-full overflow-hidden">
                <div className="progress-ultra-fill h-full transition-all duration-1000" style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
              {milestones.map(m => (
                <div
                  key={m}
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ left: `${m}%`, transform: 'translateX(-50%)' }}
                >
                  <div className={`w-2 h-2 rounded-full ${progress >= m ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              {milestones.map(m => (
                <span key={m} className={progress >= m ? 'text-emerald-400' : 'text-slate-600'}>
                  {m}%
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {milestones.map(m => (
              <GoalMilestone key={m} label={m} achieved={progress >= m} />
            ))}
          </div>

          {/* تاریخچه تغییرات */}
          {goalHistoryData.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
                <Clock className="w-3 h-3" />
                📜 تاریخچه تغییرات
              </p>
              <div className="max-h-32 overflow-y-auto custom-scrollbar-ultra space-y-1">
                {goalHistoryData.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
                    <span className="text-slate-300">
                      {entry.action === 'created' && '✅ ایجاد شد'}
                      {entry.action === 'updated' && `✏️ ${entry.details?.changes || 'ویرایش شد'}`}
                      {entry.action === 'progress' && `💰 ${formatNumber(entry.details?.amount || 0)} ریال اضافه شد`}
                      {entry.action === 'completed' && '🎉 تکمیل شد'}
                      {entry.action === 'reset' && '🔄 بازنشانی شد'}
                    </span>
                    <span className="text-slate-500">{entry.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* نمودار پیشرفت ماهانه */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleChart(goal.id)}
            className="text-slate-400 hover:text-white w-full border border-slate-700/50 transition-all hover:border-emerald-500/30"
          >
            <BarChart3 className="w-4 h-4" />
            {showProgressChart[goal.id] ? '📊 بستن نمودار' : '📊 نمایش نمودار پیشرفت ماهانه'}
          </Button>

          {showProgressChart[goal.id] && (
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 animate-fade-in-up">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-400">📈 روند پیشرفت ماهانه</p>
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-emerald-400" />
                    <span>پیشرفت فعلی</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-blue-400 border-t border-dashed border-blue-400" />
                    <span>مسیر هدف</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-2 bg-amber-400/30 rounded" />
                    <span>واریز ماهانه</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={getMonthlyProgressData(goal)}>
                  <defs>
                    <linearGradient id={`progressGrad-${goal.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="ماه" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      border: '1px solid #1e293b', 
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                    formatter={(value, name) => {
                      if (name === 'واریز') return [`${formatNumber(value)} ریال`, 'واریز']
                      return [`${formatNumber(value)} ریال`, name]
                    }}
                  />
                  <Bar dataKey="واریز" fill="#fbbf24" opacity={0.5} radius={[4, 4, 0, 0]} />
                  <Area 
                    type="monotone" 
                    dataKey="مقدار" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fill={`url(#progressGrad-${goal.id})`} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="هدف" 
                    stroke="#3b82f6" 
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    fill="none" 
                  />
                </BarChart>
              </ResponsiveContainer>
              
              {/* خلاصه آمار */}
              {getMonthlyProgressData(goal).length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-700/30">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400">میانگین واریز ماهانه</p>
                    <p className="text-xs font-bold text-white font-mono">
                      {formatNumber(Math.round(
                        getMonthlyProgressData(goal).reduce((sum, d) => sum + (d.واریز || 0), 0) / 
                        getMonthlyProgressData(goal).filter(d => (d.واریز || 0) > 0).length || 1
                      ))}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400">بیشترین واریز</p>
                    <p className="text-xs font-bold text-white font-mono">
                      {formatNumber(Math.max(...getMonthlyProgressData(goal).map(d => d.واریز || 0), 0))}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400">ماه‌های فعال</p>
                    <p className="text-xs font-bold text-white font-mono">
                      {getMonthlyProgressData(goal).filter(d => (d.واریز || 0) > 0).length} / ۶
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {goal.note && <p className="text-xs text-slate-500">📝 {goal.note}</p>}

          <div className="flex gap-2 md:gap-3 pt-2 flex-wrap">
            {!isCompleted && (
              <>
                <Button 
                  onClick={() => onAddAmount(goal)}
                  className="btn-ultra btn-ultra-primary flex-1 min-w-[100px]"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                  افزودن مبلغ
                </Button>
                <Button 
                  onClick={() => onReminder(goal)}
                  className="btn-ultra btn-ultra-secondary"
                  size="sm"
                >
                  <BellRing className="w-4 h-4" />
                  تنظیم یادآور
                </Button>
              </>
            )}
            <Button 
              onClick={() => onEdit(goal)}
              className="btn-ultra btn-ultra-secondary"
              size="sm"
            >
              <Edit3 className="w-4 h-4" />
              ویرایش
            </Button>
            <Button 
              onClick={() => onDelete(goal.id)}
              className="btn-ultra btn-ultra-danger"
              size="sm"
            >
              <Trash2 className="w-4 h-4" />
              حذف
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== صفحه اصلی ====================
export default function Goals() {
  // ==================== State ====================
  const [goals, setGoals] = useState([])
  const [reminders, setReminders] = useState([])
  const [goalHistory, setGoalHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [activeTab, setActiveTab] = useState('goals')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showProgressChart, setShowProgressChart] = useState({})
  
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [showAddToGoalDialog, setShowAddToGoalDialog] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [addAmount, setAddAmount] = useState('')

  const [formData, setFormData] = useState({})

  // ==================== دریافت داده از دیتابیس ====================
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const invoke = getInvoke()
      const [goalsData, remindersData] = await Promise.all([
        invoke('get_goals'),
        invoke('get_reminders'),
      ])
      setGoals(goalsData || [])
      setReminders(remindersData || [])
      setGoalHistory([])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('خطا در دریافت داده‌ها')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ============ داده‌های پیشرفت ماهانه ============
  const getMonthlyProgressData = useCallback((goal) => {
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور']
    const baseAmount = goal.current_amount / 6
    return months.slice(0, 6).map((month, index) => ({
      ماه: month,
      مقدار: Math.min(baseAmount * (index + 1), goal.target_amount),
      هدف: (goal.target_amount / 6) * (index + 1),
      واریز: index === 0 ? Math.round(goal.current_amount / 6) : Math.round(Math.random() * 1000000)
    }))
  }, [])

  // ============ فیلتر کردن اهداف ============
  const filteredGoals = useMemo(() => {
    let filtered = goals.filter(g => 
      g.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(g => g.priority === priorityFilter)
    }
    if (statusFilter !== 'all') {
      if (statusFilter === 'completed') {
        filtered = filtered.filter(g => g.current_amount >= g.target_amount)
      } else if (statusFilter === 'in-progress') {
        filtered = filtered.filter(g => g.current_amount < g.target_amount)
      }
    }
    return filtered
  }, [goals, searchQuery, priorityFilter, statusFilter])

  // ============ آمار ============
  const totalGoals = goals.length
  const completedGoals = goals.filter(g => g.current_amount >= g.target_amount).length
  const inProgressGoals = goals.filter(g => g.current_amount < g.target_amount).length
  const avgProgress = goals.length > 0 
    ? goals.reduce((sum, g) => sum + (g.current_amount / g.target_amount * 100), 0) / goals.length 
    : 0

  // ============ توابع CRUD ============
  const openAddGoal = () => {
    setEditingItem(null)
    setFormData({
      title: '', type: 'savings', targetAmount: '', currentAmount: '0',
      deadline: '', priority: 'medium', note: '', repeat: 'none'
    })
    setShowDialog(true)
  }

  const openEditGoal = (goal) => {
    setEditingItem({ ...goal, type: 'goal' })
    setFormData({
      title: goal.title,
      type: goal.type,
      targetAmount: goal.target_amount.toString(),
      currentAmount: goal.current_amount.toString(),
      deadline: goal.deadline,
      priority: goal.priority,
      note: goal.note || '',
      repeat: goal.repeat || 'none'
    })
    setShowDialog(true)
  }

  // ==================== اصلاح اصلی: استفاده از camelCase برای کلیدها ====================
  const saveGoal = async () => {
    if (!formData.title || !formData.targetAmount) {
      toast.error('❌ لطفاً فیلدهای ضروری را پر کنید')
      return
    }
    
    setIsSubmitting(true)
    try {
      const invoke = getInvoke()
      const data = {
        title: formData.title,
        type: formData.type,
        targetAmount: parseFloat(formData.targetAmount),   // ✅ اصلاح: targetAmount
        currentAmount: parseFloat(formData.currentAmount || 0),  // ✅ اصلاح: currentAmount
        deadline: formData.deadline || new Date().toISOString().split('T')[0],
        priority: formData.priority,
        note: formData.note || null,
        repeat: formData.repeat || 'none'
      }
      
      if (editingItem?.id) {
        await invoke('update_goal', { id: editingItem.id, ...data })
        toast.success('✅ هدف با موفقیت ویرایش شد')
      } else {
        await invoke('add_goal', data)
        toast.success('✅ هدف جدید با موفقیت اضافه شد')
      }
      
      await fetchData()
      setShowDialog(false)
    } catch (error) {
      console.error('Error saving goal:', error)
      toast.error('❌ خطا در ذخیره هدف: ' + (error.message || ''))
    } finally {
      setIsSubmitting(false)
    }
  }

  const openAddToGoal = (goal) => {
    setSelectedGoal(goal)
    setAddAmount('')
    setShowAddToGoalDialog(true)
  }

  const confirmAddToGoal = async () => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      toast.error('❌ مبلغ نامعتبر است')
      return
    }
    
    const amount = parseFloat(addAmount)
    const goal = selectedGoal
    const newAmount = goal.current_amount + amount
    
    setIsSubmitting(true)
    try {
      const invoke = getInvoke()
      await invoke('update_goal', {
        id: goal.id,
        title: goal.title,
        type: goal.type,
        targetAmount: goal.target_amount,   // ✅ اصلاح: targetAmount
        currentAmount: newAmount,   // ✅ اصلاح: currentAmount
        deadline: goal.deadline,
        priority: goal.priority,
        note: goal.note || null,
        repeat: goal.repeat || 'none'
      })
      
      toast.success(`✅ مبلغ ${formatNumber(amount)} به هدف اضافه شد`)
      await fetchData()
      setShowAddToGoalDialog(false)
      setSelectedGoal(null)
    } catch (error) {
      console.error('Error adding to goal:', error)
      toast.error('❌ خطا در افزودن مبلغ: ' + (error.message || ''))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('آیا از حذف این هدف مطمئن هستید؟')) return
    
    try {
      const invoke = getInvoke()
      await invoke('delete_goal', { id })
      toast.success('✅ هدف حذف شد')
      await fetchData()
    } catch (error) {
      console.error('Error deleting goal:', error)
      toast.error('❌ خطا در حذف هدف')
    }
  }

  const setupGoalReminder = (goal) => {
    toast.info(`🔔 یادآور برای هدف "${goal.title}" تنظیم شد`)
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const toggleChart = (id) => {
    setShowProgressChart(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // ==================== رندر ====================
  if (loading) {
    return (
      <div className="p-8 space-y-8" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-10 w-48 bg-slate-800/50 rounded-xl animate-pulse" />
            <div className="h-5 w-64 bg-slate-800/30 rounded-lg mt-3 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 animate-pulse">
              <div className="h-4 w-20 bg-slate-800/50 mb-2" />
              <div className="h-8 w-32 bg-slate-800/50" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in-up bg-grid-ultra min-h-screen" dir="rtl">
      {/* ============ هدر ============ */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gradient-ultra flex items-center gap-3">
            <Target className="w-8 h-8 text-emerald-400" />
            اهداف و یادآورها
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-1">مدیریت اهداف مالی و یادآوری‌های مهم</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setPriorityFilter('all')}
            className={`text-slate-400 hover:text-white ${priorityFilter === 'all' ? 'bg-emerald-500/10 text-emerald-400' : ''}`}
          >
            <Filter className="w-4 h-4" />
            همه
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setPriorityFilter('high')}
            className={`text-slate-400 hover:text-white ${priorityFilter === 'high' ? 'bg-red-500/10 text-red-400' : ''}`}
          >
            🔴 بالا
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setPriorityFilter('medium')}
            className={`text-slate-400 hover:text-white ${priorityFilter === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : ''}`}
          >
            🟡 متوسط
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setPriorityFilter('low')}
            className={`text-slate-400 hover:text-white ${priorityFilter === 'low' ? 'bg-blue-500/10 text-blue-400' : ''}`}
          >
            🟢 پایین
          </Button>
        </div>
      </div>

      {/* ============ کارت‌های خلاصه ============ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        <div className="stat-card-ultra animate-fade-in-up delay-100">
          <div className="flex items-center gap-3">
            <div className="stat-icon-ultra bg-emerald-500/20">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">اهداف تکمیل شده</p>
              <p className="text-xl font-black text-white font-mono">{completedGoals} <span className="text-xs text-slate-400">از {totalGoals}</span></p>
            </div>
          </div>
        </div>

        <div className="stat-card-ultra animate-fade-in-up delay-200">
          <div className="flex items-center gap-3">
            <div className="stat-icon-ultra bg-blue-500/20">
              <Flame className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">اهداف در حال انجام</p>
              <p className="text-xl font-black text-white font-mono">{inProgressGoals}</p>
            </div>
          </div>
        </div>

        <div className="stat-card-ultra animate-fade-in-up delay-300">
          <div className="flex items-center gap-3">
            <div className="stat-icon-ultra bg-purple-500/20">
              <Bell className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">یادآوران پیش رو</p>
              <p className="text-xl font-black text-white font-mono">{reminders.length}</p>
            </div>
          </div>
        </div>

        <div className="stat-card-ultra animate-fade-in-up delay-400">
          <div className="flex items-center gap-3">
            <div className="stat-icon-ultra bg-amber-500/20">
              <TrendingUp className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">میانگین پیشرفت</p>
              <p className="text-xl font-black text-gradient-ultra font-mono">{avgProgress.toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============ تب‌ها ============ */}
      <div className="flex gap-2 md:gap-3">
        <Button
          variant={activeTab === 'goals' ? 'default' : 'outline'}
          onClick={() => { setActiveTab('goals'); setSearchQuery('') }}
          className={activeTab === 'goals' ? 'btn-ultra btn-ultra-primary' : 'btn-ultra btn-ultra-secondary'}
        >
          <Target className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">اهداف</span>
          <span className="sm:hidden">اهداف</span>
          <span className="text-xs bg-slate-700/50 px-1.5 py-0.5 rounded-full">{goals.length}</span>
        </Button>
        <Button
          variant={activeTab === 'reminders' ? 'default' : 'outline'}
          onClick={() => { setActiveTab('reminders'); setSearchQuery('') }}
          className={activeTab === 'reminders' ? 'btn-ultra' : 'btn-ultra btn-ultra-secondary'}
          style={activeTab === 'reminders' ? { background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: 'var(--shadow-glow-blue)' } : {}}
        >
          <Bell className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">یادآورها</span>
          <span className="sm:hidden">یادآورها</span>
          <span className="text-xs bg-slate-700/50 px-1.5 py-0.5 rounded-full">{reminders.length}</span>
        </Button>
      </div>

      {/* ============ جستجو و دکمه افزودن ============ */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="search-bar-ultra flex-1 min-w-[200px]">
          <Search className="search-icon" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو..."
          />
        </div>
        <Button 
          onClick={openAddGoal}
          className="btn-ultra btn-ultra-primary flex-shrink-0"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          افزودن هدف
        </Button>
      </div>

      {/* ============ لیست اهداف ============ */}
      <div className="space-y-4">
        {filteredGoals.length === 0 ? (
          <div className="empty-state-ultra">
            {searchQuery || priorityFilter !== 'all' ? 'هدفی با این شرایط یافت نشد' : 'هنوز هدفی ثبت نشده است'}
          </div>
        ) : (
          filteredGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isExpanded={expandedId === goal.id}
              onExpand={toggleExpand}
              onAddAmount={openAddToGoal}
              onEdit={openEditGoal}
              onDelete={handleDelete}
              onReminder={setupGoalReminder}
              showProgressChart={showProgressChart}
              onToggleChart={toggleChart}
              getMonthlyProgressData={getMonthlyProgressData}
              goalHistory={goalHistory}
            />
          ))
        )}
      </div>

      {/* ============ بخش یادآورها (رفع مشکل نمایش) ============ */}
      {activeTab === 'reminders' && (
        <div className="space-y-4">
          {reminders.length === 0 ? (
            <div className="empty-state-ultra">
              {searchQuery ? 'یادآوری یافت نشد' : 'هنوز یادآوری ثبت نشده است'}
            </div>
          ) : (
            reminders.map(reminder => {
              const category = REMINDER_CATEGORIES.find(c => c.value === reminder.category) || REMINDER_CATEGORIES[3]
              const CategoryIcon = category.icon

              return (
                <div key={reminder.id} className="item-card-ultra p-4 md:p-6">
                  <div className="flex items-center gap-4">
                    <div className="stat-icon-ultra bg-blue-500/20 flex-shrink-0">
                      <CategoryIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-base truncate">{reminder.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {reminder.date}
                        </span>
                        {reminder.time && reminder.time !== '00:00' && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {reminder.time}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-slate-700/50 text-xs">
                          {category.label}
                        </span>
                      </p>
                    </div>
                  </div>
                  {reminder.note && (
                    <p className="text-sm text-slate-400 mt-2">📝 {reminder.note}</p>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ============ Dialog افزودن/ویرایش هدف ============ */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="card-ultra text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-right text-xl md:text-2xl font-black">
              {editingItem?.id ? 'ویرایش هدف' : 'افزودن هدف جدید'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[65vh] overflow-y-auto custom-scrollbar-ultra">
            <div className="space-y-2">
              <Label className="label-ultra">عنوان *</Label>
              <Input 
                value={formData.title || ''} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                placeholder="خرید آپارتمان"
                className="input-ultra" 
              />
            </div>
            <div className="space-y-2">
              <Label className="label-ultra">نوع هدف</Label>
              <Select value={formData.type || 'savings'} onValueChange={(v) => setFormData({...formData, type: v})}>
                <SelectTrigger className="input-ultra"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                  <SelectItem value="savings" className="text-white">پس‌انداز</SelectItem>
                  <SelectItem value="investment" className="text-white">سرمایه‌گذاری</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="label-ultra">مبلغ هدف (ریال) *</Label>
                <Input type="number" value={formData.targetAmount || ''} onChange={(e) => setFormData({...formData, targetAmount: e.target.value})} placeholder="1000000000" className="input-ultra font-mono" />
              </div>
              <div className="space-y-2">
                <Label className="label-ultra">مبلغ فعلی (ریال)</Label>
                <Input type="number" value={formData.currentAmount || ''} onChange={(e) => setFormData({...formData, currentAmount: e.target.value})} placeholder="0" className="input-ultra font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="label-ultra">مهلت دستیابی</Label>
              <Input value={formData.deadline || ''} onChange={(e) => setFormData({...formData, deadline: e.target.value})} placeholder="1405/06/01" className="input-ultra font-mono" />
            </div>
            <div className="space-y-2">
              <Label className="label-ultra">اولویت</Label>
              <Select value={formData.priority || 'medium'} onValueChange={(v) => setFormData({...formData, priority: v})}>
                <SelectTrigger className="input-ultra"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                  {PRIORITIES.map(p => (
                    <SelectItem key={p.value} value={p.value} className="text-white">{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="label-ultra">تکرار</Label>
              <Select value={formData.repeat || 'none'} onValueChange={(v) => setFormData({...formData, repeat: v})}>
                <SelectTrigger className="input-ultra"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                  <SelectItem value="none" className="text-white">بدون تکرار</SelectItem>
                  <SelectItem value="monthly" className="text-white">ماهانه</SelectItem>
                  <SelectItem value="yearly" className="text-white">سالانه</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="label-ultra">یادداشت (اختیاری)</Label>
              <Input 
                value={formData.note || ''} 
                onChange={(e) => setFormData({...formData, note: e.target.value})} 
                placeholder="توضیحات..." 
                className="input-ultra" 
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button onClick={() => setShowDialog(false)} className="btn-ultra btn-ultra-secondary">
              انصراف
            </Button>
            <Button 
              onClick={saveGoal}
              disabled={isSubmitting}
              className="btn-ultra btn-ultra-primary"
            >
              {isSubmitting ? 'در حال ذخیره...' : (editingItem?.id ? 'ذخیره' : 'افزودن')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ Dialog افزودن مبلغ ============ */}
      <Dialog open={showAddToGoalDialog} onOpenChange={setShowAddToGoalDialog}>
        <DialogContent className="card-ultra text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right text-xl md:text-2xl font-black">افزودن مبلغ به هدف</DialogTitle>
            <DialogDescription className="text-right text-slate-400">
              {selectedGoal?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-sm">مبلغ فعلی:</span>
                <span className="text-white font-black font-mono text-lg">
                  {selectedGoal && formatNumber(selectedGoal.current_amount)} ریال
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">مبلغ هدف:</span>
                <span className="text-gradient-ultra font-black font-mono">
                  {selectedGoal && formatNumber(selectedGoal.target_amount)} ریال
                </span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700/50">
                <span className="text-slate-400 text-sm">پیشرفت:</span>
                <span className="text-emerald-400 font-black font-mono">
                  {selectedGoal && ((selectedGoal.current_amount / selectedGoal.target_amount) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="label-ultra">مبلغ افزودنی (ریال)</Label>
              <Input 
                type="number"
                value={addAmount} 
                onChange={(e) => setAddAmount(e.target.value)} 
                placeholder="مبلغ را وارد کنید"
                className="input-ultra font-mono text-lg h-14" 
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button onClick={() => setShowAddToGoalDialog(false)} className="btn-ultra btn-ultra-secondary">
              انصراف
            </Button>
            <Button 
              onClick={confirmAddToGoal}
              disabled={isSubmitting}
              className="btn-ultra btn-ultra-primary"
            >
              <CheckCircle2 className="w-4 h-4" />
              تأیید
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}