import { useState, useEffect, useCallback } from 'react'
import { 
  TrendingUp, Building2, Bitcoin, Wallet, Plus, Search, 
  Edit3, Trash2, Inbox, RefreshCw, Download, 
  ArrowUpDown, CheckCircle, XCircle, AlertCircle
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
import { invoke } from '@tauri-apps/api/core'
import useStore from '../store/useStore'
import { formatNumber } from '../lib/helpers'
import { cn } from '../lib/utils'
import { toast } from 'sonner'

// ==================== Constants ====================
const UNITS = [
  { value: 'عدد', label: 'عدد' },
  { value: 'گرم', label: 'گرم' },
  { value: 'کیلوگرم', label: 'کیلوگرم' },
  { value: 'متر مربع', label: 'متر مربع' },
  { value: 'دستگاه', label: 'دستگاه' },
  { value: 'سهم', label: 'سهم' },
  { value: 'ریال', label: 'ریال' },
  { value: 'دلار', label: 'دلار' },
  { value: 'تتر', label: 'تتر (USDT)' },
]

const ASSET_CATEGORIES = [
  { value: 'gold', label: '🥇 طلا' },
  { value: 'silver', label: '🥈 نقره' },
  { value: 'car', label: '🚗 خودرو' },
  { value: 'realEstate', label: '🏠 ملک' },
  { value: 'cash', label: '💵 پول نقد' },
  { value: 'other', label: '📦 سایر' },
]

// ==================== کامپوننت اصلی ====================
export default function Accounts() {
  // ==================== State ====================
  const [accounts, setAccounts] = useState([])
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeSection, setActiveSection] = useState('accounts')
  const [accountCategory, setAccountCategory] = useState('trading')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('balance-desc')
  
  const [showAccountDialog, setShowAccountDialog] = useState(false)
  const [showAssetDialog, setShowAssetDialog] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  const [accountForm, setAccountForm] = useState({
    name: '', balance: '', currency: 'USDT', category: 'trading'
  })
  const [assetForm, setAssetForm] = useState({
    name: '', amount: '', unit: 'عدد', category: 'gold', 
    buyPrice: '', currentPrice: '', buyDate: '', note: ''
  })

  const [accountErrors, setAccountErrors] = useState({})
  const [assetErrors, setAssetErrors] = useState({})

  // ==================== دریافت داده از دیتابیس ====================
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [accountsData, assetsData] = await Promise.all([
        invoke('get_accounts'),
        invoke('get_assets'),
      ])
      setAccounts(accountsData || [])
      setAssets(assetsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('خطا در دریافت داده‌ها', {
        description: error.message || 'لطفاً دوباره تلاش کنید',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ==================== فیلتر و مرتب‌سازی ====================
  const filteredAccounts = accounts
    .filter(a => a.category === accountCategory)
    .filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'balance-desc': return b.balance - a.balance
        case 'balance-asc': return a.balance - b.balance
        case 'name-asc': return a.name.localeCompare(b.name)
        case 'name-desc': return b.name.localeCompare(a.name)
        default: return 0
      }
    })

  const filteredAssets = assets
    .filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (b.current_price * b.amount) - (a.current_price * a.amount))

  // ==================== محاسبات آماری ====================
  const tradingTotal = accounts.filter(a => a.category === 'trading').reduce((sum, a) => sum + a.balance, 0)
  const bankTotal = accounts.filter(a => a.category === 'bank').reduce((sum, a) => sum + a.balance, 0)
  const cryptoCount = accounts.filter(a => a.category === 'crypto').length
  const totalAssetsValue = assets.reduce((sum, a) => sum + (a.current_price * a.amount), 0)
  const totalAccountsBalance = accounts.reduce((sum, a) => sum + a.balance, 0)

  // ==================== اعتبارسنجی ====================
  const validateAccountForm = () => {
    const errors = {}
    if (!accountForm.name.trim() || accountForm.name.trim().length < 3) {
      errors.name = 'نام حساب باید حداقل ۳ کاراکتر باشد'
    }
    const balance = parseFloat(accountForm.balance)
    if (!accountForm.balance || isNaN(balance) || balance <= 0) {
      errors.balance = 'موجودی باید بیشتر از صفر باشد'
    }
    if (balance > 10000000000) {
      errors.balance = 'موجودی نمی‌تواند بیشتر از ۱۰ میلیارد باشد'
    }
    setAccountErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateAssetForm = () => {
    const errors = {}
    if (!assetForm.name.trim() || assetForm.name.trim().length < 3) {
      errors.name = 'نام دارایی باید حداقل ۳ کاراکتر باشد'
    }
    const amount = parseFloat(assetForm.amount)
    if (!assetForm.amount || isNaN(amount) || amount <= 0) {
      errors.amount = 'مقدار باید بیشتر از صفر باشد'
    }
    const buyPrice = parseFloat(assetForm.buyPrice)
    if (!assetForm.buyPrice || isNaN(buyPrice) || buyPrice <= 0) {
      errors.buyPrice = 'قیمت خرید باید بیشتر از صفر باشد'
    }
    if (buyPrice > 10000000000) {
      errors.buyPrice = 'قیمت خرید نمی‌تواند بیشتر از ۱۰ میلیارد باشد'
    }
    const currentPrice = parseFloat(assetForm.currentPrice)
    if (!assetForm.currentPrice || isNaN(currentPrice) || currentPrice <= 0) {
      errors.currentPrice = 'قیمت فعلی باید بیشتر از صفر باشد'
    }
    if (currentPrice > 10000000000) {
      errors.currentPrice = 'قیمت فعلی نمی‌تواند بیشتر از ۱۰ میلیارد باشد'
    }
    setAssetErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ==================== عملیات حساب‌ها ====================
  const openAddAccount = () => {
    setEditingItem(null)
    setAccountForm({ name: '', balance: '', currency: 'USDT', category: accountCategory })
    setAccountErrors({})
    setShowAccountDialog(true)
  }

  const openEditAccount = (account) => {
    setEditingItem(account)
    setAccountForm({
      name: account.name,
      balance: account.balance.toString(),
      currency: account.currency,
      category: account.category
    })
    setAccountErrors({})
    setShowAccountDialog(true)
  }

  const saveAccount = async () => {
    if (!validateAccountForm()) {
      toast.error('خطا در اعتبارسنجی', {
        description: 'لطفاً فیلدهای الزامی را به درستی پر کنید',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const data = {
        name: accountForm.name.trim(),
        balance: parseFloat(accountForm.balance),
        currency: accountForm.currency,
        category: accountForm.category
      }
      
      if (editingItem) {
        await invoke('update_account', { 
          id: editingItem.id, 
          ...data 
        })
        toast.success('حساب با موفقیت ویرایش شد')
      } else {
        await invoke('add_account', data)
        toast.success('حساب جدید با موفقیت اضافه شد')
      }
      
      await fetchData()
      setShowAccountDialog(false)
    } catch (error) {
      toast.error('خطا', {
        description: error.message || 'عملیات با شکست مواجه شد',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAccount = async (account) => {
    if (!confirm(`آیا از حذف حساب "${account.name}" مطمئن هستید؟`)) return
    
    try {
      await invoke('delete_account', { id: account.id })
      toast.success('حساب با موفقیت حذف شد')
      await fetchData()
    } catch (error) {
      toast.error('خطا در حذف', {
        description: error.message || 'امکان حذف این حساب وجود ندارد',
      })
    }
  }

  // ==================== عملیات دارایی‌ها ====================
  const openAddAsset = () => {
    setEditingItem(null)
    setAssetForm({ 
      name: '', amount: '', unit: 'عدد', category: 'gold', 
      buyPrice: '', currentPrice: '', buyDate: new Date().toLocaleDateString('fa-IR'), 
      note: '' 
    })
    setAssetErrors({})
    setShowAssetDialog(true)
  }

  const openEditAsset = (asset) => {
    setEditingItem(asset)
    setAssetForm({
      name: asset.name,
      amount: asset.amount.toString(),
      unit: asset.unit,
      category: asset.category,
      buyPrice: asset.buy_price.toString(),
      currentPrice: asset.current_price.toString(),
      buyDate: asset.buy_date || '',
      note: asset.note || ''
    })
    setAssetErrors({})
    setShowAssetDialog(true)
  }

  const saveAsset = async () => {
    if (!validateAssetForm()) {
      toast.error('خطا در اعتبارسنجی', {
        description: 'لطفاً فیلدهای الزامی را به درستی پر کنید',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const data = {
        name: assetForm.name.trim(),
        amount: parseFloat(assetForm.amount),
        unit: assetForm.unit || 'عدد',
        category: assetForm.category,
        buy_price: parseFloat(assetForm.buyPrice),
        current_price: parseFloat(assetForm.currentPrice),
        buy_date: assetForm.buyDate || new Date().toLocaleDateString('fa-IR'),
        note: assetForm.note || null
      }
      
      if (editingItem) {
        await invoke('update_asset', { 
          id: editingItem.id, 
          current_price: data.current_price 
        })
        toast.success('دارایی با موفقیت ویرایش شد')
      } else {
        await invoke('add_asset', data)
        toast.success('دارایی جدید با موفقیت اضافه شد')
      }
      
      await fetchData()
      setShowAssetDialog(false)
    } catch (error) {
      toast.error('خطا', {
        description: error.message || 'عملیات با شکست مواجه شد',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAsset = async (asset) => {
    if (!confirm(`آیا از حذف دارایی "${asset.name}" مطمئن هستید؟`)) return
    
    try {
      await invoke('delete_asset', { id: asset.id })
      toast.success('دارایی با موفقیت حذف شد')
      await fetchData()
    } catch (error) {
      toast.error('خطا در حذف', {
        description: error.message || 'امکان حذف این دارایی وجود ندارد',
      })
    }
  }

  // ==================== خروجی ====================
  const handleExport = () => {
    const data = activeSection === 'accounts' ? filteredAccounts : filteredAssets
    const headers = activeSection === 'accounts' 
      ? ['نام', 'موجودی', 'واحد', 'دسته']
      : ['نام', 'مقدار', 'واحد', 'دسته', 'قیمت خرید', 'قیمت فعلی']
    
    const rows = data.map(item => {
      if (activeSection === 'accounts') {
        return [item.name, item.balance, item.currency, item.category]
      } else {
        return [item.name, item.amount, item.unit, item.category, item.buy_price, item.current_price]
      }
    })
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeSection}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('خروجی با موفقیت گرفته شد')
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
        <div className="grid grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
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
    <div className="p-8 space-y-8" dir="rtl">
      {/* ==================== هدر ==================== */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            💰 حساب‌ها و دارایی‌ها
          </h1>
          <p className="text-base text-slate-400 mt-2">
            مدیریت کامل دارایی‌های مالی و فیزیکی شما
          </p>
        </div>
        <div className="flex items-center gap-3">
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

      {/* ==================== کارت‌های خلاصه ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">مجموع موجودی</p>
              <p className="text-lg font-black text-white">{formatNumber(totalAccountsBalance)}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">حساب‌های ترید</p>
              <p className="text-lg font-black text-white">{formatNumber(tradingTotal)}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">حساب‌های بانکی</p>
              <p className="text-lg font-black text-white">{formatNumber(bankTotal)}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/10">
              <Bitcoin className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">کیف پول کریپتو</p>
              <p className="text-lg font-black text-white">{cryptoCount} عدد</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Wallet className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">دارایی‌های فیزیکی</p>
              <p className="text-lg font-black text-white">{formatNumber(totalAssetsValue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== نوار ابزار ==================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-2xl border border-slate-800 bg-slate-900/30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActiveSection('accounts'); setSearchQuery('') }}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeSection === 'accounts'
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            )}
          >
            حساب‌های مالی
          </button>
          <button
            onClick={() => { setActiveSection('assets'); setSearchQuery('') }}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeSection === 'assets'
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            )}
          >
            دارایی‌های فیزیکی
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={activeSection === 'accounts' ? openAddAccount : openAddAsset}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 rounded-xl text-white font-bold transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            {activeSection === 'accounts' ? 'حساب جدید' : 'دارایی جدید'}
          </button>
        </div>
      </div>

      {/* ==================== فیلترها ==================== */}
      {activeSection === 'accounts' && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setAccountCategory('trading')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all",
              accountCategory === 'trading'
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            )}
          >
            ترید
          </button>
          <button
            onClick={() => setAccountCategory('bank')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all",
              accountCategory === 'bank'
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            )}
          >
            بانکی
          </button>
          <button
            onClick={() => setAccountCategory('crypto')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all",
              accountCategory === 'crypto'
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            )}
          >
            کریپتو
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو..."
              className="bg-transparent border-none outline-none text-white text-sm placeholder-slate-500 w-32 focus:w-48 transition-all"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
          >
            <option value="balance-desc">موجودی (بیشترین)</option>
            <option value="balance-asc">موجودی (کمترین)</option>
            <option value="name-asc">نام (الفبا)</option>
            <option value="name-desc">نام (الفبا معکوس)</option>
          </select>
        </div>
      )}

      {activeSection === 'assets' && (
        <div className="flex items-center gap-3">
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو..."
              className="bg-transparent border-none outline-none text-white text-sm placeholder-slate-500 w-32 focus:w-48 transition-all"
            />
          </div>
        </div>
      )}

      {/* ==================== لیست ==================== */}
      {activeSection === 'accounts' && (
        <div className="space-y-3">
          {filteredAccounts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Inbox className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-bold text-white">هیچ حسابی یافت نشد</p>
              <p className="text-sm mt-1">برای شروع، یک حساب جدید اضافه کنید</p>
            </div>
          ) : (
            filteredAccounts.map((account) => {
              const isCrypto = account.category === 'crypto'
              const Icon = isCrypto ? Bitcoin : account.category === 'trading' ? TrendingUp : Building2
              const color = isCrypto ? 'orange' : account.category === 'trading' ? 'emerald' : 'blue'
              
              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-900/30 hover:bg-slate-900/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2.5 rounded-xl",
                      color === 'emerald' && "bg-emerald-500/10",
                      color === 'blue' && "bg-blue-500/10",
                      color === 'orange' && "bg-orange-500/10",
                    )}>
                      <Icon className={cn(
                        "w-5 h-5",
                        color === 'emerald' && "text-emerald-400",
                        color === 'blue' && "text-blue-400",
                        color === 'orange' && "text-orange-400",
                      )} />
                    </div>
                    <div>
                      <p className="text-white font-bold">{account.name}</p>
                      <p className="text-xs text-slate-400">{account.currency}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <p className="text-white font-black text-lg">
                      {formatNumber(account.balance)}
                    </p>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditAccount(account)}
                        className="p-2 rounded-xl hover:bg-slate-800/50 transition-all"
                      >
                        <Edit3 className="w-4 h-4 text-slate-400 hover:text-white" />
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(account)}
                        className="p-2 rounded-xl hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {activeSection === 'assets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-400">
              <Inbox className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-bold text-white">هیچ دارایی یافت نشد</p>
              <p className="text-sm mt-1">برای شروع، یک دارایی جدید اضافه کنید</p>
            </div>
          ) : (
            filteredAssets.map((asset) => {
              const profit = (asset.current_price - asset.buy_price) * asset.amount
              const isProfit = profit >= 0
              const category = ASSET_CATEGORIES.find(c => c.value === asset.category) || ASSET_CATEGORIES[5]
              
              return (
                <div
                  key={asset.id}
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 hover:bg-slate-900/50 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{category.label.split(' ')[0]}</span>
                      <div>
                        <p className="text-white font-bold">{asset.name}</p>
                        <p className="text-xs text-slate-400">{asset.amount} {asset.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditAsset(asset)}
                        className="p-2 rounded-xl hover:bg-slate-800/50 transition-all"
                      >
                        <Edit3 className="w-4 h-4 text-slate-400 hover:text-white" />
                      </button>
                      <button
                        onClick={() => handleDeleteAsset(asset)}
                        className="p-2 rounded-xl hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">ارزش فعلی:</span>
                      <span className="text-white font-bold">{formatNumber(asset.current_price * asset.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">سود/ضرر:</span>
                      <span className={cn(
                        "font-bold",
                        isProfit ? "text-emerald-400" : "text-red-400"
                      )}>
                        {isProfit ? '+' : ''}{formatNumber(profit)}
                      </span>
                    </div>
                    {asset.buy_date && (
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>تاریخ خرید:</span>
                        <span>{asset.buy_date}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ==================== Dialog حساب ==================== */}
      <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
        <DialogContent className="border-slate-800 bg-slate-900 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right text-2xl font-bold">
              {editingItem ? '✏️ ویرایش حساب' : '➕ حساب جدید'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-slate-400">نام حساب *</Label>
              <Input
                value={accountForm.name}
                onChange={(e) => setAccountForm({...accountForm, name: e.target.value})}
                placeholder="مثلاً: بایننس فیوچرز"
                className={cn(
                  "mt-1 bg-slate-800/50 border-slate-700 text-white",
                  accountErrors.name && "border-red-500"
                )}
              />
              {accountErrors.name && (
                <p className="text-xs text-red-400 mt-1">{accountErrors.name}</p>
              )}
            </div>

            <div>
              <Label className="text-slate-400">موجودی *</Label>
              <Input
                type="number"
                value={accountForm.balance}
                onChange={(e) => setAccountForm({...accountForm, balance: e.target.value})}
                placeholder="0.00"
                className={cn(
                  "mt-1 bg-slate-800/50 border-slate-700 text-white",
                  accountErrors.balance && "border-red-500"
                )}
              />
              {accountErrors.balance && (
                <p className="text-xs text-red-400 mt-1">{accountErrors.balance}</p>
              )}
            </div>

            <div>
              <Label className="text-slate-400">واحد ارز</Label>
              <select
                value={accountForm.currency}
                onChange={(e) => setAccountForm({...accountForm, currency: e.target.value})}
                className="w-full mt-1 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white outline-none"
              >
                <option value="USDT">USDT (تتر)</option>
                <option value="USD">USD (دلار)</option>
                <option value="IRR">IRR (ریال)</option>
                <option value="BTC">BTC (بیت‌کوین)</option>
                <option value="ETH">ETH (اتریوم)</option>
              </select>
            </div>

            <div>
              <Label className="text-slate-400">دسته‌بندی</Label>
              <select
                value={accountForm.category}
                onChange={(e) => setAccountForm({...accountForm, category: e.target.value})}
                className="w-full mt-1 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white outline-none"
              >
                <option value="trading">حساب ترید</option>
                <option value="bank">حساب بانکی</option>
                <option value="crypto">کیف پول کریپتو</option>
              </select>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <button
              onClick={() => setShowAccountDialog(false)}
              className="px-6 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-white transition-all"
            >
              انصراف
            </button>
            <button
              onClick={saveAccount}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'در حال ذخیره...' : (editingItem ? 'ذخیره' : 'افزودن')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== Dialog دارایی ==================== */}
      <Dialog open={showAssetDialog} onOpenChange={setShowAssetDialog}>
        <DialogContent className="border-slate-800 bg-slate-900 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-right text-2xl font-bold">
              {editingItem ? '✏️ ویرایش دارایی' : '➕ دارایی جدید'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label className="text-slate-400">نام دارایی *</Label>
              <Input
                value={assetForm.name}
                onChange={(e) => setAssetForm({...assetForm, name: e.target.value})}
                placeholder="مثلاً: سکه تمام بهار آزادی"
                className={cn(
                  "mt-1 bg-slate-800/50 border-slate-700 text-white",
                  assetErrors.name && "border-red-500"
                )}
              />
              {assetErrors.name && (
                <p className="text-xs text-red-400 mt-1">{assetErrors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400">مقدار *</Label>
                <Input
                  type="number"
                  value={assetForm.amount}
                  onChange={(e) => setAssetForm({...assetForm, amount: e.target.value})}
                  placeholder="5"
                  className={cn(
                    "mt-1 bg-slate-800/50 border-slate-700 text-white",
                    assetErrors.amount && "border-red-500"
                  )}
                />
                {assetErrors.amount && (
                  <p className="text-xs text-red-400 mt-1">{assetErrors.amount}</p>
                )}
              </div>
              <div>
                <Label className="text-slate-400">واحد</Label>
                <select
                  value={assetForm.unit}
                  onChange={(e) => setAssetForm({...assetForm, unit: e.target.value})}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white outline-none"
                >
                  {UNITS.map(u => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label className="text-slate-400">نوع دارایی</Label>
              <select
                value={assetForm.category}
                onChange={(e) => setAssetForm({...assetForm, category: e.target.value})}
                className="w-full mt-1 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white outline-none"
              >
                {ASSET_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400">قیمت خرید (هر واحد) *</Label>
                <Input
                  type="number"
                  value={assetForm.buyPrice}
                  onChange={(e) => setAssetForm({...assetForm, buyPrice: e.target.value})}
                  placeholder="42000000"
                  className={cn(
                    "mt-1 bg-slate-800/50 border-slate-700 text-white",
                    assetErrors.buyPrice && "border-red-500"
                  )}
                />
                {assetErrors.buyPrice && (
                  <p className="text-xs text-red-400 mt-1">{assetErrors.buyPrice}</p>
                )}
              </div>
              <div>
                <Label className="text-slate-400">قیمت فعلی (هر واحد) *</Label>
                <Input
                  type="number"
                  value={assetForm.currentPrice}
                  onChange={(e) => setAssetForm({...assetForm, currentPrice: e.target.value})}
                  placeholder="45000000"
                  className={cn(
                    "mt-1 bg-slate-800/50 border-slate-700 text-white",
                    assetErrors.currentPrice && "border-red-500"
                  )}
                />
                {assetErrors.currentPrice && (
                  <p className="text-xs text-red-400 mt-1">{assetErrors.currentPrice}</p>
                )}
              </div>
            </div>

            <div>
              <Label className="text-slate-400">تاریخ خرید</Label>
              <Input
                value={assetForm.buyDate}
                onChange={(e) => setAssetForm({...assetForm, buyDate: e.target.value})}
                placeholder="1403/01/15"
                className="mt-1 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-400">یادداشت (اختیاری)</Label>
              <Input
                value={assetForm.note}
                onChange={(e) => setAssetForm({...assetForm, note: e.target.value})}
                placeholder="توضیحات اضافی..."
                className="mt-1 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
          </div>

          <DialogFooter className="gap-3">
            <button
              onClick={() => setShowAssetDialog(false)}
              className="px-6 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-white transition-all"
            >
              انصراف
            </button>
            <button
              onClick={saveAsset}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'در حال ذخیره...' : (editingItem ? 'ذخیره' : 'افزودن')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}