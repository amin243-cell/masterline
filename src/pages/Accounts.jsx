import { useState } from 'react'
import { TrendingUp, Building2, Bitcoin, Wallet, Plus, Search, Edit3, Trash2, Inbox } from 'lucide-react'
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
import { formatNumber } from '../lib/helpers'
import useConfirm from '../hooks/useConfirm'
import useAlert from '../hooks/useAlert'
import useDebounce from '../hooks/useDebounce'
import FormField from '../components/ui/FormField'
import LoadingButton from '../components/ui/LoadingButton'
import EmptyState from '../components/ui/EmptyState'

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
  { value: 'gold', label: ' طلا' },
  { value: 'silver', label: '🥈 نقره' },
  { value: 'car', label: ' خودرو' },
  { value: 'realEstate', label: ' ملک' },
  { value: 'cash', label: ' پول نقد' },
  { value: 'other', label: '📦 سایر' },
]

export default function Accounts() {
  const { accounts, assets, addAccount, deleteAccount, updateAccount, addAsset, deleteAsset, updateAsset } = useStore()
  
  const [activeSection, setActiveSection] = useState('accounts')
  const [accountCategory, setAccountCategory] = useState('trading')
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  
  const [showAccountDialog, setShowAccountDialog] = useState(false)
  const [showAssetDialog, setShowAssetDialog] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [accountForm, setAccountForm] = useState({
    name: '', balance: '', currency: 'USDT', category: 'trading'
  })
  const [assetForm, setAssetForm] = useState({
    name: '', amount: '', unit: 'عدد', category: 'gold', 
    buyPrice: '', currentPrice: '', buyDate: '', note: ''
  })

  const [accountErrors, setAccountErrors] = useState({})
  const [assetErrors, setAssetErrors] = useState({})

  const { confirm, ConfirmComponent } = useConfirm()
  const { alert, AlertComponent } = useAlert()

  const filteredAccounts = accounts.filter(a => 
    a.category === accountCategory && 
    a.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  )

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  )

  const tradingTotal = accounts.filter(a => a.category === 'trading').reduce((sum, a) => sum + a.balance, 0)
  const bankTotal = accounts.filter(a => a.category === 'bank').reduce((sum, a) => sum + a.balance, 0)
  const cryptoCount = accounts.filter(a => a.category === 'crypto').length
  const totalAssetsValue = assets.reduce((sum, a) => sum + (a.currentPrice * a.amount), 0)

  const validateAccountForm = () => {
    const errors = {}
    if (!accountForm.name.trim()) errors.name = 'نام حساب الزامی است'
    if (!accountForm.balance || parseFloat(accountForm.balance) <= 0) errors.balance = 'موجودی باید بیشتر از صفر باشد'
    setAccountErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateAssetForm = () => {
    const errors = {}
    if (!assetForm.name.trim()) errors.name = 'نام دارایی الزامی است'
    if (!assetForm.amount || parseFloat(assetForm.amount) <= 0) errors.amount = 'مقدار باید بیشتر از صفر باشد'
    if (!assetForm.buyPrice || parseFloat(assetForm.buyPrice) <= 0) errors.buyPrice = 'قیمت خرید الزامی است'
    if (!assetForm.currentPrice || parseFloat(assetForm.currentPrice) <= 0) errors.currentPrice = 'قیمت فعلی الزامی است'
    setAssetErrors(errors)
    return Object.keys(errors).length === 0
  }

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
      await alert({
        title: 'خطا در اعتبارسنجی',
        message: 'لطفاً فیلدهای الزامی را به درستی پر کنید',
        type: 'error'
      })
      return
    }

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    const data = {
      name: accountForm.name,
      balance: parseFloat(accountForm.balance),
      currency: accountForm.currency,
      category: accountForm.category
    }
    
    if (editingItem) {
      updateAccount(editingItem.id, data)
      await alert({
        title: 'موفقیت',
        message: 'حساب با موفقیت ویرایش شد',
        type: 'success'
      })
    } else {
      addAccount(data)
      await alert({
        title: 'موفقیت',
        message: 'حساب جدید با موفقیت اضافه شد',
        type: 'success'
      })
    }
    
    setIsSubmitting(false)
    setShowAccountDialog(false)
  }

  const openAddAsset = () => {
    setEditingItem(null)
    setAssetForm({ name: '', amount: '', unit: 'عدد', category: 'gold', buyPrice: '', currentPrice: '', buyDate: '', note: '' })
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
      buyPrice: asset.buyPrice.toString(),
      currentPrice: asset.currentPrice.toString(),
      buyDate: asset.buyDate,
      note: asset.note || ''
    })
    setAssetErrors({})
    setShowAssetDialog(true)
  }

  const saveAsset = async () => {
    if (!validateAssetForm()) {
      await alert({
        title: 'خطا در اعتبارسنجی',
        message: 'لطفاً فیلدهای الزامی را به درستی پر کنید',
        type: 'error'
      })
      return
    }

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    const data = {
      name: assetForm.name,
      amount: parseFloat(assetForm.amount),
      unit: assetForm.unit || 'عدد',
      category: assetForm.category,
      buyPrice: parseFloat(assetForm.buyPrice),
      currentPrice: parseFloat(assetForm.currentPrice),
      buyDate: assetForm.buyDate,
      note: assetForm.note
    }
    
    if (editingItem) {
      updateAsset(editingItem.id, data)
      await alert({
        title: 'موفقیت',
        message: 'دارایی با موفقیت ویرایش شد',
        type: 'success'
      })
    } else {
      addAsset(data)
      await alert({
        title: 'موفقیت',
        message: 'دارایی جدید با موفقیت اضافه شد',
        type: 'success'
      })
    }
    
    setIsSubmitting(false)
    setShowAssetDialog(false)
  }

  const handleDeleteAccount = async (account) => {
    const confirmed = await confirm({
      title: 'حذف حساب',
      message: `آیا از حذف حساب "${account.name}" مطمئن هستید؟ این عمل قابل بازگشت نیست.`,
      type: 'danger',
      confirmText: 'حذف',
      cancelText: 'انصراف'
    })
    
    if (confirmed) {
      deleteAccount(account.id)
      await alert({
        title: 'حذف شد',
        message: 'حساب با موفقیت حذف شد',
        type: 'info'
      })
    }
  }

  const handleDeleteAsset = async (asset) => {
    const confirmed = await confirm({
      title: 'حذف دارایی',
      message: `آیا از حذف دارایی "${asset.name}" مطمئن هستید؟ این عمل قابل بازگشت نیست.`,
      type: 'danger',
      confirmText: 'حذف',
      cancelText: 'انصراف'
    })
    
    if (confirmed) {
      deleteAsset(asset.id)
      await alert({
        title: 'حذف شد',
        message: 'دارایی با موفقیت حذف شد',
        type: 'info'
      })
    }
  }

  return (
    <div className="p-8 space-y-8 animate-fade-in-up bg-grid-ultra min-h-screen" dir="rtl">
      <ConfirmComponent />
      <AlertComponent />

      {/* هدر */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gradient-ultra">حساب‌ها و دارایی‌ها</h1>
          <p className="text-base text-slate-400 mt-3">مدیریت کامل دارایی‌های مالی و فیزیکی شما</p>
        </div>
      </div>

      {/* کارت‌های خلاصه */}
      <div className="grid grid-cols-4 gap-5">
        <div className="stat-card-ultra animate-fade-in-up delay-100">
          <div className="flex items-center gap-3">
            <div className="stat-icon-ultra bg-emerald-500/20">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">حساب‌های ترید</p>
              <p className="text-xl font-black text-gradient-ultra font-mono">{formatNumber(tradingTotal)} <span className="text-xs text-slate-400">USDT</span></p>
            </div>
          </div>
        </div>

        <div className="stat-card-ultra animate-fade-in-up delay-200">
          <div className="flex items-center gap-3">
            <div className="stat-icon-ultra bg-blue-500/20">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">حساب‌های بانکی</p>
              <p className="text-xl font-black text-white font-mono">{formatNumber(bankTotal)} <span className="text-xs text-slate-400">IRR</span></p>
            </div>
          </div>
        </div>

        <div className="stat-card-ultra animate-fade-in-up delay-300">
          <div className="flex items-center gap-3">
            <div className="stat-icon-ultra bg-orange-500/20">
              <Bitcoin className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">کیف پول کریپتو</p>
              <p className="text-xl font-black text-white font-mono">{cryptoCount} <span className="text-xs text-slate-400">کیف پول</span></p>
            </div>
          </div>
        </div>

        <div className="stat-card-ultra animate-fade-in-up delay-400">
          <div className="flex items-center gap-3">
            <div className="stat-icon-ultra bg-amber-500/20">
              <Wallet className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">دارایی‌های فیزیکی</p>
              <p className="text-xl font-black text-gradient-ultra font-mono">{formatNumber(totalAssetsValue)} <span className="text-xs text-slate-400">IRR</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* نوار ابزار: تب‌ها + دکمه‌های اصلی */}
      <div className="card-ultra p-2 flex items-center justify-between">
        <div className="flex items-center gap-2 p-1 bg-slate-900/50 rounded-2xl">
          <button
            onClick={() => { setActiveSection('accounts'); setSearchQuery('') }}
            className={`relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
              activeSection === 'accounts'
                ? 'text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {activeSection === 'accounts' && (
              <div className="absolute inset-0 bg-gradient-to-l from-emerald-500/30 to-transparent rounded-xl border border-emerald-500/40" style={{ boxShadow: 'var(--shadow-glow-green)' }} />
            )}
            <span className="relative z-10">حساب‌های مالی</span>
          </button>
          <button
            onClick={() => { setActiveSection('assets'); setSearchQuery('') }}
            className={`relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
              activeSection === 'assets'
                ? 'text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {activeSection === 'assets' && (
              <div className="absolute inset-0 bg-gradient-to-l from-amber-500/30 to-transparent rounded-xl border border-amber-500/40" style={{ boxShadow: 'var(--shadow-glow-amber)' }} />
            )}
            <span className="relative z-10">دارایی‌های فیزیکی</span>
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={activeSection === 'accounts' ? openAddAccount : openAddAsset}
            className="relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 text-white border-2"
            style={activeSection === 'accounts' 
              ? { background: 'linear-gradient(135deg, #10b981, #059669)', borderColor: 'rgba(16, 185, 129, 0.5)', boxShadow: 'var(--shadow-glow-green)' }
              : { background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderColor: 'rgba(245, 158, 11, 0.5)', boxShadow: 'var(--shadow-glow-amber)' }
            }
          >
            <Plus className="w-5 h-5" />
            {activeSection === 'accounts' ? 'حساب جدید' : 'دارایی جدید'}
          </button>
        </div>
      </div>

      {/* بخش حساب‌ها */}
      {activeSection === 'accounts' && (
        <div className="space-y-5">
          {/* دسته‌بندی */}
          <div className="flex gap-3">
            <button
              onClick={() => setAccountCategory('trading')}
              className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center gap-2 border-2 ${
                accountCategory === 'trading'
                  ? 'text-white border-emerald-500/60'
                  : 'text-slate-400 border-slate-700/50 hover:border-slate-600 hover:text-white'
              }`}
              style={accountCategory === 'trading' ? { 
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3))',
                boxShadow: 'var(--shadow-glow-green)'
              } : {
                background: 'rgba(30, 41, 59, 0.4)'
              }}
            >
              <TrendingUp className="w-5 h-5" />
              حساب‌های ترید
            </button>
            <button
              onClick={() => setAccountCategory('bank')}
              className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center gap-2 border-2 ${
                accountCategory === 'bank'
                  ? 'text-white border-blue-500/60'
                  : 'text-slate-400 border-slate-700/50 hover:border-slate-600 hover:text-white'
              }`}
              style={accountCategory === 'bank' ? { 
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3))',
                boxShadow: 'var(--shadow-glow-blue)'
              } : {
                background: 'rgba(30, 41, 59, 0.4)'
              }}
            >
              <Building2 className="w-5 h-5" />
              حساب‌های بانکی
            </button>
            <button
              onClick={() => setAccountCategory('crypto')}
              className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center gap-2 border-2 ${
                accountCategory === 'crypto'
                  ? 'text-white border-amber-500/60'
                  : 'text-slate-400 border-slate-700/50 hover:border-slate-600 hover:text-white'
              }`}
              style={accountCategory === 'crypto' ? { 
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(217, 119, 6, 0.3))',
                boxShadow: 'var(--shadow-glow-amber)'
              } : {
                background: 'rgba(30, 41, 59, 0.4)'
              }}
            >
              <Bitcoin className="w-5 h-5" />
              کیف پول کریپتو
            </button>
          </div>

          {/* جستجو */}
          <div className="search-bar-ultra">
            <Search className="search-icon" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در حساب‌ها..."
            />
          </div>

          {/* لیست حساب‌ها */}
          {filteredAccounts.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={searchQuery ? 'حسابی یافت نشد' : 'هنوز حسابی ثبت نشده است'}
              description={searchQuery ? 'عبارت جستجو را تغییر دهید' : 'برای شروع روی دکمه "حساب جدید" کلیک کنید'}
              actionText={!searchQuery ? 'افزودن حساب' : undefined}
              onAction={!searchQuery ? openAddAccount : undefined}
              searchActive={!!searchQuery}
            />
          ) : (
            <div className="grid grid-cols-3 gap-5">
              {filteredAccounts.map(account => (
                <div key={account.id} className="item-card-ultra p-6 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`stat-icon-ultra ${
                      accountCategory === 'trading' ? 'bg-emerald-500/20' :
                      accountCategory === 'bank' ? 'bg-blue-500/20' :
                      'bg-orange-500/20'
                    }`}>
                      {accountCategory === 'trading' ? <TrendingUp className="w-6 h-6 text-emerald-400" /> :
                       accountCategory === 'bank' ? <Building2 className="w-6 h-6 text-blue-400" /> :
                       <Bitcoin className="w-6 h-6 text-orange-400" />}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditAccount(account)} className="btn-icon-ultra" title="ویرایش">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteAccount(account)} className="btn-icon-ultra btn-icon-danger" title="حذف">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-white font-bold text-lg mb-2">{account.name}</h4>
                  <p className="text-2xl font-black text-white font-mono">
                    {formatNumber(account.balance)} <span className="text-sm text-slate-400">{account.currency}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* بخش دارایی‌ها */}
      {activeSection === 'assets' && (
        <div className="space-y-5">
          <div className="search-bar-ultra">
            <Search className="search-icon" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در دارایی‌ها..."
            />
          </div>

          {filteredAssets.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={searchQuery ? 'دارایی یافت نشد' : 'هنوز دارایی ثبت نشده است'}
              description={searchQuery ? 'عبارت جستجو را تغییر دهید' : 'برای شروع روی دکمه "دارایی جدید" کلیک کنید'}
              actionText={!searchQuery ? 'افزودن دارایی' : undefined}
              onAction={!searchQuery ? openAddAsset : undefined}
              searchActive={!!searchQuery}
            />
          ) : (
            <div className="grid grid-cols-3 gap-5">
              {filteredAssets.map(asset => {
                const category = ASSET_CATEGORIES.find(c => c.value === asset.category) || ASSET_CATEGORIES[5]
                const profit = (asset.currentPrice - asset.buyPrice) * asset.amount
                const isProfit = profit >= 0
                
                return (
                  <div key={asset.id} className="item-card-ultra p-6 group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-3xl">{category.label.split(' ')[0]}</div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditAsset(asset)} className="btn-icon-ultra" title="ویرایش">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteAsset(asset)} className="btn-icon-ultra btn-icon-danger" title="حذف">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-white font-bold text-lg mb-1">{asset.name}</h4>
                    <p className="text-sm text-slate-400 mb-3">{asset.amount} {asset.unit}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">ارزش فعلی:</span>
                        <span className="text-white font-bold font-mono">{formatNumber(asset.currentPrice * asset.amount)} ریال</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">سود/ضرر:</span>
                        <span className={`font-bold font-mono ${isProfit ? 'text-gradient-ultra' : 'text-gradient-danger'}`}>
                          {isProfit ? '+' : ''}{formatNumber(profit)} ریال
                        </span>
                      </div>
                    </div>
                    
                    {asset.buyDate && (
                      <p className="text-xs text-slate-500 mt-3">📅 {asset.buyDate}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Dialog حساب */}
      <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
        <DialogContent className="card-ultra text-white max-w-md animate-scale-in" style={{ position: 'fixed' }}>
          <DialogHeader>
            <DialogTitle className="text-right text-2xl font-black">{editingItem ? 'ویرایش حساب' : 'افزودن حساب جدید'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <FormField label="نام حساب" error={accountErrors.name} required>
              <Input 
                value={accountForm.name} 
                onChange={(e) => { setAccountForm({...accountForm, name: e.target.value}); setAccountErrors({...accountErrors, name: undefined}) }}
                placeholder="مثلاً: بایننس فیوچرز" 
                className="input-ultra" 
              />
            </FormField>
            
            <FormField label="موجودی فعلی" error={accountErrors.balance} required>
              <Input 
                type="number" 
                value={accountForm.balance} 
                onChange={(e) => { setAccountForm({...accountForm, balance: e.target.value}); setAccountErrors({...accountErrors, balance: undefined}) }}
                placeholder="0.00" 
                className="input-ultra font-mono" 
              />
            </FormField>
            
            <FormField label="نوع حساب">
              <Select value={accountForm.category} onValueChange={(v) => setAccountForm({...accountForm, category: v})}>
                <SelectTrigger className="input-ultra"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                  <SelectItem value="trading" className="text-white">حساب ترید</SelectItem>
                  <SelectItem value="bank" className="text-white">حساب بانکی</SelectItem>
                  <SelectItem value="crypto" className="text-white">کیف پول کریپتو</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            
            <FormField label="واحد ارز">
              <Select value={accountForm.currency} onValueChange={(v) => setAccountForm({...accountForm, currency: v})}>
                <SelectTrigger className="input-ultra"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                  <SelectItem value="USDT" className="text-white">USDT (تتر)</SelectItem>
                  <SelectItem value="USD" className="text-white">USD (دلار)</SelectItem>
                  <SelectItem value="IRR" className="text-white">IRR (ریال)</SelectItem>
                  <SelectItem value="BTC" className="text-white">BTC (بیت‌کوین)</SelectItem>
                  <SelectItem value="ETH" className="text-white">ETH (اتریوم)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <DialogFooter className="gap-3 mt-4">
            <button
              onClick={() => setShowAccountDialog(false)}
              className="flex-1 h-12 rounded-xl font-bold text-sm transition-all duration-300 text-slate-400 border-2 border-slate-700/50 hover:border-slate-600 hover:text-white"
              style={{ background: 'rgba(30, 41, 59, 0.4)' }}
            >
              انصراف
            </button>
            <LoadingButton
              onClick={saveAccount}
              loading={isSubmitting}
              className="flex-1 h-12 rounded-xl font-bold text-sm transition-all duration-300 text-white border-2"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderColor: 'rgba(16, 185, 129, 0.5)',
                boxShadow: 'var(--shadow-glow-green)'
              }}
            >
              {editingItem ? 'ذخیره تغییرات' : 'افزودن حساب'}
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog دارایی */}
      <Dialog open={showAssetDialog} onOpenChange={setShowAssetDialog}>
        <DialogContent className="card-ultra text-white max-w-lg animate-scale-in" style={{ position: 'fixed' }}>
          <DialogHeader>
            <DialogTitle className="text-right text-2xl font-black">{editingItem ? 'ویرایش دارایی' : 'افزودن دارایی جدید'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto custom-scrollbar-ultra">
            <FormField label="نام دارایی" error={assetErrors.name} required>
              <Input 
                value={assetForm.name} 
                onChange={(e) => { setAssetForm({...assetForm, name: e.target.value}); setAssetErrors({...assetErrors, name: undefined}) }}
                placeholder="مثلاً: سکه تمام بهار آزادی" 
                className="input-ultra" 
              />
            </FormField>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField label="مقدار" error={assetErrors.amount} required>
                <Input 
                  type="number" 
                  value={assetForm.amount} 
                  onChange={(e) => { setAssetForm({...assetForm, amount: e.target.value}); setAssetErrors({...assetErrors, amount: undefined}) }}
                  placeholder="5" 
                  className="input-ultra font-mono" 
                />
              </FormField>
              
              <FormField label="واحد">
                <Select value={assetForm.unit} onValueChange={(v) => setAssetForm({...assetForm, unit: v})}>
                  <SelectTrigger className="input-ultra"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                    {UNITS.map(u => (
                      <SelectItem key={u.value} value={u.value} className="text-white">{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            
            <FormField label="نوع دارایی">
              <Select value={assetForm.category} onValueChange={(v) => setAssetForm({...assetForm, category: v})}>
                <SelectTrigger className="input-ultra"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                  {ASSET_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value} className="text-white">{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField label="قیمت خرید (هر واحد)" error={assetErrors.buyPrice} required>
                <Input 
                  type="number" 
                  value={assetForm.buyPrice} 
                  onChange={(e) => { setAssetForm({...assetForm, buyPrice: e.target.value}); setAssetErrors({...assetErrors, buyPrice: undefined}) }}
                  placeholder="42000000" 
                  className="input-ultra font-mono" 
                />
              </FormField>
              
              <FormField label="قیمت فعلی (هر واحد)" error={assetErrors.currentPrice} required>
                <Input 
                  type="number" 
                  value={assetForm.currentPrice} 
                  onChange={(e) => { setAssetForm({...assetForm, currentPrice: e.target.value}); setAssetErrors({...assetErrors, currentPrice: undefined}) }}
                  placeholder="45000000" 
                  className="input-ultra font-mono" 
                />
              </FormField>
            </div>
            
            <FormField label="تاریخ خرید">
              <Input 
                value={assetForm.buyDate} 
                onChange={(e) => setAssetForm({...assetForm, buyDate: e.target.value})} 
                placeholder="1403/01/15" 
                className="input-ultra font-mono" 
              />
            </FormField>
            
            <FormField label="یادداشت (اختیاری)">
              <Input 
                value={assetForm.note} 
                onChange={(e) => setAssetForm({...assetForm, note: e.target.value})} 
                placeholder="توضیحات اضافی..." 
                className="input-ultra" 
              />
            </FormField>
          </div>
          <DialogFooter className="gap-3 mt-4">
            <button
              onClick={() => setShowAssetDialog(false)}
              className="flex-1 h-12 rounded-xl font-bold text-sm transition-all duration-300 text-slate-400 border-2 border-slate-700/50 hover:border-slate-600 hover:text-white"
              style={{ background: 'rgba(30, 41, 59, 0.4)' }}
            >
              انصراف
            </button>
            <LoadingButton
              onClick={saveAsset}
              loading={isSubmitting}
              className="flex-1 h-12 rounded-xl font-bold text-sm transition-all duration-300 text-white border-2"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                borderColor: 'rgba(245, 158, 11, 0.5)',
                boxShadow: 'var(--shadow-glow-amber)'
              }}
            >
              {editingItem ? 'ذخیره تغییرات' : 'افزودن دارایی'}
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}