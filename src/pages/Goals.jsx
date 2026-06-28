import { useState } from 'react'
import { 
  Target, Bell, Plus, Search, Edit3, Trash2, 
  CheckCircle2, ChevronDown, ChevronUp,
  TrendingUp, PiggyBank, AlertCircle
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
import useStore from '../store/useStore'
import { formatNumber, getPersianDate } from '../lib/helpers'
import Toast from '../components/ui/toast'

const PRIORITIES = [
  { value: 'high', label: 'بالا' },
  { value: 'medium', label: 'متوسط' },
  { value: 'low', label: 'پایین' },
]

const REMINDER_CATEGORIES = [
  { value: 'financial', label: 'مالی', icon: PiggyBank },
  { value: 'subscription', label: 'اشتراک', icon: Bell },
  { value: 'investment', label: 'سرمایه‌گذاری', icon: TrendingUp },
  { value: 'other', label: 'سایر', icon: AlertCircle },
]

export default function Goals() {
  const { 
    goals, reminders,
    addGoal, deleteGoal, updateGoal, addToGoal,
    addReminder, deleteReminder, updateReminder
  } = useStore()
  
  const [activeTab, setActiveTab] = useState('goals')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  const [toast, setToast] = useState(null)
  
  const [showAddToGoalDialog, setShowAddToGoalDialog] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [addAmount, setAddAmount] = useState('')

  const [formData, setFormData] = useState({})

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const openAddGoal = () => {
    setEditingItem(null)
    setFormData({
      title: '', type: 'savings', targetAmount: '', currentAmount: '0',
      deadline: '', priority: 'medium', note: ''
    })
    setShowDialog(true)
  }

  const openEditGoal = (goal) => {
    setEditingItem({ ...goal, type: 'goal' })
    setFormData({
      title: goal.title, type: goal.type,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline, priority: goal.priority,
      note: goal.note || ''
    })
    setShowDialog(true)
  }

  const saveGoal = () => {
    if (!formData.title || !formData.targetAmount) {
      showToast('لطفاً فیلدهای ضروری را پر کنید', 'error')
      return
    }
    const data = {
      title: formData.title,
      type: formData.type,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount || 0),
      deadline: formData.deadline,
      priority: formData.priority,
      status: 'in-progress',
      note: formData.note
    }
    if (editingItem?.id) {
      updateGoal(editingItem.id, data)
      showToast('هدف با موفقیت ویرایش شد')
    } else {
      addGoal(data)
      showToast('هدف جدید با موفقیت اضافه شد')
    }
    setShowDialog(false)
  }

  const openAddToGoal = (goal) => {
    setSelectedGoal(goal)
    setAddAmount('')
    setShowAddToGoalDialog(true)
  }

  const confirmAddToGoal = () => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      showToast('مبلغ نامعتبر است', 'error')
      return
    }
    addToGoal(selectedGoal.id, parseFloat(addAmount))
    showToast(`مبلغ ${formatNumber(parseFloat(addAmount))} به هدف اضافه شد`)
    setShowAddToGoalDialog(false)
    setSelectedGoal(null)
  }

  const openAddReminder = () => {
    setEditingItem(null)
    setFormData({
      title: '', date: getPersianDate(), time: '10:00',
      category: 'financial', note: ''
    })
    setShowDialog(true)
  }

  const openEditReminder = (reminder) => {
    setEditingItem({ ...reminder, type: 'reminder' })
    setFormData({
      title: reminder.title, date: reminder.date,
      time: reminder.time, category: reminder.category,
      note: reminder.note || ''
    })
    setShowDialog(true)
  }

  const saveReminder = () => {
    if (!formData.title || !formData.date) {
      showToast('لطفاً فیلدهای ضروری را پر کنید', 'error')
      return
    }
    const data = {
      title: formData.title,
      date: formData.date,
      time: formData.time,
      category: formData.category,
      note: formData.note
    }
    if (editingItem?.id) {
      updateReminder(editingItem.id, data)
      showToast('یادآور با موفقیت ویرایش شد')
    } else {
      addReminder(data)
      showToast('یادآور جدید با موفقیت اضافه شد')
    }
    setShowDialog(false)
  }

  const handleDelete = (type, id) => {
    if (confirm('آیا از حذف این مورد مطمئن هستید؟')) {
      if (type === 'goal') { deleteGoal(id); showToast('هدف حذف شد') }
      else if (type === 'reminder') { deleteReminder(id); showToast('یادآور حذف شد') }
    }
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const filteredGoals = goals.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredReminders = reminders.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const totalGoals = goals.length
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length
  const upcomingReminders = reminders.filter(r => r.date >= getPersianDate()).length

  return (
    <div className="p-8 space-y-8 animate-fade-in-up bg-grid-ultra min-h-screen" dir="rtl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* هدر */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gradient-ultra">اهداف و یادآورها</h1>
          <p className="text-base text-slate-400 mt-3">مدیریت اهداف مالی و یادآوری‌های مهم</p>
        </div>
      </div>

      {/* کارت‌های خلاصه */}
      <div className="grid grid-cols-3 gap-5">
        <div className="stat-card-ultra animate-fade-in-up delay-100">
          <div className="flex items-center gap-3">
            <div className="stat-icon-ultra bg-emerald-500/20">
              <Target className="w-6 h-6 text-emerald-400" />
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
              <Bell className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">یادآوران پیش رو</p>
              <p className="text-xl font-black text-white font-mono">{upcomingReminders} <span className="text-xs text-slate-400">مورد</span></p>
            </div>
          </div>
        </div>

        <div className="stat-card-ultra animate-fade-in-up delay-300">
          <div className="flex items-center gap-3">
            <div className="stat-icon-ultra bg-purple-500/20">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">میانگین پیشرفت</p>
              <p className="text-xl font-black text-gradient-ultra font-mono">
                {goals.length > 0 ? (goals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount * 100), 0) / goals.length).toFixed(0) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* تب‌ها */}
      <div className="flex gap-3">
        <Button
          variant={activeTab === 'goals' ? 'default' : 'outline'}
          onClick={() => { setActiveTab('goals'); setSearchQuery('') }}
          className={activeTab === 'goals' ? 'btn-ultra btn-ultra-primary' : 'btn-ultra btn-ultra-secondary'}
        >
          <Target className="w-5 h-5" />
          اهداف ({goals.length})
        </Button>
        <Button
          variant={activeTab === 'reminders' ? 'default' : 'outline'}
          onClick={() => { setActiveTab('reminders'); setSearchQuery('') }}
          className={activeTab === 'reminders' ? 'btn-ultra' : 'btn-ultra btn-ultra-secondary'}
          style={activeTab === 'reminders' ? { background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: 'var(--shadow-glow-blue)' } : {}}
        >
          <Bell className="w-5 h-5" />
          یادآورها ({reminders.length})
        </Button>
      </div>

      {/* جستجو و دکمه افزودن */}
      <div className="flex gap-5 items-center">
        <div className="search-bar-ultra">
          <Search className="search-icon" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو..."
          />
        </div>
        <Button 
          onClick={activeTab === 'goals' ? openAddGoal : openAddReminder}
          className="btn-ultra btn-ultra-primary"
        >
          <Plus className="w-5 h-5" />
          {activeTab === 'goals' ? 'افزودن هدف' : 'افزودن یادآور'}
        </Button>
      </div>

      {/* لیست اهداف */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          {filteredGoals.length === 0 ? (
            <div className="empty-state-ultra">
              {searchQuery ? 'هدفی یافت نشد' : 'هنوز هدفی ثبت نشده است'}
            </div>
          ) : (
            filteredGoals.map(goal => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100
              const isCompleted = goal.currentAmount >= goal.targetAmount
              const isExpanded = expandedId === `goal-${goal.id}`
              const priority = PRIORITIES.find(p => p.value === goal.priority)

              return (
                <div key={goal.id} className="item-card-ultra p-6">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(`goal-${goal.id}`)}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="stat-icon-ultra bg-emerald-500/20">
                        <Target className="w-7 h-7 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-bold text-lg">{goal.title}</h4>
                          {isCompleted && <span className="badge-ultra badge-success-ultra">تکمیل شده</span>}
                          <span className={`badge-ultra ${
                            goal.priority === 'high' ? 'badge-danger-ultra' :
                            goal.priority === 'medium' ? 'badge-warning-ultra' :
                            'badge-success-ultra'
                          }`}>
                            {priority?.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          {goal.type === 'savings' ? 'پس‌انداز' : 'سرمایه‌گذاری'} • مهلت: {goal.deadline || '-'}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-slate-400">پیشرفت</p>
                        <p className="text-2xl font-black text-white font-mono">{progress.toFixed(0)}%</p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t-2 border-slate-800 space-y-5">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400 text-xs">مبلغ هدف</p>
                          <p className="text-white font-bold font-mono">{formatNumber(goal.targetAmount)} ریال</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">مبلغ فعلی</p>
                          <p className="text-white font-bold font-mono">{formatNumber(goal.currentAmount)} ریال</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">مانده</p>
                          <p className="text-white font-bold font-mono">{formatNumber(goal.targetAmount - goal.currentAmount)} ریال</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">پیشرفت</span>
                          <span className="text-white font-bold">{progress.toFixed(1)}%</span>
                        </div>
                        <div className="progress-ultra h-3">
                          <div className="progress-ultra-fill" style={{ width: `${progress}%` }} />
                        </div>
                      </div>

                      {goal.note && <p className="text-xs text-slate-500">📝 {goal.note}</p>}

                      <div className="flex gap-3 pt-2">
                        {!isCompleted && (
                          <Button 
                            onClick={() => openAddToGoal(goal)}
                            className="btn-ultra btn-ultra-primary flex-1"
                            size="sm"
                          >
                            <Plus className="w-4 h-4" />
                            افزودن مبلغ
                          </Button>
                        )}
                        <Button 
                          onClick={() => openEditGoal(goal)}
                          className="btn-ultra btn-ultra-secondary"
                          size="sm"
                        >
                          <Edit3 className="w-4 h-4" />
                          ویرایش
                        </Button>
                        <Button 
                          onClick={() => handleDelete('goal', goal.id)}
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
            })
          )}
        </div>
      )}

      {/* لیست یادآورها */}
      {activeTab === 'reminders' && (
        <div className="space-y-4">
          {filteredReminders.length === 0 ? (
            <div className="empty-state-ultra">
              {searchQuery ? 'یادآوری یافت نشد' : 'هنوز یادآوری ثبت نشده است'}
            </div>
          ) : (
            filteredReminders.map(reminder => {
              const isExpanded = expandedId === `reminder-${reminder.id}`
              const category = REMINDER_CATEGORIES.find(c => c.value === reminder.category) || REMINDER_CATEGORIES[3]
              const CategoryIcon = category.icon

              return (
                <div key={reminder.id} className="item-card-ultra p-6">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(`reminder-${reminder.id}`)}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="stat-icon-ultra bg-blue-500/20">
                        <CategoryIcon className="w-7 h-7 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-bold text-lg">{reminder.title}</h4>
                        <p className="text-sm text-slate-400 mt-1">
                          {category.label} • {reminder.date} {reminder.time !== '00:00' && `• ساعت ${reminder.time}`}
                        </p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t-2 border-slate-800 space-y-5">
                      {reminder.note && <p className="text-sm text-slate-400">📝 {reminder.note}</p>}

                      <div className="flex gap-3 pt-2">
                        <Button 
                          onClick={() => openEditReminder(reminder)}
                          className="btn-ultra btn-ultra-secondary"
                          size="sm"
                        >
                          <Edit3 className="w-4 h-4" />
                          ویرایش
                        </Button>
                        <Button 
                          onClick={() => handleDelete('reminder', reminder.id)}
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
            })
          )}
        </div>
      )}

      {/* Dialog اصلی */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="card-ultra text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-right text-2xl font-black">
              {editingItem?.type === 'goal' ? (editingItem.id ? 'ویرایش هدف' : 'افزودن هدف جدید') :
               editingItem?.type === 'reminder' ? (editingItem.id ? 'ویرایش یادآور' : 'افزودن یادآور جدید') :
               'افزودن مورد جدید'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[65vh] overflow-y-auto custom-scrollbar-ultra">
            
            <div className="space-y-2">
              <Label className="label-ultra">عنوان *</Label>
              <Input 
                value={formData.title || ''} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                placeholder={activeTab === 'goals' ? 'خرید آپارتمان' : 'پرداخت قسط'}
                className="input-ultra" 
              />
            </div>

            {activeTab === 'goals' && (
              <>
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
              </>
            )}

            {activeTab === 'reminders' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="label-ultra">تاریخ *</Label>
                    <Input value={formData.date || ''} onChange={(e) => setFormData({...formData, date: e.target.value})} placeholder="1403/05/01" className="input-ultra font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label className="label-ultra">ساعت</Label>
                    <Input value={formData.time || ''} onChange={(e) => setFormData({...formData, time: e.target.value})} placeholder="10:00" className="input-ultra font-mono" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="label-ultra">دسته‌بندی</Label>
                  <Select value={formData.category || 'financial'} onValueChange={(v) => setFormData({...formData, category: v})}>
                    <SelectTrigger className="input-ultra"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                      {REMINDER_CATEGORIES.map(c => (
                        <SelectItem key={c.value} value={c.value} className="text-white">{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

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
              onClick={activeTab === 'goals' ? saveGoal : saveReminder}
              className="btn-ultra btn-ultra-primary"
            >
              {editingItem?.id ? 'ذخیره' : 'افزودن'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog افزودن مبلغ به هدف */}
      <Dialog open={showAddToGoalDialog} onOpenChange={setShowAddToGoalDialog}>
        <DialogContent className="card-ultra text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right text-2xl font-black">افزودن مبلغ به هدف</DialogTitle>
            <DialogDescription className="text-right text-slate-400">
              {selectedGoal?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-sm">مبلغ فعلی:</span>
                <span className="text-white font-black font-mono text-lg">
                  {selectedGoal && formatNumber(selectedGoal.currentAmount)} ریال
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">مبلغ هدف:</span>
                <span className="text-gradient-ultra font-black font-mono">
                  {selectedGoal && formatNumber(selectedGoal.targetAmount)} ریال
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