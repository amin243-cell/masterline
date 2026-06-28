import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, PlusCircle, Clock, FileText, Trash2, Edit3, Check, X, Inbox, Search, Target, Percent, DollarSign, Wallet } from 'lucide-react'
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
import useStore from '../store/useStore'
import { getPersianDate, formatNumber, parseNumber } from '../lib/helpers'
import useConfirm from '../hooks/useConfirm'
import useAlert from '../hooks/useAlert'
import useDebounce from '../hooks/useDebounce'
import FormField from '../components/ui/FormField'
import LoadingButton from '../components/ui/LoadingButton'
import EmptyState from '../components/ui/EmptyState'

export default function Trading() {
  const { accounts, activities, addActivity, deleteActivity, updateActivity } = useStore()
  
  const tradingAccounts = accounts.filter(a => a.category === 'trading')
  
  const [type, setType] = useState('profit')
  const [accountId, setAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(getPersianDate())
  const [description, setDescription] = useState('')
  
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  
  const [formErrors, setFormErrors] = useState({})

  const { confirm, ConfirmComponent } = useConfirm()
  const { alert, AlertComponent } = useAlert()

  // ==================== آمار زنده ترید ====================
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
    
    // جمع کل واریزها و برداشت‌ها
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
      totalWithdrawals
    }
  }, [activities])

  // فیلتر فعالیت‌ها
  const filteredActivities = activities.filter(a => {
    const account = accounts.find(acc => acc.id === a.accountId)
    const accountName = account ? account.name.toLowerCase() : ''
    const desc = a.description ? a.description.toLowerCase() : ''
    return (
      accountName.includes(debouncedSearchQuery.toLowerCase()) ||
      desc.includes(debouncedSearchQuery.toLowerCase())
    )
  })

  const validateForm = () => {
    const errors = {}
    if (!accountId) errors.accountId = 'انتخاب حساب ترید الزامی است'
    if (!amount || parseFloat(amount) <= 0) errors.amount = 'مبلغ باید بیشتر از صفر باشد'
    if (!date) errors.date = 'تاریخ الزامی است'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/,/g, '')
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value ? formatNumber(parseFloat(value)) : '')
      if (formErrors.amount) setFormErrors({...formErrors, amount: undefined})
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      await alert({
        title: 'خطا در اعتبارسنجی',
        message: 'لطفاً فیلدهای الزامی را به درستی پر کنید',
        type: 'error'
      })
      return
    }

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    addActivity({
      type,
      accountId: parseInt(accountId),
      amount: parseNumber(amount),
      date,
      description
    })

    await alert({
      title: 'موفقیت',
      message: 'فعالیت با موفقیت ثبت شد',
      type: 'success'
    })

    setAmount('')
    setDescription('')
    setAccountId('')
    setFormErrors({})
    setIsSubmitting(false)
  }

  // ==================== ویرایش (رفع باگ کامل) ====================
  const handleEdit = (activity) => {
    setEditingId(activity.id)
    setEditForm({
      type: activity.type,
      accountId: activity.accountId.toString(),
      amount: formatNumber(activity.amount),
      date: activity.date,
      description: activity.description || ''
    })
  }

  const handleSaveEdit = async () => {
    if (!editForm.amount || parseFloat(editForm.amount) <= 0) {
      await alert({
        title: 'خطا',
        message: 'مبلغ باید بیشتر از صفر باشد',
        type: 'error'
      })
      return
    }

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    updateActivity(editingId, {
      type: editForm.type,
      accountId: parseInt(editForm.accountId),
      amount: parseNumber(editForm.amount),
      date: editForm.date,
      description: editForm.description
    })

    await alert({
      title: 'موفقیت',
      message: 'فعالیت با موفقیت ویرایش شد',
      type: 'success'
    })

    setEditingId(null)
    setEditForm({})
    setIsSubmitting(false)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  // ==================== حذف (رفع باگ کامل) ====================
  const handleDelete = async (activity) => {
    const confirmed = await confirm({
      title: 'حذف فعالیت',
      message: `آیا از حذف این فعالیت مطمئن هستید؟ این عمل قابل بازگشت نیست.`,
      type: 'danger',
      confirmText: 'حذف',
      cancelText: 'انصراف'
    })
    
    if (confirmed) {
      deleteActivity(activity.id)
      await alert({
        title: 'حذف شد',
        message: 'فعالیت با موفقیت حذف شد',
        type: 'info'
      })
    }
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

  return (
    <div className="p-8 space-y-8 animate-fade-in-up bg-grid-ultra min-h-screen" dir="rtl">
      <ConfirmComponent />
      <AlertComponent />

      {/* هدر */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gradient-ultra">ثبت فعالیت ترید</h1>
          <p className="text-base text-slate-400 mt-3">سود، ضرر، واریز و برداشت خود را سریع ثبت کنید</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-800/50 border-2 border-slate-700/50 backdrop-blur-xl">
          <Clock className="w-5 h-5 text-slate-400" />
          <span className="text-sm text-slate-400">تاریخ:</span>
          <span className="text-sm font-bold text-gradient-ultra font-mono">{getPersianDate()}</span>
        </div>
      </div>

      {/* ==================== آمار زنده ترید ==================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Win Rate */}
        <div className="stat-card-ultra p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400">Win Rate</span>
          </div>
          <p className={`text-2xl font-black font-mono ${tradeStats.winRate >= 50 ? 'text-gradient-ultra' : 'text-gradient-danger'}`}>
            {tradeStats.winRate.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">{tradeStats.wins}W / {tradeStats.losses}L</p>
        </div>

        {/* Profit Factor */}
        <div className="stat-card-ultra p-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-400">Profit Factor</span>
          </div>
          <p className={`text-2xl font-black font-mono ${tradeStats.profitFactor >= 1 ? 'text-gradient-ultra' : 'text-gradient-danger'}`}>
            {tradeStats.profitFactor === Infinity ? '∞' : tradeStats.profitFactor.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-1">سود به ضرر</p>
        </div>

        {/* Total PnL */}
        <div className="stat-card-ultra p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-400">Total PnL</span>
          </div>
          <p className={`text-2xl font-black font-mono ${tradeStats.totalPnL >= 0 ? 'text-gradient-ultra' : 'text-gradient-danger'}`}>
            {tradeStats.totalPnL >= 0 ? '+' : ''}{formatNumber(tradeStats.totalPnL)}
          </p>
          <p className="text-xs text-slate-500 mt-1">سود خالص</p>
        </div>

        {/* Average Win */}
        <div className="stat-card-ultra p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400">Avg Win</span>
          </div>
          <p className="text-2xl font-black text-gradient-ultra font-mono">
            {formatNumber(tradeStats.avgWin.toFixed(2))}
          </p>
          <p className="text-xs text-slate-500 mt-1">میانگین سود</p>
        </div>

        {/* Average Loss */}
        <div className="stat-card-ultra p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-xs text-slate-400">Avg Loss</span>
          </div>
          <p className="text-2xl font-black text-gradient-danger font-mono">
            {formatNumber(tradeStats.avgLoss.toFixed(2))}
          </p>
          <p className="text-xs text-slate-500 mt-1">میانگین ضرر</p>
        </div>

        {/* Total Withdrawals (جایگزین Streak) */}
        <div className="stat-card-ultra p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400">جمع برداشت‌ها</span>
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">
            {formatNumber(tradeStats.totalWithdrawals.toFixed(2))}
          </p>
          <p className="text-xs text-slate-500 mt-1">واریز: {formatNumber(tradeStats.totalDeposits.toFixed(2))}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* فرم ثبت */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-ultra animate-fade-in-up delay-100">
            <CardHeader>
              <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-emerald-400" />
                ثبت فعالیت جدید
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <FormField label="نوع فعالیت" required>
                  <div className="grid grid-cols-4 gap-4">
                    {Object.entries(typeStyles).map(([key, style]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setType(key)}
                        className={`flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-300 ${
                          type === key ? style.active : style.inactive
                        }`}
                      >
                        <style.icon className="w-7 h-7" />
                        <span className={`text-sm ${type === key ? 'font-black' : 'font-bold'}`}>
                          {style.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="حساب ترید" error={formErrors.accountId} required>
                  <Select 
                    value={accountId} 
                    onValueChange={(v) => { setAccountId(v); if (formErrors.accountId) setFormErrors({...formErrors, accountId: undefined}) }}
                  >
                    <SelectTrigger className="input-ultra h-14">
                      <SelectValue placeholder="یک حساب ترید انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                      {tradingAccounts.length === 0 ? (
                        <div className="p-3 text-slate-400 text-sm">حساب تریدی یافت نشد</div>
                      ) : (
                        tradingAccounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id.toString()} className="text-white focus:bg-slate-800 rounded-xl">
                            {acc.name} ({acc.currency})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-1">فقط حساب‌های ترید نمایش داده می‌شوند</p>
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField label="مبلغ" error={formErrors.amount} required>
                    <Input
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="0.00"
                      className="input-ultra h-14 text-lg font-mono"
                    />
                  </FormField>
                  <FormField label="تاریخ" error={formErrors.date} required>
                    <div className="relative">
                      <Input
                        type="text"
                        value={date}
                        onChange={(e) => { setDate(e.target.value); if (formErrors.date) setFormErrors({...formErrors, date: undefined}) }}
                        className="input-ultra h-14 text-lg font-mono pl-12"
                      />
                      <Clock className="absolute left-4 top-4 w-6 h-6 text-emerald-400" />
                    </div>
                  </FormField>
                </div>

                <FormField label="توضیحات (اختیاری)">
                  <div className="relative">
                    <Input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="مثلاً: سود ترید BTC..."
                      className="input-ultra h-14 pl-12"
                    />
                    <FileText className="absolute left-4 top-4 w-6 h-6 text-slate-500" />
                  </div>
                </FormField>

                <LoadingButton 
                  type="submit"
                  loading={isSubmitting}
                  className="btn-ultra btn-ultra-primary w-full h-16 text-lg font-black"
                >
                  <PlusCircle className="w-6 h-6" />
                  ثبت فعالیت
                </LoadingButton>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* لیست فعالیت‌ها */}
        <div className="space-y-6">
          <Card className="card-ultra animate-fade-in-up delay-200">
            <CardHeader>
              <CardTitle className="text-white text-xl font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-400" />
                  فعالیت‌های اخیر
                </span>
                <span className="badge-ultra badge-info-ultra text-xs">
                  {activities.length} مورد
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="search-bar-ultra mb-4">
                <Search className="search-icon" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجو در فعالیت‌ها..."
                />
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar-ultra pl-2">
                {filteredActivities.length === 0 ? (
                  <EmptyState
                    icon={Inbox}
                    title={searchQuery ? 'فعالیتی یافت نشد' : 'هنوز فعالیتی ثبت نشده است'}
                    description={searchQuery ? 'عبارت جستجو را تغییر دهید' : 'اولین فعالیت خود را ثبت کنید'}
                    searchActive={!!searchQuery}
                  />
                ) : (
                  filteredActivities.map((activity) => (
                    <div key={activity.id} className="item-card-ultra p-4 group">
                      {editingId === activity.id ? (
                        <div className="space-y-3">
                          <Select value={editForm.type} onValueChange={(v) => setEditForm({...editForm, type: v})}>
                            <SelectTrigger className="input-ultra h-10 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                              <SelectItem value="profit" className="text-white">سود</SelectItem>
                              <SelectItem value="loss" className="text-white">ضرر</SelectItem>
                              <SelectItem value="deposit" className="text-white">واریز</SelectItem>
                              <SelectItem value="withdraw" className="text-white">برداشت</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="text"
                            value={editForm.amount}
                            onChange={handleAmountChange}
                            className="input-ultra h-10 text-sm font-mono"
                          />
                          <Input
                            type="text"
                            value={editForm.date}
                            onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                            className="input-ultra h-10 text-sm font-mono"
                          />
                          <div className="flex gap-2">
                            <LoadingButton 
                              onClick={handleSaveEdit} 
                              loading={isSubmitting}
                              className="btn-ultra btn-ultra-primary flex-1 h-10 text-sm"
                            >
                              <Check className="w-4 h-4 ml-1" /> ذخیره
                            </LoadingButton>
                            <Button 
                              onClick={handleCancelEdit} 
                              className="btn-ultra btn-ultra-secondary flex-1 h-10 text-sm"
                            >
                              <X className="w-4 h-4 ml-1" /> انصراف
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`stat-icon-ultra w-10 h-10 ${
                              activity.type === 'profit' ? 'bg-emerald-500/20' :
                              activity.type === 'loss' ? 'bg-red-500/20' :
                              activity.type === 'deposit' ? 'bg-blue-500/20' :
                              'bg-amber-500/20'
                            }`}>
                              {activity.type === 'profit' ? <TrendingUp className="w-5 h-5 text-emerald-400" /> :
                               activity.type === 'loss' ? <TrendingDown className="w-5 h-5 text-red-400" /> :
                               activity.type === 'deposit' ? <ArrowUpCircle className="w-5 h-5 text-blue-400" /> :
                               <ArrowDownCircle className="w-5 h-5 text-amber-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-bold text-sm truncate">{activity.description || 'بدون توضیحات'}</p>
                              <p className="text-xs text-slate-400 truncate mt-1">{getAccountInfo(activity.accountId)} • {activity.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className={`font-black text-base font-mono ${
                              activity.type === 'profit' ? 'text-gradient-ultra' :
                              activity.type === 'loss' ? 'text-gradient-danger' :
                              activity.type === 'deposit' ? 'text-gradient-blue' :
                              'text-amber-400'
                            }`}>
                              {activity.type === 'loss' || activity.type === 'withdraw' ? '-' : '+'}{formatNumber(activity.amount)}
                            </p>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleEdit(activity)}
                                className="btn-icon-ultra p-2"
                                title="ویرایش"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDelete(activity)}
                                className="btn-icon-ultra btn-icon-danger p-2"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}