import { useState, useMemo, useEffect, useCallback } from 'react'
import { 
  CreditCard, Wallet, TrendingDown, Plus, Search, Edit3, Trash2, 
  CheckCircle2, ChevronDown, ChevronUp, User,
  Building2, Bell, BellRing, BellOff,
  RefreshCw, Inbox
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Progress } from '../components/ui/progress'
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
const SUBSCRIPTION_CYCLES = [
  { value: 'monthly', label: 'ماهانه' },
  { value: 'yearly', label: 'سالانه' },
  { value: 'weekly', label: 'هفتگی' },
  { value: 'quarterly', label: 'سه‌ماهه' },
]

// ==================== کامپوننت اصلی ====================
export default function Loans() {
  // ==================== State ====================
  const [loans, setLoans] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [activeTab, setActiveTab] = useState('loans')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentItem, setPaymentItem] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [formData, setFormData] = useState({})

  // ==================== دریافت داده از دیتابیس ====================
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const invoke = getInvoke()
      const [loansData, subsData, debtsData] = await Promise.all([
        invoke('get_loans'),
        invoke('get_subscriptions'),
        invoke('get_debts'),
      ])
      setLoans(loansData || [])
      setSubscriptions(subsData || [])
      setDebts(debtsData || [])
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

  // ==================== محاسبات آماری ====================
  const totalLoans = loans.reduce((sum, l) => sum + l.remaining_amount, 0)
  const totalSubscriptionsMonthly = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => {
      const monthly = s.cycle === 'yearly' ? s.amount / 12 : 
                      s.cycle === 'quarterly' ? s.amount / 3 :
                      s.cycle === 'weekly' ? s.amount * 4 : s.amount
      return sum + monthly
    }, 0)
  const totalDebts = debts.reduce((sum, d) => sum + d.remaining_amount, 0)

  // ==================== فیلترها ====================
  const filteredLoans = loans.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredSubscriptions = subscriptions.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredDebts = debts.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // ==================== توابع CRUD وام‌ها ====================
  const openAddLoan = () => {
    setEditingItem(null)
    setFormData({
      name: '', bankName: '', totalAmount: '', remainingAmount: '',
      interestRate: '18', monthlyPayment: '', startDate: getPersianDate(),
      endDate: '', totalInstallments: '', paidInstallments: '0', note: ''
    })
    setShowDialog(true)
  }

  const openEditLoan = (loan) => {
    setEditingItem({ ...loan, type: 'loan' })
    setFormData({
      name: loan.name,
      bankName: loan.bank_name || '',
      totalAmount: loan.total_amount.toString(),
      remainingAmount: loan.remaining_amount.toString(),
      interestRate: loan.interest_rate.toString(),
      monthlyPayment: loan.monthly_payment.toString(),
      startDate: loan.start_date,
      endDate: loan.end_date || '',
      totalInstallments: loan.total_installments.toString(),
      paidInstallments: loan.paid_installments.toString(),
      note: loan.note || ''
    })
    setShowDialog(true)
  }

  const saveLoan = async () => {
    if (!formData.name || !formData.totalAmount || !formData.monthlyPayment) {
      toast.error('❌ لطفاً فیلدهای ضروری را پر کنید')
      return
    }
    setIsSubmitting(true)
    try {
      const invoke = getInvoke()
      const data = {
        name: formData.name,
        bankName: formData.bankName || null,                 // camelCase
        totalAmount: parseFloat(formData.totalAmount),       // camelCase
        remainingAmount: parseFloat(formData.remainingAmount || formData.totalAmount),
        interestRate: parseFloat(formData.interestRate || 0),
        monthlyPayment: parseFloat(formData.monthlyPayment),
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        totalInstallments: parseInt(formData.totalInstallments || 0),
        paidInstallments: parseInt(formData.paidInstallments || 0),
        note: formData.note || null
      }
      
      if (editingItem?.id) {
        await invoke('update_loan', { id: editingItem.id, ...data })
        toast.success('✅ وام با موفقیت ویرایش شد')
      } else {
        await invoke('add_loan', data)
        toast.success('✅ وام جدید با موفقیت اضافه شد')
      }
      await fetchData()
      setShowDialog(false)
    } catch (error) {
      console.error('Error saving loan:', error)
      toast.error('❌ خطا در ذخیره وام: ' + (error.message || ''))
    } finally {
      setIsSubmitting(false)
    }
  }

  const openPayLoan = (loan) => {
    setPaymentItem({ ...loan, itemType: 'loan' })
    setPaymentAmount(loan.monthly_payment.toString())
    setShowPaymentDialog(true)
  }

  const confirmPayLoan = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('❌ مبلغ نامعتبر است')
      return
    }
    setIsSubmitting(true)
    try {
      const invoke = getInvoke()
      await invoke('pay_loan_installment', { 
        id: paymentItem.id, 
        amount: parseFloat(paymentAmount) 
      })
      toast.success(`✅ قسط با موفقیت پرداخت شد`)
      await fetchData()
      setShowPaymentDialog(false)
      setPaymentItem(null)
    } catch (error) {
      console.error('Error paying loan:', error)
      toast.error('❌ خطا در پرداخت قسط')
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteLoan = async (id) => {
    try {
      const invoke = getInvoke()
      await invoke('delete_loan', { id })
      toast.success('✅ وام با موفقیت حذف شد')
      await fetchData()
    } catch (error) {
      console.error('Error deleting loan:', error)
      toast.error('❌ خطا در حذف وام')
    }
  }

  // ==================== توابع CRUD اشتراک‌ها ====================
  const openAddSubscription = () => {
    setEditingItem(null)
    setFormData({
      name: '', provider: '', amount: '', currency: 'USD',
      cycle: 'monthly', startDate: getPersianDate(),
      nextRenewal: '', status: 'active', note: ''
    })
    setShowDialog(true)
  }

  const openEditSubscription = (sub) => {
    setEditingItem({ ...sub, type: 'subscription' })
    setFormData({
      name: sub.name,
      provider: sub.provider || '',
      amount: sub.amount.toString(),
      currency: sub.currency,
      cycle: sub.cycle,
      startDate: sub.start_date,
      nextRenewal: sub.next_renewal,
      status: sub.status,
      note: sub.note || ''
    })
    setShowDialog(true)
  }

  const saveSubscription = async () => {
    if (!formData.name || !formData.amount) {
      toast.error('❌ لطفاً فیلدهای ضروری را پر کنید')
      return
    }
    setIsSubmitting(true)
    try {
      const invoke = getInvoke()
      const data = {
        name: formData.name,
        provider: formData.provider || null,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        cycle: formData.cycle,
        startDate: formData.startDate,
        nextRenewal: formData.nextRenewal,
        status: formData.status || 'active',
        note: formData.note || null
      }
      
      if (editingItem?.id) {
        await invoke('update_subscription', { id: editingItem.id, ...data })
        toast.success('✅ اشتراک با موفقیت ویرایش شد')
      } else {
        await invoke('add_subscription', data)
        toast.success('✅ اشتراک جدید با موفقیت اضافه شد')
      }
      await fetchData()
      setShowDialog(false)
    } catch (error) {
      console.error('Error saving subscription:', error)
      toast.error('❌ خطا در ذخیره اشتراک')
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteSubscription = async (id) => {
    try {
      const invoke = getInvoke()
      await invoke('delete_subscription', { id })
      toast.success('✅ اشتراک با موفقیت حذف شد')
      await fetchData()
    } catch (error) {
      console.error('Error deleting subscription:', error)
      toast.error('❌ خطا در حذف اشتراک')
    }
  }

  // ==================== توابع CRUD بدهی‌ها ====================
  const openAddDebt = () => {
    setEditingItem(null)
    setFormData({
      name: '', personName: '', totalAmount: '', remainingAmount: '',
      startDate: getPersianDate(), dueDate: '', note: ''
    })
    setShowDialog(true)
  }

  const openEditDebt = (debt) => {
    setEditingItem({ ...debt, type: 'debt' })
    setFormData({
      name: debt.name,
      personName: debt.person_name || '',
      totalAmount: debt.total_amount.toString(),
      remainingAmount: debt.remaining_amount.toString(),
      startDate: debt.start_date,
      dueDate: debt.due_date || '',
      note: debt.note || ''
    })
    setShowDialog(true)
  }

  const saveDebt = async () => {
    if (!formData.name || !formData.totalAmount) {
      toast.error('❌ لطفاً فیلدهای ضروری را پر کنید')
      return
    }
    setIsSubmitting(true)
    try {
      const invoke = getInvoke()
      const data = {
        name: formData.name,
        personName: formData.personName || null,
        totalAmount: parseFloat(formData.totalAmount),
        remainingAmount: parseFloat(formData.remainingAmount || formData.totalAmount),
        startDate: formData.startDate,
        dueDate: formData.dueDate || null,
        note: formData.note || null
      }
      
      if (editingItem?.id) {
        await invoke('update_debt', { id: editingItem.id, ...data })
        toast.success('✅ بدهی با موفقیت ویرایش شد')
      } else {
        await invoke('add_debt', data)
        toast.success('✅ بدهی جدید با موفقیت اضافه شد')
      }
      await fetchData()
      setShowDialog(false)
    } catch (error) {
      console.error('Error saving debt:', error)
      toast.error('❌ خطا در ذخیره بدهی')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openPayDebt = (debt) => {
    setPaymentItem({ ...debt, itemType: 'debt' })
    setPaymentAmount(debt.remaining_amount.toString())
    setShowPaymentDialog(true)
  }

  const confirmPayDebt = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('❌ مبلغ نامعتبر است')
      return
    }
    setIsSubmitting(true)
    try {
      const invoke = getInvoke()
      await invoke('pay_debt', { 
        id: paymentItem.id, 
        amount: parseFloat(paymentAmount) 
      })
      toast.success(`✅ پرداخت با موفقیت ثبت شد`)
      await fetchData()
      setShowPaymentDialog(false)
      setPaymentItem(null)
    } catch (error) {
      console.error('Error paying debt:', error)
      toast.error('❌ خطا در ثبت پرداخت')
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteDebt = async (id) => {
    try {
      const invoke = getInvoke()
      await invoke('delete_debt', { id })
      toast.success('✅ بدهی با موفقیت حذف شد')
      await fetchData()
    } catch (error) {
      console.error('Error deleting debt:', error)
      toast.error('❌ خطا در حذف بدهی')
    }
  }

  // ==================== توابع تنظیم یادآور (ساده) ====================
  const setupLoanReminder = (loan) => {
    toast.info(`🔔 یادآور برای وام "${loan.name}" تنظیم شد`)
  }

  const setupSubscriptionReminder = (sub) => {
    toast.info(`🔔 یادآور برای اشتراک "${sub.name}" تنظیم شد`)
  }

  const setupDebtReminder = (debt) => {
    toast.info(`🔔 یادآور برای بدهی "${debt.name}" تنظیم شد`)
  }

  // ==================== توابع عمومی ====================
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleDelete = (type, id) => {
    if (confirm('آیا از حذف این مورد مطمئن هستید؟')) {
      if (type === 'loan') deleteLoan(id)
      else if (type === 'subscription') deleteSubscription(id)
      else if (type === 'debt') deleteDebt(id)
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
        <div className="grid grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 animate-pulse">
              <div className="h-12 w-12 rounded-xl bg-slate-800/50 mb-3" />
              <div className="h-4 w-24 bg-slate-800/50 mb-2" />
              <div className="h-8 w-36 bg-slate-800/50" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ==================== رندر اصلی ====================
  return (
    <div className="p-8 space-y-8 animate-fade-in-up bg-grid-ultra min-h-screen" dir="rtl">
      {/* ==================== هدر ==================== */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            💰 وام‌ها، اشتراک‌ها و بدهی‌ها
          </h1>
          <p className="text-base text-slate-400 mt-2">مدیریت تعهدات مالی شما</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all"
            title="بروزرسانی"
          >
            <RefreshCw className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>
      </div>

      {/* ==================== کارت‌های خلاصه ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">مانده وام‌ها</p>
              <p className="text-xl font-black text-white font-mono">{formatNumber(totalLoans)} <span className="text-xs text-slate-400">ریال</span></p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10">
              <Bell className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">اشتراک‌های ماهانه</p>
              <p className="text-xl font-black text-white font-mono">{formatNumber(totalSubscriptionsMonthly.toFixed(2))} <span className="text-xs text-slate-400">USD</span></p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10">
              <User className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">مانده بدهی‌ها</p>
              <p className="text-xl font-black text-white font-mono">{formatNumber(totalDebts)} <span className="text-xs text-slate-400">ریال</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== تب‌ها ==================== */}
      <div className="flex flex-wrap gap-2 md:gap-3">
        <Button
          variant={activeTab === 'loans' ? 'default' : 'outline'}
          onClick={() => { setActiveTab('loans'); setSearchQuery('') }}
          className={cn(
            "transition-all",
            activeTab === 'loans' 
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0" 
              : "border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
          )}
        >
          <Building2 className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">وام‌ها</span>
          <span className="sm:hidden">وام</span>
          <span className="text-xs bg-slate-700/50 px-1.5 py-0.5 rounded-full">{loans.length}</span>
        </Button>
        <Button
          variant={activeTab === 'subscriptions' ? 'default' : 'outline'}
          onClick={() => { setActiveTab('subscriptions'); setSearchQuery('') }}
          className={cn(
            "transition-all",
            activeTab === 'subscriptions' 
              ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0" 
              : "border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
          )}
        >
          <Bell className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">اشتراک‌ها</span>
          <span className="sm:hidden">اشتراک</span>
          <span className="text-xs bg-slate-700/50 px-1.5 py-0.5 rounded-full">{subscriptions.length}</span>
        </Button>
        <Button
          variant={activeTab === 'debts' ? 'default' : 'outline'}
          onClick={() => { setActiveTab('debts'); setSearchQuery('') }}
          className={cn(
            "transition-all",
            activeTab === 'debts' 
              ? "bg-gradient-to-r from-red-500 to-red-600 text-white border-0" 
              : "border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
          )}
        >
          <User className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">بدهی‌ها</span>
          <span className="sm:hidden">بدهی</span>
          <span className="text-xs bg-slate-700/50 px-1.5 py-0.5 rounded-full">{debts.length}</span>
        </Button>
      </div>

      {/* ==================== جستجو و دکمه افزودن ==================== */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/30 border border-slate-700">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو..."
            className="bg-transparent border-none outline-none text-white text-sm w-full"
          />
        </div>
        <Button 
          onClick={activeTab === 'loans' ? openAddLoan : activeTab === 'subscriptions' ? openAddSubscription : openAddDebt}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'loans' ? 'افزودن وام' : activeTab === 'subscriptions' ? 'افزودن اشتراک' : 'افزودن بدهی'}
        </Button>
      </div>

      {/* ==================== لیست وام‌ها ==================== */}
      {activeTab === 'loans' && (
        <div className="space-y-4">
          {filteredLoans.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Inbox className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-bold text-white">هیچ وامی یافت نشد</p>
              <p className="text-sm mt-1">برای شروع، یک وام جدید اضافه کنید</p>
            </div>
          ) : (
            filteredLoans.map(loan => {
              const progress = loan.total_installments > 0 ? (loan.paid_installments / loan.total_installments) * 100 : 0
              const isPaid = loan.remaining_amount <= 0
              const isExpanded = expandedId === `loan-${loan.id}`

              return (
                <div key={loan.id} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 hover:bg-slate-900/50 transition-all group">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(`loan-${loan.id}`)}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2.5 rounded-xl bg-blue-500/10 flex-shrink-0">
                        <Building2 className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-white font-bold text-lg truncate">{loan.name}</h4>
                          {isPaid && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">تسویه شده</span>}
                          {!isPaid && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">فعال</span>}
                        </div>
                        <p className="text-sm text-slate-400 mt-1 truncate">
                          {loan.bank_name && `${loan.bank_name} • `}
                          نرخ بهره: {loan.interest_rate}% • قسط ماهانه: {formatNumber(loan.monthly_payment)} ریال
                        </p>
                      </div>
                      <div className="text-left flex-shrink-0">
                        <p className="text-xs text-slate-400">مانده بدهی</p>
                        <p className={`text-xl font-black font-mono ${isPaid ? 'text-emerald-400' : 'text-white'}`}>
                          {formatNumber(loan.remaining_amount)}
                        </p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t border-slate-800 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-slate-400 text-xs">مبلغ کل وام</p>
                          <p className="text-white font-bold font-mono">{formatNumber(loan.total_amount)} ریال</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">اقساط پرداختی</p>
                          <p className="text-white font-bold font-mono">{loan.paid_installments} از {loan.total_installments}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">تاریخ شروع</p>
                          <p className="text-white font-bold font-mono">{loan.start_date}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">تاریخ پایان</p>
                          <p className="text-white font-bold font-mono">{loan.end_date || '-'}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">پیشرفت پرداخت</span>
                          <span className="text-white font-bold">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-1000" style={{ width: `${Math.min(progress, 100)}%` }} />
                        </div>
                      </div>

                      {loan.note && <p className="text-xs text-slate-500">📝 {loan.note}</p>}

                      <div className="flex flex-wrap gap-2 pt-2">
                        {!isPaid && (
                          <>
                            <Button 
                              onClick={() => openPayLoan(loan)}
                              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              پرداخت قسط
                            </Button>
                            <Button 
                              onClick={() => setupLoanReminder(loan)}
                              className="border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2"
                            >
                              <BellRing className="w-4 h-4" />
                              تنظیم یادآور
                            </Button>
                          </>
                        )}
                        <Button 
                          onClick={() => openEditLoan(loan)}
                          className="border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          ویرایش
                        </Button>
                        <Button 
                          onClick={() => handleDelete('loan', loan.id)}
                          className="border border-red-500/30 hover:border-red-500 text-red-400 hover:text-red-300 px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2"
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

      {/* ==================== لیست اشتراک‌ها ==================== */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Inbox className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-bold text-white">هیچ اشتراکی یافت نشد</p>
              <p className="text-sm mt-1">برای شروع، یک اشتراک جدید اضافه کنید</p>
            </div>
          ) : (
            filteredSubscriptions.map(sub => {
              const isExpanded = expandedId === `sub-${sub.id}`
              const cycleLabel = SUBSCRIPTION_CYCLES.find(c => c.value === sub.cycle)?.label || sub.cycle

              return (
                <div key={sub.id} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 hover:bg-slate-900/50 transition-all group">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(`sub-${sub.id}`)}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2.5 rounded-xl bg-purple-500/10 flex-shrink-0">
                        <Bell className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-white font-bold text-lg truncate">{sub.name}</h4>
                          {sub.status === 'cancelled' && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">لغو شده</span>}
                          {sub.status === 'active' && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">فعال</span>}
                        </div>
                        <p className="text-sm text-slate-400 mt-1 truncate">
                          {sub.provider && `${sub.provider} • `}
                          {formatNumber(sub.amount)} {sub.currency} / {cycleLabel}
                        </p>
                      </div>
                      <div className="text-left flex-shrink-0">
                        <p className="text-xs text-slate-400">تمدید بعدی</p>
                        <p className="text-xl font-black text-white font-mono">{sub.next_renewal || '-'}</p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t border-slate-800 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-slate-400 text-xs">ارائه‌دهنده</p>
                          <p className="text-white font-bold">{sub.provider || '-'}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">مبلغ دوره‌ای</p>
                          <p className="text-white font-bold font-mono">{formatNumber(sub.amount)} {sub.currency}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">تاریخ شروع</p>
                          <p className="text-white font-bold font-mono">{sub.start_date}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">دوره پرداخت</p>
                          <p className="text-white font-bold">{cycleLabel}</p>
                        </div>
                      </div>

                      {sub.note && <p className="text-xs text-slate-500">📝 {sub.note}</p>}

                      <div className="flex flex-wrap gap-2 pt-2">
                        {sub.status === 'active' && (
                          <Button 
                            onClick={() => setupSubscriptionReminder(sub)}
                            className="border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2"
                          >
                            <BellRing className="w-4 h-4" />
                            تنظیم یادآور
                          </Button>
                        )}
                        <Button 
                          onClick={() => openEditSubscription(sub)}
                          className="border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          ویرایش
                        </Button>
                        <Button 
                          onClick={() => handleDelete('subscription', sub.id)}
                          className="border border-red-500/30 hover:border-red-500 text-red-400 hover:text-red-300 px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2"
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

      {/* ==================== لیست بدهی‌ها ==================== */}
      {activeTab === 'debts' && (
        <div className="space-y-4">
          {filteredDebts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Inbox className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-bold text-white">هیچ بدهی یافت نشد</p>
              <p className="text-sm mt-1">برای شروع، یک بدهی جدید اضافه کنید</p>
            </div>
          ) : (
            filteredDebts.map(debt => {
              const isExpanded = expandedId === `debt-${debt.id}`
              const isPaid = debt.remaining_amount <= 0
              const progress = debt.total_amount > 0 ? ((debt.total_amount - debt.remaining_amount) / debt.total_amount) * 100 : 0

              return (
                <div key={debt.id} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 hover:bg-slate-900/50 transition-all group">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(`debt-${debt.id}`)}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2.5 rounded-xl bg-red-500/10 flex-shrink-0">
                        <User className="w-6 h-6 text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-white font-bold text-lg truncate">{debt.name}</h4>
                          {isPaid && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">تسویه شده</span>}
                          {!isPaid && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">فعال</span>}
                        </div>
                        <p className="text-sm text-slate-400 mt-1 truncate">
                          {debt.person_name && `به: ${debt.person_name} • `}
                          سررسید: {debt.due_date || '-'}
                        </p>
                      </div>
                      <div className="text-left flex-shrink-0">
                        <p className="text-xs text-slate-400">مانده بدهی</p>
                        <p className={`text-xl font-black font-mono ${isPaid ? 'text-emerald-400' : 'text-white'}`}>
                          {formatNumber(debt.remaining_amount)}
                        </p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t border-slate-800 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-slate-400 text-xs">مبلغ کل بدهی</p>
                          <p className="text-white font-bold font-mono">{formatNumber(debt.total_amount)} ریال</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">تاریخ شروع</p>
                          <p className="text-white font-bold font-mono">{debt.start_date}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">تاریخ سررسید</p>
                          <p className="text-white font-bold font-mono">{debt.due_date || '-'}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">پیشرفت پرداخت</span>
                          <span className="text-white font-bold">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-1000" style={{ width: `${Math.min(progress, 100)}%` }} />
                        </div>
                      </div>

                      {debt.note && <p className="text-xs text-slate-500">📝 {debt.note}</p>}

                      <div className="flex flex-wrap gap-2 pt-2">
                        {!isPaid && (
                          <>
                            <Button 
                              onClick={() => openPayDebt(debt)}
                              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              ثبت پرداخت
                            </Button>
                            {debt.due_date && (
                              <Button 
                                onClick={() => setupDebtReminder(debt)}
                                className="border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2"
                              >
                                <BellRing className="w-4 h-4" />
                                تنظیم یادآور
                              </Button>
                            )}
                          </>
                        )}
                        <Button 
                          onClick={() => openEditDebt(debt)}
                          className="border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          ویرایش
                        </Button>
                        <Button 
                          onClick={() => handleDelete('debt', debt.id)}
                          className="border border-red-500/30 hover:border-red-500 text-red-400 hover:text-red-300 px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2"
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

      {/* ==================== Dialog افزودن/ویرایش ==================== */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="border-slate-800 bg-slate-900 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-right text-2xl font-bold">
              {editingItem?.type === 'loan' ? (editingItem.id ? '✏️ ویرایش وام' : '➕ وام جدید') :
               editingItem?.type === 'subscription' ? (editingItem.id ? '✏️ ویرایش اشتراک' : '➕ اشتراک جدید') :
               editingItem?.type === 'debt' ? (editingItem.id ? '✏️ ویرایش بدهی' : '➕ بدهی جدید') :
               '➕ افزودن مورد جدید'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[65vh] overflow-y-auto">
            {/* نام */}
            <div>
              <Label className="text-slate-400">نام *</Label>
              <Input 
                value={formData.name || ''} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder={activeTab === 'loans' ? 'وام خرید خودرو' : activeTab === 'subscriptions' ? 'ChatGPT Plus' : 'بدهی به علی'}
                className="mt-1 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>

            {/* فیلدهای وام */}
            {activeTab === 'loans' && (
              <>
                <div>
                  <Label className="text-slate-400">نام بانک</Label>
                  <Input 
                    value={formData.bankName || ''} 
                    onChange={(e) => setFormData({...formData, bankName: e.target.value})} 
                    placeholder="بانک ملی"
                    className="mt-1 bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400">مبلغ کل وام (ریال) *</Label>
                    <Input type="number" value={formData.totalAmount || ''} onChange={(e) => setFormData({...formData, totalAmount: e.target.value})} placeholder="200000000" className="mt-1 bg-slate-800/50 border-slate-700 text-white font-mono" />
                  </div>
                  <div>
                    <Label className="text-slate-400">مانده فعلی (ریال)</Label>
                    <Input type="number" value={formData.remainingAmount || ''} onChange={(e) => setFormData({...formData, remainingAmount: e.target.value})} placeholder="150000000" className="mt-1 bg-slate-800/50 border-slate-700 text-white font-mono" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400">نرخ بهره سالانه (%)</Label>
                    <Input type="number" value={formData.interestRate || ''} onChange={(e) => setFormData({...formData, interestRate: e.target.value})} placeholder="18" className="mt-1 bg-slate-800/50 border-slate-700 text-white font-mono" />
                  </div>
                  <div>
                    <Label className="text-slate-400">قسط ماهانه (ریال) *</Label>
                    <Input type="number" value={formData.monthlyPayment || ''} onChange={(e) => setFormData({...formData, monthlyPayment: e.target.value})} placeholder="8500000" className="mt-1 bg-slate-800/50 border-slate-700 text-white font-mono" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400">تاریخ شروع</Label>
                    <Input value={formData.startDate || ''} onChange={(e) => setFormData({...formData, startDate: e.target.value})} placeholder="1403/01/01" className="mt-1 bg-slate-800/50 border-slate-700 text-white font-mono" />
                  </div>
                  <div>
                    <Label className="text-slate-400">تاریخ پایان</Label>
                    <Input value={formData.endDate || ''} onChange={(e) => setFormData({...formData, endDate: e.target.value})} placeholder="1404/01/01" className="mt-1 bg-slate-800/50 border-slate-700 text-white font-mono" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400">تعداد کل اقساط</Label>
                    <Input type="number" value={formData.totalInstallments || ''} onChange={(e) => setFormData({...formData, totalInstallments: e.target.value})} placeholder="24" className="mt-1 bg-slate-800/50 border-slate-700 text-white font-mono" />
                  </div>
                  <div>
                    <Label className="text-slate-400">اقساط پرداخت شده</Label>
                    <Input type="number" value={formData.paidInstallments || ''} onChange={(e) => setFormData({...formData, paidInstallments: e.target.value})} placeholder="0" className="mt-1 bg-slate-800/50 border-slate-700 text-white font-mono" />
                  </div>
                </div>
              </>
            )}

            {/* فیلدهای اشتراک */}
            {activeTab === 'subscriptions' && (
              <>
                <div>
                  <Label className="text-slate-400">ارائه‌دهنده</Label>
                  <Input 
                    value={formData.provider || ''} 
                    onChange={(e) => setFormData({...formData, provider: e.target.value})} 
                    placeholder="OpenAI"
                    className="mt-1 bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400">مبلغ *</Label>
                    <Input type="number" value={formData.amount || ''} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="20" className="mt-1 bg-slate-800/50 border-slate-700 text-white font-mono" />
                  </div>
                  <div>
                    <Label className="text-slate-400">واحد ارز</Label>
                    <Select value={formData.currency || 'USD'} onValueChange={(v) => setFormData({...formData, currency: v})}>
                      <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        <SelectItem value="USD" className="text-white">USD (دلار)</SelectItem>
                        <SelectItem value="EUR" className="text-white">EUR (یورو)</SelectItem>
                        <SelectItem value="IRR" className="text-white">IRR (ریال)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-slate-400">دوره پرداخت</Label>
                  <Select value={formData.cycle || 'monthly'} onValueChange={(v) => setFormData({...formData, cycle: v})}>
                    <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      {SUBSCRIPTION_CYCLES.map(c => (
                        <SelectItem key={c.value} value={c.value} className="text-white">{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400">تاریخ شروع</Label>
                    <Input value={formData.startDate || ''} onChange={(e) => setFormData({...formData, startDate: e.target.value})} placeholder="1403/01/01" className="mt-1 bg-slate-800/50 border-slate-700 text-white font-mono" />
                  </div>
                  <div>
                    <Label className="text-slate-400">تمدید بعدی</Label>
                    <Input value={formData.nextRenewal || ''} onChange={(e) => setFormData({...formData, nextRenewal: e.target.value})} placeholder="1403/05/01" className="mt-1 bg-slate-800/50 border-slate-700 text-white font-mono" />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-400">وضعیت</Label>
                  <Select value={formData.status || 'active'} onValueChange={(v) => setFormData({...formData, status: v})}>
                    <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      <SelectItem value="active" className="text-white">فعال</SelectItem>
                      <SelectItem value="cancelled" className="text-white">لغو شده</SelectItem>
                      <SelectItem value="paused" className="text-white">متوقف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* فیلدهای بدهی */}
            {activeTab === 'debts' && (
              <>
                <div>
                  <Label className="text-slate-400">نام شخص/طرف بدهی</Label>
                  <Input 
                    value={formData.personName || ''} 
                    onChange={(e) => setFormData({...formData, personName: e.target.value})} 
                    placeholder="علی محمدی"
                    className="mt-1 bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400">مبلغ کل بدهی (ریال) *</Label>
                    <Input type="number" value={formData.totalAmount || ''} onChange={(e) => setFormData({...formData, totalAmount: e.target.value})} placeholder="50000000" className="mt-1 bg-slate-800/50 border-slate-700 text-white font-mono" />
                  </div>
                  <div>
                    <Label className="text-slate-400">مانده فعلی (ریال)</Label>
                    <Input type="number" value={formData.remainingAmount || ''} onChange={(e) => setFormData({...formData, remainingAmount: e.target.value})} placeholder="30000000" className="mt-1 bg-slate-800/50 border-slate-700 text-white font-mono" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400">تاریخ شروع</Label>
                    <Input value={formData.startDate || ''} onChange={(e) => setFormData({...formData, startDate: e.target.value})} placeholder="1403/01/01" className="mt-1 bg-slate-800/50 border-slate-700 text-white font-mono" />
                  </div>
                  <div>
                    <Label className="text-slate-400">تاریخ سررسید</Label>
                    <Input value={formData.dueDate || ''} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} placeholder="1403/10/01" className="mt-1 bg-slate-800/50 border-slate-700 text-white font-mono" />
                  </div>
                </div>
              </>
            )}

            {/* یادداشت */}
            <div>
              <Label className="text-slate-400">یادداشت (اختیاری)</Label>
              <Input 
                value={formData.note || ''} 
                onChange={(e) => setFormData({...formData, note: e.target.value})} 
                placeholder="توضیحات..."
                className="mt-1 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button onClick={() => setShowDialog(false)} className="bg-slate-800/50 hover:bg-slate-800 text-white transition-all px-6 py-2.5 rounded-xl">
              انصراف
            </Button>
            <Button 
              onClick={activeTab === 'loans' ? saveLoan : activeTab === 'subscriptions' ? saveSubscription : saveDebt}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'در حال ذخیره...' : (editingItem?.id ? 'ذخیره' : 'افزودن')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== Dialog پرداخت ==================== */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="border-slate-800 bg-slate-900 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right text-2xl font-bold">
              {paymentItem?.itemType === 'loan' ? '💰 پرداخت قسط وام' : '💰 ثبت پرداخت بدهی'}
            </DialogTitle>
            <DialogDescription className="text-right text-slate-400">
              {paymentItem?.itemType === 'loan' ? paymentItem.name : paymentItem?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-sm">مانده فعلی:</span>
                <span className="text-white font-black font-mono text-lg">
                  {formatNumber(paymentItem?.remaining_amount)} ریال
                </span>
              </div>
              {paymentItem?.itemType === 'loan' && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">قسط پیشنهادی:</span>
                  <span className="text-white font-bold font-mono">
                    {formatNumber(paymentItem?.monthly_payment)} ریال
                  </span>
                </div>
              )}
            </div>

            <div>
              <Label className="text-slate-400">مبلغ پرداختی (ریال)</Label>
              <Input 
                type="number"
                value={paymentAmount} 
                onChange={(e) => setPaymentAmount(e.target.value)} 
                placeholder="مبلغ را وارد کنید"
                className="mt-1 bg-slate-800/50 border-slate-700 text-white font-mono text-lg h-14"
              />
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button onClick={() => setShowPaymentDialog(false)} className="bg-slate-800/50 hover:bg-slate-800 text-white transition-all px-6 py-2.5 rounded-xl">
              انصراف
            </Button>
            <Button 
              onClick={paymentItem?.itemType === 'loan' ? confirmPayLoan : confirmPayDebt}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'در حال پرداخت...' : 'تأیید پرداخت'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}