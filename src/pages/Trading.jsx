import { useState, useMemo, useEffect, useCallback } from 'react'
import { 
  TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, 
  PlusCircle, Clock, FileText, Trash2, Edit3, Check, X, 
  Inbox, Search, Target, Percent, DollarSign, Wallet, 
  RefreshCw, Download, BarChart3, Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
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
import { getPersianDate, formatNumber, parseNumber } from '../lib/helpers'
import { cn } from '../lib/utils'
import { toast } from 'sonner'

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
  throw new Error('Tauri API not available. Make sure you are running with `npx tauri dev`')
}

// ==================== کامپوننت اصلی ====================
export default function Trading() {
  // ==================== State ====================
  const [accounts, setAccounts] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [type, setType] = useState('profit')
  const [accountId, setAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(getPersianDate())
  const [description, setDescription] = useState('')
  
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterAccount, setFilterAccount] = useState('all')
  
  const [formErrors, setFormErrors] = useState({})

  const tradingAccounts = accounts.filter(a => a.category === 'trading')

  // ==================== دریافت داده از دیتابیس ====================
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const invoke = getInvoke()
      const [accountsData, activitiesData] = await Promise.all([
        invoke('get_accounts'),
        invoke('get_activities'),
      ])
      setAccounts(accountsData || [])
      setActivities(activitiesData || [])
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

  // ==================== آمار ====================
  const tradeStats = useMemo(() => {
    const trades = activities.filter(a => a.type === 'profit' || a.type === 'loss')
    const profits = trades.filter(a => a.type === 'profit')
    const losses = trades.filter(a => a.type === 'loss')
    
    const totalProfit = profits.reduce((sum, a) => sum + a.amount, 0)
    const totalLoss = losses.reduce((sum, a) => sum + a.amount, 0)
    const totalPnL = totalProfit - totalLoss
    
    const winRate = trades.length > 0 ? (profits.length / trades.length) * 100 : 0
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0
    
    const avgWin = profits.length > 0 ? totalProfit / profits.length : 0
    const avgLoss = losses.length > 0 ? totalLoss / losses.length : 0
    
    const totalDeposits = activities
      .filter(a => a.type === 'deposit')
      .reduce((sum, a) => sum + a.amount, 0)
    
    const totalWithdrawals = activities
      .filter(a => a.type === 'withdraw')
      .reduce((sum, a) => sum + a.amount, 0)
    
    return {
      totalTrades: trades.length,
      wins: profits.length,
      losses: losses.length,
      winRate,
      profitFactor,
      totalPnL,
      totalProfit,
      totalLoss,
      avgWin,
      avgLoss,
      totalDeposits,
      totalWithdrawals,
    }
  }, [activities])

  // ==================== فیلترها ====================
  const filteredActivities = activities.filter(a => {
    if (filterType !== 'all' && a.type !== filterType) return false
    if (filterAccount !== 'all' && a.account_id !== parseInt(filterAccount)) return false
    
    const account = accounts.find(acc => acc.id === a.account_id)
    const accountName = account ? account.name.toLowerCase() : ''
    const desc = a.description ? a.description.toLowerCase() : ''
    const query = searchQuery.toLowerCase()
    
    return accountName.includes(query) || desc.includes(query)
  })

  // ==================== اعتبارسنجی ====================
  const validateForm = () => {
    const errors = {}
    if (!accountId) errors.accountId = 'انتخاب حساب ترید الزامی است'
    if (!amount || parseFloat(amount) <= 0) errors.amount = 'مبلغ باید بیشتر از صفر باشد'
    if (!date) errors.date = 'تاریخ الزامی است'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ==================== عملیات‌ها ====================
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('خطا در اعتبارسنجی', {
        description: 'لطفاً فیلدهای الزامی را به درستی پر کنید',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const invoke = getInvoke()
      await invoke('add_activity', {
        type: type,
        accountId: parseInt(accountId),  // ✅ اصلاح: accountId به جای account_id
        amount: parseFloat(amount),
        date: date,
        description: description || null
      })
      
      toast.success('فعالیت با موفقیت ثبت شد')
      await fetchData()
      
      setAmount('')
      setDescription('')
      setAccountId('')
      setFormErrors({})
    } catch (error) {
      console.error('Error:', error)
      toast.error('خطا', {
        description: error.message || 'عملیات با شکست مواجه شد',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (activity) => {
    setEditingId(activity.id)
    setEditForm({
      type: activity.type,
      accountId: activity.account_id.toString(),
      amount: activity.amount.toString(),
      date: activity.date,
      description: activity.description || ''
    })
  }

  const handleSaveEdit = async () => {
    if (!editForm.amount || parseFloat(editForm.amount) <= 0) {
      toast.error('خطا', { description: 'مبلغ باید بیشتر از صفر باشد' })
      return
    }

    setIsSubmitting(true)
    try {
      const invoke = getInvoke()
      await invoke('update_activity', {
        id: editingId,
        type: editForm.type,
        accountId: parseInt(editForm.accountId),  // ✅ اصلاح: accountId به جای account_id
        amount: parseFloat(editForm.amount),
        date: editForm.date,
        description: editForm.description || null
      })
      
      toast.success('فعالیت با موفقیت ویرایش شد')
      await fetchData()
      setEditingId(null)
      setEditForm({})
    } catch (error) {
      console.error('Error:', error)
      toast.error('خطا', {
        description: error.message || 'عملیات با شکست مواجه شد',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleDelete = async (activity) => {
    if (!confirm(`آیا از حذف این فعالیت مطمئن هستید؟`)) return
    
    try {
      const invoke = getInvoke()
      await invoke('delete_activity', { id: activity.id })
      toast.success('فعالیت با موفقیت حذف شد')
      await fetchData()
    } catch (error) {
      console.error('Error:', error)
      toast.error('خطا در حذف', {
        description: error.message || 'امکان حذف این فعالیت وجود ندارد',
      })
    }
  }

  // ==================== خروجی ====================
  const handleExport = () => {
    const headers = ['نوع', 'حساب', 'مبلغ', 'تاریخ', 'توضیحات']
    const rows = filteredActivities.map(a => {
      const account = accounts.find(acc => acc.id === a.account_id)
      return [
        a.type,
        account ? account.name : '-',
        a.amount,
        a.date,
        a.description || ''
      ]
    })
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trading_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('خروجی با موفقیت گرفته شد')
  }

  const getAccountInfo = (id) => {
    const acc = accounts.find(a => a.id === id)
    return acc ? `${acc.name} (${acc.currency})` : '-'
  }

  const typeStyles = {
    profit: {
      active: 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400',
      inactive: 'bg-slate-800/30 border-2 border-slate-700/30 text-slate-400 hover:bg-slate-800/50 hover:text-slate-300 hover:border-slate-600',
      icon: TrendingUp,
      label: 'سود'
    },
    loss: {
      active: 'bg-red-500/20 border-2 border-red-500 text-red-400',
      inactive: 'bg-slate-800/30 border-2 border-slate-700/30 text-slate-400 hover:bg-slate-800/50 hover:text-slate-300 hover:border-slate-600',
      icon: TrendingDown,
      label: 'ضرر'
    },
    deposit: {
      active: 'bg-blue-500/20 border-2 border-blue-500 text-blue-400',
      inactive: 'bg-slate-800/30 border-2 border-slate-700/30 text-slate-400 hover:bg-slate-800/50 hover:text-slate-300 hover:border-slate-600',
      icon: ArrowUpCircle,
      label: 'واریز'
    },
    withdraw: {
      active: 'bg-amber-500/20 border-2 border-amber-500 text-amber-400',
      inactive: 'bg-slate-800/30 border-2 border-slate-700/30 text-slate-400 hover:bg-slate-800/50 hover:text-slate-300 hover:border-slate-600',
      icon: ArrowDownCircle,
      label: 'برداشت'
    }
  }

  // ==================== رندر لودینگ ====================
  if (loading) {
    return (
      <div className="p-8 space-y-8" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-10 w-48 bg-slate-800/50 rounded-xl animate-pulse" />
            <div className="h-5 w-64 bg-slate-800/30 rounded-lg mt-3 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 animate-pulse">
              <div className="h-4 w-16 bg-slate-800/50 mb-2" />
              <div className="h-8 w-24 bg-slate-800/50" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ==================== رندر اصلی ====================
  return (
    <div className="p-8 space-y-8" dir="rtl">
      {/* ==================== هدر ==================== */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            📊 ثبت فعالیت ترید
          </h1>
          <p className="text-base text-slate-400 mt-2">
            سود، ضرر، واریز و برداشت خود را ثبت کنید
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">تاریخ:</span>
            <span className="text-sm font-bold text-white">{getPersianDate()}</span>
          </div>
          <button
            onClick={handleExport}
            className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all"
            title="خروجی"
          >
            <Download className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all"
            title="بروزرسانی"
          >
            <RefreshCw className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>
      </div>

      {/* ==================== آمار ==================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/30">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400">Win Rate</span>
          </div>
          <p className={cn(
            "text-2xl font-black",
            tradeStats.winRate >= 50 ? "text-emerald-400" : "text-red-400"
          )}>
            {tradeStats.winRate.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">{tradeStats.wins}W / {tradeStats.losses}L</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/30">
          <div className="flex items-center gap-2 mb-1">
            <Percent className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-400">Profit Factor</span>
          </div>
          <p className="text-2xl font-black text-blue-400">
            {tradeStats.profitFactor === Infinity ? '∞' : tradeStats.profitFactor.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-1">سود به ضرر</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/30">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-400">Total PnL</span>
          </div>
          <p className={cn(
            "text-2xl font-black",
            tradeStats.totalPnL >= 0 ? "text-emerald-400" : "text-red-400"
          )}>
            {tradeStats.totalPnL >= 0 ? '+' : ''}{formatNumber(tradeStats.totalPnL)}
          </p>
          <p className="text-xs text-slate-500 mt-1">سود خالص</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/30">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400">Avg Win</span>
          </div>
          <p className="text-2xl font-black text-emerald-400">
            {formatNumber(tradeStats.avgWin.toFixed(2))}
          </p>
          <p className="text-xs text-slate-500 mt-1">میانگین سود</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/30">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-xs text-slate-400">Avg Loss</span>
          </div>
          <p className="text-2xl font-black text-red-400">
            {formatNumber(tradeStats.avgLoss.toFixed(2))}
          </p>
          <p className="text-xs text-slate-500 mt-1">میانگین ضرر</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/30">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400">برداشت‌ها</span>
          </div>
          <p className="text-2xl font-black text-amber-400">
            {formatNumber(tradeStats.totalWithdrawals.toFixed(2))}
          </p>
          <p className="text-xs text-slate-500 mt-1">واریز: {formatNumber(tradeStats.totalDeposits.toFixed(2))}</p>
        </div>
      </div>

      {/* ==================== فرم و لیست ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* فرم ثبت */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-800 bg-slate-900/30">
            <CardHeader>
              <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-emerald-400" />
                ثبت فعالیت جدید
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* نوع فعالیت */}
                <div>
                  <Label className="text-slate-400">نوع فعالیت *</Label>
                  <div className="grid grid-cols-4 gap-3 mt-2">
                    {Object.entries(typeStyles).map(([key, style]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setType(key)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl transition-all",
                          type === key ? style.active : style.inactive
                        )}
                      >
                        <style.icon className="w-6 h-6" />
                        <span className="text-xs font-bold">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* حساب ترید */}
                <div>
                  <Label className="text-slate-400">حساب ترید *</Label>
                  <Select 
                    value={accountId} 
                    onValueChange={(v) => { setAccountId(v); if (formErrors.accountId) setFormErrors({...formErrors, accountId: undefined}) }}
                  >
                    <SelectTrigger className={cn(
                      "mt-1 bg-slate-800/50 border-slate-700 text-white",
                      formErrors.accountId && "border-red-500"
                    )}>
                      <SelectValue placeholder="یک حساب ترید انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      {tradingAccounts.length === 0 ? (
                        <div className="p-3 text-slate-400 text-sm">حساب تریدی یافت نشد</div>
                      ) : (
                        tradingAccounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id.toString()} className="text-white">
                            {acc.name} ({acc.currency})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {formErrors.accountId && (
                    <p className="text-xs text-red-400 mt-1">{formErrors.accountId}</p>
                  )}
                </div>

                {/* مبلغ و تاریخ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400">مبلغ *</Label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => { setAmount(e.target.value); if (formErrors.amount) setFormErrors({...formErrors, amount: undefined}) }}
                      placeholder="0.00"
                      className={cn(
                        "mt-1 bg-slate-800/50 border-slate-700 text-white",
                        formErrors.amount && "border-red-500"
                      )}
                    />
                    {formErrors.amount && (
                      <p className="text-xs text-red-400 mt-1">{formErrors.amount}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-slate-400">تاریخ *</Label>
                    <Input
                      type="text"
                      value={date}
                      onChange={(e) => { setDate(e.target.value); if (formErrors.date) setFormErrors({...formErrors, date: undefined}) }}
                      className={cn(
                        "mt-1 bg-slate-800/50 border-slate-700 text-white",
                        formErrors.date && "border-red-500"
                      )}
                    />
                    {formErrors.date && (
                      <p className="text-xs text-red-400 mt-1">{formErrors.date}</p>
                    )}
                  </div>
                </div>

                {/* توضیحات */}
                <div>
                  <Label className="text-slate-400">توضیحات (اختیاری)</Label>
                  <Input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="مثلاً: سود ترید BTC..."
                    className="mt-1 bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-5 h-5" />
                  {isSubmitting ? 'در حال ثبت...' : 'ثبت فعالیت'}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* لیست فعالیت‌ها */}
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/30">
            <CardHeader>
              <CardTitle className="text-white text-lg font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  فعالیت‌ها
                </span>
                <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded-full">
                  {filteredActivities.length} مورد
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {/* فیلترها */}
              <div className="flex flex-wrap gap-2 mb-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="flex-1 min-w-[80px] px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-white text-xs outline-none"
                >
                  <option value="all">همه</option>
                  <option value="profit">سود</option>
                  <option value="loss">ضرر</option>
                  <option value="deposit">واریز</option>
                  <option value="withdraw">برداشت</option>
                </select>
                
                <select
                  value={filterAccount}
                  onChange={(e) => setFilterAccount(e.target.value)}
                  className="flex-1 min-w-[80px] px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-white text-xs outline-none"
                >
                  <option value="all">همه حساب‌ها</option>
                  {tradingAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>

                <div className="flex items-center gap-1 flex-1 min-w-[100px] px-3 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجو..."
                    className="bg-transparent border-none outline-none text-white text-xs w-full"
                  />
                </div>
              </div>

              {/* لیست */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredActivities.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Inbox className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">هیچ فعالیتی یافت نشد</p>
                  </div>
                ) : (
                  filteredActivities.map((activity) => {
                    const isProfit = activity.type === 'profit'
                    const isLoss = activity.type === 'loss'
                    const isDeposit = activity.type === 'deposit'
                    const isWithdraw = activity.type === 'withdraw'
                    const color = isProfit ? 'emerald' : isLoss ? 'red' : isDeposit ? 'blue' : 'amber'
                    const Icon = isProfit ? TrendingUp : isLoss ? TrendingDown : isDeposit ? ArrowUpCircle : ArrowDownCircle
                    
                    return (
                      <div key={activity.id} className="p-3 rounded-xl bg-slate-800/20 hover:bg-slate-800/40 transition-all group">
                        {editingId === activity.id ? (
                          <div className="space-y-2">
                            <select
                              value={editForm.type}
                              onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                              className="w-full p-2 rounded-xl bg-slate-800/50 border border-slate-700 text-white text-sm outline-none"
                            >
                              <option value="profit">سود</option>
                              <option value="loss">ضرر</option>
                              <option value="deposit">واریز</option>
                              <option value="withdraw">برداشت</option>
                            </select>
                            <input
                              type="number"
                              value={editForm.amount}
                              onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                              className="w-full p-2 rounded-xl bg-slate-800/50 border border-slate-700 text-white text-sm outline-none"
                            />
                            <input
                              type="text"
                              value={editForm.date}
                              onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                              className="w-full p-2 rounded-xl bg-slate-800/50 border border-slate-700 text-white text-sm outline-none"
                            />
                            <div className="flex gap-2">
                              <button onClick={handleSaveEdit} className="flex-1 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm font-bold">
                                ذخیره
                              </button>
                              <button onClick={handleCancelEdit} className="flex-1 py-1.5 rounded-xl bg-slate-800/50 text-slate-400 text-sm font-bold">
                                انصراف
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "p-2 rounded-xl",
                                color === 'emerald' && "bg-emerald-500/10",
                                color === 'red' && "bg-red-500/10",
                                color === 'blue' && "bg-blue-500/10",
                                color === 'amber' && "bg-amber-500/10",
                              )}>
                                <Icon className={cn(
                                  "w-4 h-4",
                                  color === 'emerald' && "text-emerald-400",
                                  color === 'red' && "text-red-400",
                                  color === 'blue' && "text-blue-400",
                                  color === 'amber' && "text-amber-400",
                                )} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-sm truncate">
                                  {activity.description || 'بدون توضیحات'}
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                  {getAccountInfo(activity.account_id)} • {activity.date}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className={cn(
                                  "font-black text-sm",
                                  color === 'emerald' && "text-emerald-400",
                                  color === 'red' && "text-red-400",
                                  color === 'blue' && "text-blue-400",
                                  color === 'amber' && "text-amber-400",
                                )}>
                                  {isLoss || isWithdraw ? '-' : '+'}{formatNumber(activity.amount)}
                                </p>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleEdit(activity)} className="p-1.5 rounded-lg hover:bg-slate-800/50">
                                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                                  </button>
                                  <button onClick={() => handleDelete(activity)} className="p-1.5 rounded-lg hover:bg-red-500/10">
                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}