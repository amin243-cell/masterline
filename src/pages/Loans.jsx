import { useState } from 'react'
import { 
  CreditCard, Wallet, TrendingDown, Plus, Search, Edit3, Trash2, 
  CheckCircle2, ChevronDown, ChevronUp, User,
  Building2, Bell, BellRing, BellOff
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
import useStore from '../store/useStore'
import { formatNumber, getPersianDate } from '../lib/helpers'
import Toast from '../components/ui/toast'
import { useNotifications } from '../hooks/useNotifications'

const SUBSCRIPTION_CYCLES = [
  { value: 'monthly', label: 'ماهانه' },
  { value: 'yearly', label: 'سالانه' },
  { value: 'weekly', label: 'هفتگی' },
  { value: 'quarterly', label: 'سه‌ماهه' },
]

export default function Loans() {
  const { 
    loans, subscriptions, debts,
    addLoan, deleteLoan, updateLoan, payLoanInstallment,
    addSubscription, deleteSubscription, updateSubscription,
    addDebt, deleteDebt, updateDebt, payDebt
  } = useStore()
  
  const { sendNotification, settings } = useNotifications()
  
  const [activeTab, setActiveTab] = useState('loans')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  const [toast, setToast] = useState(null)
  
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentItem, setPaymentItem] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState('')

  const [formData, setFormData] = useState({})

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  // ==================== توابع تنظیم یادآور وام ====================
  const setupLoanReminder = async (loan) => {
    try {
      // محاسبه روزهای قبل از سررسید
      const endDate = new Date(loan.endDate)
      const now = new Date()
      const daysUntilDue = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
      
      // دریافت تنظیمات یادآور وام از دیتابیس
      const loanSettings = settings?.loan_days?.split(',').map(Number) || [3, 1, 0]
      
      // بررسی آیا امروز یکی از روزهای یادآوری است
      if (!loanSettings.includes(daysUntilDue)) {
        showToast(`یادآور وام "${loan.name}" برای ${daysUntilDue} روز قبل از سررسید تنظیم شد`, 'success')
      }
      
      // ارسال اعلان تست
      await sendNotification(
        `🔔 یادآور وام: ${loan.name}`,
        `وام "${loan.name}" ${daysUntilDue === 0 ? 'امروز' : `${daysUntilDue} روز دیگر`} سررسید می‌شود. مبلغ قسط: ${formatNumber(loan.monthlyPayment)} ریال`,
        'loan',
        loan.id,
        'loan',
        loan.endDate
      )
      
      showToast(`یادآور برای وام "${loan.name}" تنظیم شد`, 'success')
    } catch (err) {
      console.error('Error setting loan reminder:', err)
      showToast('خطا در تنظیم یادآور وام', 'error')
    }
  }

  // ==================== توابع تنظیم یادآور اشتراک ====================
  const setupSubscriptionReminder = async (subscription) => {
    try {
      // محاسبه روزهای قبل از تمدید
      const renewalDate = new Date(subscription.nextRenewal)
      const now = new Date()
      const daysUntilRenewal = Math.ceil((renewalDate - now) / (1000 * 60 * 60 * 24))
      
      // ارسال اعلان تست
      await sendNotification(
        `🔔 یادآور اشتراک: ${subscription.name}`,
        `اشتراک "${subscription.name}" ${daysUntilRenewal === 0 ? 'امروز' : `${daysUntilRenewal} روز دیگر`} تمدید می‌شود. مبلغ: ${formatNumber(subscription.amount)} ${subscription.currency}`,
        'subscription',
        subscription.id,
        'subscription',
        subscription.nextRenewal
      )
      
      showToast(`یادآور برای اشتراک "${subscription.name}" تنظیم شد`, 'success')
    } catch (err) {
      console.error('Error setting subscription reminder:', err)
      showToast('خطا در تنظیم یادآور اشتراک', 'error')
    }
  }

  // ==================== توابع تنظیم یادآور بدهی ====================
  const setupDebtReminder = async (debt) => {
    try {
      if (!debt.dueDate) {
        showToast('برای تنظیم یادآور، تاریخ سررسید را وارد کنید', 'error')
        return
      }
      
      const dueDate = new Date(debt.dueDate)
      const now = new Date()
      const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
      
      await sendNotification(
        `🔔 یادآور بدهی: ${debt.name}`,
        `بدهی "${debt.name}" به ${debt.personName || 'طرف حساب'} ${daysUntilDue === 0 ? 'امروز' : `${daysUntilDue} روز دیگر`} سررسید می‌شود. مبلغ: ${formatNumber(debt.remainingAmount)} ریال`,
        'general',
        debt.id,
        'debt',
        debt.dueDate
      )
      
      showToast(`یادآور برای بدهی "${debt.name}" تنظیم شد`, 'success')
    } catch (err) {
      console.error('Error setting debt reminder:', err)
      showToast('خطا در تنظیم یادآور بدهی', 'error')
    }
  }

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
      name: loan.name, bankName: loan.bankName || '',
      totalAmount: loan.totalAmount.toString(),
      remainingAmount: loan.remainingAmount.toString(),
      interestRate: loan.interestRate.toString(),
      monthlyPayment: loan.monthlyPayment.toString(),
      startDate: loan.startDate, endDate: loan.endDate,
      totalInstallments: loan.totalInstallments.toString(),
      paidInstallments: loan.paidInstallments.toString(),
      note: loan.note || ''
    })
    setShowDialog(true)
  }

  const saveLoan = async () => {
    if (!formData.name || !formData.totalAmount || !formData.monthlyPayment) {
      showToast('لطفاً فیلدهای ضروری را پر کنید', 'error')
      return
    }
    const data = {
      name: formData.name,
      bankName: formData.bankName,
      totalAmount: parseFloat(formData.totalAmount),
      remainingAmount: parseFloat(formData.remainingAmount || formData.totalAmount),
      interestRate: parseFloat(formData.interestRate || 0),
      monthlyPayment: parseFloat(formData.monthlyPayment),
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalInstallments: parseInt(formData.totalInstallments || 0),
      paidInstallments: parseInt(formData.paidInstallments || 0),
      status: 'active',
      note: formData.note
    }
    
    let savedItem
    if (editingItem?.id) {
      updateLoan(editingItem.id, data)
      savedItem = { ...data, id: editingItem.id }
      showToast('وام با موفقیت ویرایش شد')
    } else {
      const newId = addLoan(data)
      savedItem = { ...data, id: newId }
      showToast('وام جدید با موفقیت اضافه شد')
      
      // ارسال اعلان برای وام جدید
      try {
        await sendNotification(
          '✅ وام جدید ثبت شد',
          `وام "${data.name}" به مبلغ ${formatNumber(data.totalAmount)} ریال ثبت شد`,
          'loan',
          newId,
          'loan',
          data.endDate
        )
      } catch (err) {
        console.error('Error sending notification for new loan:', err)
      }
    }
    setShowDialog(false)
  }

  const openPayLoan = (loan) => {
    setPaymentItem({ ...loan, itemType: 'loan' })
    setPaymentAmount(loan.monthlyPayment.toString())
    setShowPaymentDialog(true)
  }

  const confirmPayLoan = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      showToast('مبلغ نامعتبر است', 'error')
      return
    }
    payLoanInstallment(paymentItem.id, parseFloat(paymentAmount))
    showToast(`قسط ${formatNumber(parseFloat(paymentAmount))} ریال با موفقیت پرداخت شد`)
    
    // ارسال اعلان پس از پرداخت
    try {
      const remainingAmount = paymentItem.remainingAmount - parseFloat(paymentAmount)
      if (remainingAmount <= 0) {
        await sendNotification(
          '✅ وام تسویه شد',
          `وام "${paymentItem.name}" به طور کامل تسویه شد`,
          'loan',
          paymentItem.id,
          'loan',
          null
        )
      } else {
        await sendNotification(
          '💰 پرداخت قسط وام',
          `قسط وام "${paymentItem.name}" به مبلغ ${formatNumber(parseFloat(paymentAmount))} ریال پرداخت شد. مانده باقی‌مانده: ${formatNumber(remainingAmount)} ریال`,
          'loan',
          paymentItem.id,
          'loan',
          null
        )
      }
    } catch (err) {
      console.error('Error sending payment notification:', err)
    }
    
    setShowPaymentDialog(false)
    setPaymentItem(null)
  }

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
      name: sub.name, provider: sub.provider || '',
      amount: sub.amount.toString(), currency: sub.currency,
      cycle: sub.cycle, startDate: sub.startDate,
      nextRenewal: sub.nextRenewal, status: sub.status,
      note: sub.note || ''
    })
    setShowDialog(true)
  }

  const saveSubscription = async () => {
    if (!formData.name || !formData.amount) {
      showToast('لطفاً فیلدهای ضروری را پر کنید', 'error')
      return
    }
    const data = {
      name: formData.name,
      provider: formData.provider,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      cycle: formData.cycle,
      startDate: formData.startDate,
      nextRenewal: formData.nextRenewal,
      status: formData.status || 'active',
      note: formData.note
    }
    
    let savedItem
    if (editingItem?.id) {
      updateSubscription(editingItem.id, data)
      savedItem = { ...data, id: editingItem.id }
      showToast('اشتراک با موفقیت ویرایش شد')
    } else {
      const newId = addSubscription(data)
      savedItem = { ...data, id: newId }
      showToast('اشتراک جدید با موفقیت اضافه شد')
      
      // ارسال اعلان برای اشتراک جدید
      try {
        await sendNotification(
          '✅ اشتراک جدید ثبت شد',
          `اشتراک "${data.name}" با مبلغ ${formatNumber(data.amount)} ${data.currency} ثبت شد`,
          'subscription',
          newId,
          'subscription',
          data.nextRenewal
        )
      } catch (err) {
        console.error('Error sending notification for new subscription:', err)
      }
    }
    setShowDialog(false)
  }

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
      name: debt.name, personName: debt.personName || '',
      totalAmount: debt.totalAmount.toString(),
      remainingAmount: debt.remainingAmount.toString(),
      startDate: debt.startDate, dueDate: debt.dueDate,
      note: debt.note || ''
    })
    setShowDialog(true)
  }

  const saveDebt = async () => {
    if (!formData.name || !formData.totalAmount) {
      showToast('لطفاً فیلدهای ضروری را پر کنید', 'error')
      return
    }
    const data = {
      name: formData.name,
      personName: formData.personName,
      totalAmount: parseFloat(formData.totalAmount),
      remainingAmount: parseFloat(formData.remainingAmount || formData.totalAmount),
      startDate: formData.startDate,
      dueDate: formData.dueDate,
      status: 'active',
      note: formData.note
    }
    
    let savedItem
    if (editingItem?.id) {
      updateDebt(editingItem.id, data)
      savedItem = { ...data, id: editingItem.id }
      showToast('بدهی با موفقیت ویرایش شد')
    } else {
      const newId = addDebt(data)
      savedItem = { ...data, id: newId }
      showToast('بدهی جدید با موفقیت اضافه شد')
      
      // ارسال اعلان برای بدهی جدید
      try {
        await sendNotification(
          '✅ بدهی جدید ثبت شد',
          `بدهی "${data.name}" به مبلغ ${formatNumber(data.totalAmount)} ریال ثبت شد`,
          'general',
          newId,
          'debt',
          data.dueDate
        )
      } catch (err) {
        console.error('Error sending notification for new debt:', err)
      }
    }
    setShowDialog(false)
  }

  const openPayDebt = (debt) => {
    setPaymentItem({ ...debt, itemType: 'debt' })
    setPaymentAmount(debt.remainingAmount.toString())
    setShowPaymentDialog(true)
  }

  const confirmPayDebt = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      showToast('مبلغ نامعتبر است', 'error')
      return
    }
    payDebt(paymentItem.id, parseFloat(paymentAmount))
    showToast(`مبلغ ${formatNumber(parseFloat(paymentAmount))} ریال با موفقیت پرداخت شد`)
    
    // ارسال اعلان پس از پرداخت
    try {
      const remainingAmount = paymentItem.remainingAmount - parseFloat(paymentAmount)
      if (remainingAmount <= 0) {
        await sendNotification(
          '✅ بدهی تسویه شد',
          `بدهی "${paymentItem.name}" به طور کامل تسویه شد`,
          'general',
          paymentItem.id,
          'debt',
          null
        )
      } else {
        await sendNotification(
          '💰 پرداخت بدهی',
          `مبلغ ${formatNumber(parseFloat(paymentAmount))} ریال از بدهی "${paymentItem.name}" پرداخت شد. مانده باقی‌مانده: ${formatNumber(remainingAmount)} ریال`,
          'general',
          paymentItem.id,
          'debt',
          null
        )
      }
    } catch (err) {
      console.error('Error sending payment notification:', err)
    }
    
    setShowPaymentDialog(false)
    setPaymentItem(null)
  }

  const handleDelete = (type, id) => {
    if (confirm('آیا از حذف این مورد مطمئن هستید؟')) {
      if (type === 'loan') { deleteLoan(id); showToast('وام حذف شد') }
      else if (type === 'subscription') { deleteSubscription(id); showToast('اشتراک حذف شد') }
      else if (type === 'debt') { deleteDebt(id); showToast('بدهی حذف شد') }
    }
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const totalLoans = loans.reduce((sum, l) => sum + l.remainingAmount, 0)
  const totalSubscriptionsMonthly = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => {
      const monthly = s.cycle === 'yearly' ? s.amount / 12 : 
                      s.cycle === 'quarterly' ? s.amount / 3 :
                      s.cycle === 'weekly' ? s.amount * 4 : s.amount
      return sum + monthly
    }, 0)
  const totalDebts = debts.reduce((sum, d) => sum + d.remainingAmount, 0)

  const filteredLoans = loans.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredSubscriptions = subscriptions.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredDebts = debts.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="p-8 space-y-8 animate-fade-in-up bg-grid-ultra min-h-screen" dir="rtl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* هدر */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gradient-ultra">وام‌ها، اشتراک‌ها و بدهی‌ها</h1>
          <p className="text-base text-slate-400 mt-3">مدیریت تعهدات مالی شما</p>
        </div>
      </div>

      {/* کارت‌های خلاصه */}
      <div className="grid grid-cols-3 gap-5">
        <div className="stat-card-ultra animate-fade-in-up delay-100">
          <div className="flex items-center gap-3">
            <div className="stat-icon-ultra bg-blue-500/20">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">مانده وام‌ها</p>
              <p className="text-xl font-black text-white font-mono">{formatNumber(totalLoans)} <span className="text-xs text-slate-400">ریال</span></p>
            </div>
          </div>
        </div>

        <div className="stat-card-ultra animate-fade-in-up delay-200">
          <div className="flex items-center gap-3">
            <div className="stat-icon-ultra bg-purple-500/20">
              <Bell className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">اشتراک‌های ماهانه</p>
              <p className="text-xl font-black text-white font-mono">{formatNumber(totalSubscriptionsMonthly.toFixed(2))} <span className="text-xs text-slate-400">USD</span></p>
            </div>
          </div>
        </div>

        <div className="stat-card-ultra animate-fade-in-up delay-300">
          <div className="flex items-center gap-3">
            <div className="stat-icon-ultra bg-red-500/20">
              <User className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">مانده بدهی‌ها</p>
              <p className="text-xl font-black text-gradient-danger font-mono">{formatNumber(totalDebts)} <span className="text-xs text-slate-400">ریال</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* تب‌ها */}
      <div className="flex gap-3">
        <Button
          variant={activeTab === 'loans' ? 'default' : 'outline'}
          onClick={() => { setActiveTab('loans'); setSearchQuery('') }}
          className={activeTab === 'loans' ? 'btn-ultra' : 'btn-ultra btn-ultra-secondary'}
          style={activeTab === 'loans' ? { background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: 'var(--shadow-glow-blue)' } : {}}
        >
          <Building2 className="w-5 h-5" />
          وام‌ها ({loans.length})
        </Button>
        <Button
          variant={activeTab === 'subscriptions' ? 'default' : 'outline'}
          onClick={() => { setActiveTab('subscriptions'); setSearchQuery('') }}
          className={activeTab === 'subscriptions' ? 'btn-ultra' : 'btn-ultra btn-ultra-secondary'}
          style={activeTab === 'subscriptions' ? { background: 'linear-gradient(135deg, #a855f7, #7c3aed)', boxShadow: 'var(--shadow-glow-purple)' } : {}}
        >
          <Bell className="w-5 h-5" />
          اشتراک‌ها ({subscriptions.length})
        </Button>
        <Button
          variant={activeTab === 'debts' ? 'default' : 'outline'}
          onClick={() => { setActiveTab('debts'); setSearchQuery('') }}
          className={activeTab === 'debts' ? 'btn-ultra btn-ultra-danger' : 'btn-ultra btn-ultra-secondary'}
        >
          <User className="w-5 h-5" />
          بدهی‌ها ({debts.length})
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
          onClick={activeTab === 'loans' ? openAddLoan : activeTab === 'subscriptions' ? openAddSubscription : openAddDebt}
          className="btn-ultra btn-ultra-primary"
        >
          <Plus className="w-5 h-5" />
          {activeTab === 'loans' ? 'افزودن وام' : activeTab === 'subscriptions' ? 'افزودن اشتراک' : 'افزودن بدهی'}
        </Button>
      </div>

      {/* لیست وام‌ها */}
      {activeTab === 'loans' && (
        <div className="space-y-4">
          {filteredLoans.length === 0 ? (
            <div className="empty-state-ultra">
              {searchQuery ? 'وامی یافت نشد' : 'هنوز وامی ثبت نشده است'}
            </div>
          ) : (
            filteredLoans.map(loan => {
              const progress = loan.totalInstallments > 0 ? (loan.paidInstallments / loan.totalInstallments) * 100 : 0
              const isPaid = loan.remainingAmount <= 0
              const isExpanded = expandedId === `loan-${loan.id}`

              return (
                <div key={loan.id} className="item-card-ultra p-6">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(`loan-${loan.id}`)}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="stat-icon-ultra bg-blue-500/20">
                        <Building2 className="w-7 h-7 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-bold text-lg">{loan.name}</h4>
                          {isPaid && <span className="badge-ultra badge-success-ultra">تسویه شده</span>}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          {loan.bankName && `${loan.bankName} • `}
                          نرخ بهره: {loan.interestRate}% • قسط ماهانه: {formatNumber(loan.monthlyPayment)} ریال
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-slate-400">مانده بدهی</p>
                        <p className={`text-2xl font-black font-mono ${isPaid ? 'text-gradient-ultra' : 'text-gradient-danger'}`}>
                          {formatNumber(loan.remainingAmount)}
                        </p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t-2 border-slate-800 space-y-5">
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400 text-xs">مبلغ کل وام</p>
                          <p className="text-white font-bold font-mono">{formatNumber(loan.totalAmount)} ریال</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">اقساط پرداختی</p>
                          <p className="text-white font-bold font-mono">{loan.paidInstallments} از {loan.totalInstallments}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">تاریخ شروع</p>
                          <p className="text-white font-bold font-mono">{loan.startDate}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">تاریخ پایان</p>
                          <p className="text-white font-bold font-mono">{loan.endDate || '-'}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">پیشرفت پرداخت</span>
                          <span className="text-white font-bold">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="progress-ultra h-3">
                          <div className="progress-ultra-fill" style={{ width: `${progress}%` }} />
                        </div>
                      </div>

                      {loan.note && <p className="text-xs text-slate-500">📝 {loan.note}</p>}

                      <div className="flex gap-3 pt-2 flex-wrap">
                        {!isPaid && (
                          <>
                            <Button 
                              onClick={() => openPayLoan(loan)}
                              className="btn-ultra btn-ultra-primary flex-1"
                              size="sm"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              پرداخت قسط
                            </Button>
                            <Button 
                              onClick={() => setupLoanReminder(loan)}
                              className="btn-ultra btn-ultra-secondary"
                              size="sm"
                            >
                              <BellRing className="w-4 h-4" />
                              تنظیم یادآور
                            </Button>
                          </>
                        )}
                        <Button 
                          onClick={() => openEditLoan(loan)}
                          className="btn-ultra btn-ultra-secondary"
                          size="sm"
                        >
                          <Edit3 className="w-4 h-4" />
                          ویرایش
                        </Button>
                        <Button 
                          onClick={() => handleDelete('loan', loan.id)}
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

      {/* لیست اشتراک‌ها */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          {filteredSubscriptions.length === 0 ? (
            <div className="empty-state-ultra">
              {searchQuery ? 'اشتراکی یافت نشد' : 'هنوز اشتراکی ثبت نشده است'}
            </div>
          ) : (
            filteredSubscriptions.map(sub => {
              const isExpanded = expandedId === `sub-${sub.id}`
              const cycleLabel = SUBSCRIPTION_CYCLES.find(c => c.value === sub.cycle)?.label || sub.cycle

              return (
                <div key={sub.id} className="item-card-ultra p-6">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(`sub-${sub.id}`)}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="stat-icon-ultra bg-purple-500/20">
                        <Bell className="w-7 h-7 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-bold text-lg">{sub.name}</h4>
                          {sub.status === 'cancelled' && <span className="badge-ultra badge-danger-ultra">لغو شده</span>}
                          {sub.status === 'active' && <span className="badge-ultra badge-success-ultra">فعال</span>}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          {sub.provider && `${sub.provider} • `}
                          {formatNumber(sub.amount)} {sub.currency} / {cycleLabel}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-slate-400">تمدید بعدی</p>
                        <p className="text-xl font-black text-white font-mono">{sub.nextRenewal || '-'}</p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t-2 border-slate-800 space-y-5">
                      <div className="grid grid-cols-4 gap-4 text-sm">
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
                          <p className="text-white font-bold font-mono">{sub.startDate}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">دوره پرداخت</p>
                          <p className="text-white font-bold">{cycleLabel}</p>
                        </div>
                      </div>

                      {sub.note && <p className="text-xs text-slate-500">📝 {sub.note}</p>}

                      <div className="flex gap-3 pt-2 flex-wrap">
                        {sub.status === 'active' && (
                          <Button 
                            onClick={() => setupSubscriptionReminder(sub)}
                            className="btn-ultra btn-ultra-secondary"
                            size="sm"
                          >
                            <BellRing className="w-4 h-4" />
                            تنظیم یادآور
                          </Button>
                        )}
                        <Button 
                          onClick={() => openEditSubscription(sub)}
                          className="btn-ultra btn-ultra-secondary"
                          size="sm"
                        >
                          <Edit3 className="w-4 h-4" />
                          ویرایش
                        </Button>
                        <Button 
                          onClick={() => handleDelete('subscription', sub.id)}
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

      {/* لیست بدهی‌ها */}
      {activeTab === 'debts' && (
        <div className="space-y-4">
          {filteredDebts.length === 0 ? (
            <div className="empty-state-ultra">
              {searchQuery ? 'بدهی یافت نشد' : 'هنوز بدهی ثبت نشده است'}
            </div>
          ) : (
            filteredDebts.map(debt => {
              const isExpanded = expandedId === `debt-${debt.id}`
              const isPaid = debt.remainingAmount <= 0
              const progress = debt.totalAmount > 0 ? ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100 : 0

              return (
                <div key={debt.id} className="item-card-ultra p-6">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(`debt-${debt.id}`)}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="stat-icon-ultra bg-red-500/20">
                        <User className="w-7 h-7 text-red-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-bold text-lg">{debt.name}</h4>
                          {isPaid && <span className="badge-ultra badge-success-ultra">تسویه شده</span>}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          {debt.personName && `به: ${debt.personName} • `}
                          سررسید: {debt.dueDate || '-'}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-slate-400">مانده بدهی</p>
                        <p className={`text-2xl font-black font-mono ${isPaid ? 'text-gradient-ultra' : 'text-gradient-danger'}`}>
                          {formatNumber(debt.remainingAmount)}
                        </p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t-2 border-slate-800 space-y-5">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400 text-xs">مبلغ کل بدهی</p>
                          <p className="text-white font-bold font-mono">{formatNumber(debt.totalAmount)} ریال</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">تاریخ شروع</p>
                          <p className="text-white font-bold font-mono">{debt.startDate}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">تاریخ سررسید</p>
                          <p className="text-white font-bold font-mono">{debt.dueDate || '-'}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">پیشرفت پرداخت</span>
                          <span className="text-white font-bold">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="progress-ultra h-3">
                          <div className="progress-ultra-fill" style={{ width: `${progress}%` }} />
                        </div>
                      </div>

                      {debt.note && <p className="text-xs text-slate-500">📝 {debt.note}</p>}

                      <div className="flex gap-3 pt-2 flex-wrap">
                        {!isPaid && (
                          <>
                            <Button 
                              onClick={() => openPayDebt(debt)}
                              className="btn-ultra btn-ultra-primary flex-1"
                              size="sm"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              ثبت پرداخت
                            </Button>
                            {debt.dueDate && (
                              <Button 
                                onClick={() => setupDebtReminder(debt)}
                                className="btn-ultra btn-ultra-secondary"
                                size="sm"
                              >
                                <BellRing className="w-4 h-4" />
                                تنظیم یادآور
                              </Button>
                            )}
                          </>
                        )}
                        <Button 
                          onClick={() => openEditDebt(debt)}
                          className="btn-ultra btn-ultra-secondary"
                          size="sm"
                        >
                          <Edit3 className="w-4 h-4" />
                          ویرایش
                        </Button>
                        <Button 
                          onClick={() => handleDelete('debt', debt.id)}
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
              {editingItem?.type === 'loan' ? (editingItem.id ? 'ویرایش وام' : 'افزودن وام جدید') :
               editingItem?.type === 'subscription' ? (editingItem.id ? 'ویرایش اشتراک' : 'افزودن اشتراک جدید') :
               editingItem?.type === 'debt' ? (editingItem.id ? 'ویرایش بدهی' : 'افزودن بدهی جدید') :
               'افزودن مورد جدید'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[65vh] overflow-y-auto custom-scrollbar-ultra">
            
            <div className="space-y-2">
              <Label className="label-ultra">نام *</Label>
              <Input 
                value={formData.name || ''} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder={activeTab === 'loans' ? 'وام خرید خودرو' : activeTab === 'subscriptions' ? 'ChatGPT Plus' : 'بدهی به علی'}
                className="input-ultra" 
              />
            </div>

            {activeTab === 'loans' && (
              <>
                <div className="space-y-2">
                  <Label className="label-ultra">نام بانک</Label>
                  <Input 
                    value={formData.bankName || ''} 
                    onChange={(e) => setFormData({...formData, bankName: e.target.value})} 
                    placeholder="بانک ملی"
                    className="input-ultra" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="label-ultra">مبلغ کل وام (ریال) *</Label>
                    <Input type="number" value={formData.totalAmount || ''} onChange={(e) => setFormData({...formData, totalAmount: e.target.value})} placeholder="200000000" className="input-ultra font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label className="label-ultra">مانده فعلی (ریال)</Label>
                    <Input type="number" value={formData.remainingAmount || ''} onChange={(e) => setFormData({...formData, remainingAmount: e.target.value})} placeholder="150000000" className="input-ultra font-mono" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="label-ultra">نرخ بهره سالانه (%)</Label>
                    <Input type="number" value={formData.interestRate || ''} onChange={(e) => setFormData({...formData, interestRate: e.target.value})} placeholder="18" className="input-ultra font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label className="label-ultra">قسط ماهانه (ریال) *</Label>
                    <Input type="number" value={formData.monthlyPayment || ''} onChange={(e) => setFormData({...formData, monthlyPayment: e.target.value})} placeholder="8500000" className="input-ultra font-mono" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="label-ultra">تاریخ شروع</Label>
                    <Input value={formData.startDate || ''} onChange={(e) => setFormData({...formData, startDate: e.target.value})} placeholder="1403/01/01" className="input-ultra font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label className="label-ultra">تاریخ پایان</Label>
                    <Input value={formData.endDate || ''} onChange={(e) => setFormData({...formData, endDate: e.target.value})} placeholder="1404/01/01" className="input-ultra font-mono" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="label-ultra">تعداد کل اقساط</Label>
                    <Input type="number" value={formData.totalInstallments || ''} onChange={(e) => setFormData({...formData, totalInstallments: e.target.value})} placeholder="24" className="input-ultra font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label className="label-ultra">اقساط پرداخت شده</Label>
                    <Input type="number" value={formData.paidInstallments || ''} onChange={(e) => setFormData({...formData, paidInstallments: e.target.value})} placeholder="0" className="input-ultra font-mono" />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'subscriptions' && (
              <>
                <div className="space-y-2">
                  <Label className="label-ultra">ارائه‌دهنده</Label>
                  <Input 
                    value={formData.provider || ''} 
                    onChange={(e) => setFormData({...formData, provider: e.target.value})} 
                    placeholder="OpenAI"
                    className="input-ultra" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="label-ultra">مبلغ *</Label>
                    <Input type="number" value={formData.amount || ''} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="20" className="input-ultra font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label className="label-ultra">واحد ارز</Label>
                    <Select value={formData.currency || 'USD'} onValueChange={(v) => setFormData({...formData, currency: v})}>
                      <SelectTrigger className="input-ultra"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                        <SelectItem value="USD" className="text-white">USD (دلار)</SelectItem>
                        <SelectItem value="EUR" className="text-white">EUR (یورو)</SelectItem>
                        <SelectItem value="IRR" className="text-white">IRR (ریال)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="label-ultra">دوره پرداخت</Label>
                  <Select value={formData.cycle || 'monthly'} onValueChange={(v) => setFormData({...formData, cycle: v})}>
                    <SelectTrigger className="input-ultra"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                      {SUBSCRIPTION_CYCLES.map(c => (
                        <SelectItem key={c.value} value={c.value} className="text-white">{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="label-ultra">تاریخ شروع</Label>
                    <Input value={formData.startDate || ''} onChange={(e) => setFormData({...formData, startDate: e.target.value})} placeholder="1403/01/01" className="input-ultra font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label className="label-ultra">تمدید بعدی</Label>
                    <Input value={formData.nextRenewal || ''} onChange={(e) => setFormData({...formData, nextRenewal: e.target.value})} placeholder="1403/05/01" className="input-ultra font-mono" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="label-ultra">وضعیت</Label>
                  <Select value={formData.status || 'active'} onValueChange={(v) => setFormData({...formData, status: v})}>
                    <SelectTrigger className="input-ultra"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                      <SelectItem value="active" className="text-white">فعال</SelectItem>
                      <SelectItem value="cancelled" className="text-white">لغو شده</SelectItem>
                      <SelectItem value="paused" className="text-white">متوقف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {activeTab === 'debts' && (
              <>
                <div className="space-y-2">
                  <Label className="label-ultra">نام شخص/طرف بدهی</Label>
                  <Input 
                    value={formData.personName || ''} 
                    onChange={(e) => setFormData({...formData, personName: e.target.value})} 
                    placeholder="علی محمدی"
                    className="input-ultra" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="label-ultra">مبلغ کل بدهی (ریال) *</Label>
                    <Input type="number" value={formData.totalAmount || ''} onChange={(e) => setFormData({...formData, totalAmount: e.target.value})} placeholder="50000000" className="input-ultra font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label className="label-ultra">مانده فعلی (ریال)</Label>
                    <Input type="number" value={formData.remainingAmount || ''} onChange={(e) => setFormData({...formData, remainingAmount: e.target.value})} placeholder="30000000" className="input-ultra font-mono" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="label-ultra">تاریخ شروع</Label>
                    <Input value={formData.startDate || ''} onChange={(e) => setFormData({...formData, startDate: e.target.value})} placeholder="1403/01/01" className="input-ultra font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label className="label-ultra">تاریخ سررسید</Label>
                    <Input value={formData.dueDate || ''} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} placeholder="1403/10/01" className="input-ultra font-mono" />
                  </div>
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
              onClick={activeTab === 'loans' ? saveLoan : activeTab === 'subscriptions' ? saveSubscription : saveDebt}
              className="btn-ultra btn-ultra-primary"
            >
              {editingItem?.id ? 'ذخیره' : 'افزودن'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog پرداخت */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="card-ultra text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right text-2xl font-black">
              {paymentItem?.itemType === 'loan' ? 'پرداخت قسط وام' : 'ثبت پرداخت بدهی'}
            </DialogTitle>
            <DialogDescription className="text-right text-slate-400">
              {paymentItem?.itemType === 'loan' ? paymentItem.name : paymentItem?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-sm">مانده فعلی:</span>
                <span className="text-gradient-danger font-black font-mono text-lg">
                  {formatNumber(paymentItem?.remainingAmount)} ریال
                </span>
              </div>
              {paymentItem?.itemType === 'loan' && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">قسط پیشنهادی:</span>
                  <span className="text-white font-bold font-mono">
                    {formatNumber(paymentItem?.monthlyPayment)} ریال
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="label-ultra">مبلغ پرداختی (ریال)</Label>
              <Input 
                type="number"
                value={paymentAmount} 
                onChange={(e) => setPaymentAmount(e.target.value)} 
                placeholder="مبلغ را وارد کنید"
                className="input-ultra font-mono text-lg h-14" 
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button onClick={() => setShowPaymentDialog(false)} className="btn-ultra btn-ultra-secondary">
              انصراف
            </Button>
            <Button 
              onClick={paymentItem?.itemType === 'loan' ? confirmPayLoan : confirmPayDebt}
              className="btn-ultra btn-ultra-primary"
            >
              <CheckCircle2 className="w-4 h-4" />
              تأیید پرداخت
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}