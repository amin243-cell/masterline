import { useState, useRef, useEffect } from 'react'
import { 
  Bell, Database, Info, LogOut, 
  Moon, Sun, Globe, Palette, Download, Upload,
  Trash2, AlertTriangle, CheckCircle2, FileJson,
  Volume2, VolumeX, Sparkles, Shield, Clock,
  HardDrive, Activity, Zap, FileCheck, Lock,
  Eye, EyeOff, RefreshCw, XCircle, CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Switch } from '../components/ui/switch'
import { Input } from '../components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import Toast from '../components/ui/toast'
import useStore from '../store/useStore'
import { useTranslation } from '../hooks/useTranslation'
import { useDatabase } from '../hooks/useDatabase'
import { formatBytes } from '../utils/database'

export default function Settings() {
  const { t } = useTranslation()
  const fileInputRef = useRef(null)
  const encryptedFileInputRef = useRef(null)
  
  const settings = useStore((state) => state.settings)
  const updateSettings = useStore((state) => state.updateSettings)
  const resetAllData = useStore((state) => state.resetAllData)
  
  const [toast, setToast] = useState(null)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [showBackupPasswordDialog, setShowBackupPasswordDialog] = useState(false)
  const [showRestorePasswordDialog, setShowRestorePasswordDialog] = useState(false)
  const [showOptimizeDialog, setShowOptimizeDialog] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  
  // وضعیت مجوز نوتیفیکیشن
  const [notificationPermission, setNotificationPermission] = useState('default')
  
  // Database hook
  const { stats, health, loading, error, optimize, backup, restore } = useDatabase()
  
  // Password states
  const [backupPassword, setBackupPassword] = useState('')
  const [restorePassword, setRestorePassword] = useState('')
  const [showBackupPassword, setShowBackupPassword] = useState(false)
  const [showRestorePassword, setShowRestorePassword] = useState(false)
  const [useEncryption, setUseEncryption] = useState(false)
  
  // بررسی وضعیت مجوز نوتیفیکیشن
useEffect(() => {
  if ('Notification' in window) {
    const checkPermission = () => {
      const permission = Notification.permission
      console.log('🔍 بررسی مجوز نوتیفیکیشن:', permission)
      setNotificationPermission(permission)
    }
    
    checkPermission()
    
    // بررسی مجدد بعد از ۱ ثانیه (برای اطمینان)
    const timer = setTimeout(checkPermission, 1000)
    
    return () => clearTimeout(timer)
  }
}, [])
  
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }
  
  const handleResetData = () => {
    resetAllData()
    showToast(t('settings.successReset'), 'success')
    setShowResetDialog(false)
  }
  
  const handleExportData = async () => {
    try {
      await backup(useEncryption ? backupPassword : null)
      showToast(t('settings.successExport'), 'success')
      setShowExportDialog(false)
      setShowBackupPasswordDialog(false)
      setBackupPassword('')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }
  
  const handleImportClick = () => {
    fileInputRef.current?.click()
  }
  
  const handleEncryptedImportClick = () => {
    encryptedFileInputRef.current?.click()
  }
  
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsImporting(true)
    try {
      await restore(file)
      showToast(t('settings.successImport'), 'success')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }
  
  const handleEncryptedFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!restorePassword) {
      showToast('لطفاً رمز عبور را وارد کنید', 'error')
      return
    }
    
    setIsImporting(true)
    try {
      await restore(file, restorePassword)
      showToast(t('settings.successImport'), 'success')
      setShowRestorePasswordDialog(false)
      setRestorePassword('')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setIsImporting(false)
      if (encryptedFileInputRef.current) encryptedFileInputRef.current.value = ''
    }
  }
  
  const handleOptimize = async () => {
    try {
      const result = await optimize({ compressData: true })
      showToast(`بهینه‌سازی انجام شد. ${result.removedCount} رکورد حذف شد.`, 'success')
      setShowOptimizeDialog(false)
    } catch (err) {
      showToast(err.message, 'error')
    }
  }
  
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      showToast('مرورگر از نوتیفیکیشن پشتیبانی نمی‌کند', 'error')
      return
    }
    
    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      
      if (permission === 'granted') {
        showToast('✅ مجوز نوتیفیکیشن داده شد', 'success')
      } else if (permission === 'denied') {
        showToast('⚠️ مجوز نوتیفیکیشن رد شد. لطفاً از تنظیمات مرورگر فعال کنید.', 'error')
      }
    } catch (error) {
      showToast('خطا در درخواست مجوز', 'error')
    }
  }
  
  const getHealthColor = (score) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-amber-400'
    return 'text-red-400'
  }
  
  const getHealthBg = (score) => {
    if (score >= 80) return 'bg-emerald-500/15 border-emerald-500/40'
    if (score >= 60) return 'bg-amber-500/15 border-amber-500/40'
    return 'bg-red-500/15 border-red-500/40'
  }
  
  return (
    <div className="p-8 space-y-8 bg-grid-ultra min-h-screen overflow-y-auto custom-scrollbar-ultra" dir="rtl">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={encryptedFileInputRef}
        type="file"
        accept=".json"
        onChange={handleEncryptedFileChange}
        className="hidden"
      />
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* هدر */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center glow-green-ultra animate-float">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gradient-ultra">{t('settings.title')}</h1>
            <p className="text-base text-slate-400 mt-1">{t('settings.subtitle')}</p>
          </div>
        </div>
      </div>
      
      {/* ==================== مدیریت دیتابیس ==================== */}
      <Card className="card-ultra animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-blue-400" />
            مدیریت دیتابیس
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          {/* آمار کلی */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-slate-400 text-sm">حجم کل</p>
              </div>
              <p className="text-2xl font-black text-white">{stats.totalSizeFormatted}</p>
              <p className="text-xs text-slate-500 mt-1">از ۵ مگابایت</p>
              <div className="mt-3 h-2 rounded-full bg-slate-700 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                  style={{ width: `${stats.storageUsage}%` }}
                />
              </div>
            </div>
            
            <div className="p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-slate-400 text-sm">تعداد رکوردها</p>
              </div>
              <p className="text-2xl font-black text-white">{stats.totalRecords}</p>
              <p className="text-xs text-slate-500 mt-1">در تمام بخش‌ها</p>
            </div>
            
            <div className="p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getHealthBg(health.score)}`}>
                  <FileCheck className={`w-5 h-5 ${getHealthColor(health.score)}`} />
                </div>
                <p className="text-slate-400 text-sm">سلامت دیتابیس</p>
              </div>
              <p className={`text-2xl font-black ${getHealthColor(health.score)}`}>{health.score}٪</p>
              <p className="text-xs text-slate-500 mt-1">
                {health.healthy ? 'سالم' : `${health.issues.length} مشکل`}
              </p>
            </div>
          </div>
          
          {/* آمار هر بخش */}
          <div className="p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              جزئیات هر بخش
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(stats.sections).map(([key, data]) => (
                <div key={key} className="p-3 rounded-xl bg-slate-900/50 border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">
                    {key === 'accounts' && 'حساب‌ها'}
                    {key === 'assets' && 'دارایی‌ها'}
                    {key === 'activities' && 'فعالیت‌ها'}
                    {key === 'loans' && 'وام‌ها'}
                    {key === 'subscriptions' && 'اشتراک‌ها'}
                    {key === 'debts' && 'بدهی‌ها'}
                    {key === 'goals' && 'اهداف'}
                    {key === 'reminders' && 'یادآورها'}
                  </p>
                  <p className="text-lg font-bold text-white">{data.count}</p>
                  <p className="text-xs text-slate-500">{data.sizeFormatted}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* مشکلات و هشدارها */}
          {(health.issues.length > 0 || health.warnings.length > 0) && (
            <div className="p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700 space-y-3">
              <h3 className="text-white font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                مشکلات و هشدارها
              </h3>
              {health.issues.map((issue, i) => (
                <div key={i} className="flex items-center gap-2 text-red-400 text-sm">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  {issue}
                </div>
              ))}
              {health.warnings.map((warning, i) => (
                <div key={i} className="flex items-center gap-2 text-amber-400 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {warning}
                </div>
              ))}
            </div>
          )}
          
          {/* دکمه‌های عملیات */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={() => setShowOptimizeDialog(true)}
              className="btn-ultra btn-ultra-secondary w-full"
            >
              <Zap className="w-5 h-5" />
              بهینه‌سازی دیتابیس
            </Button>
            <Button
              onClick={() => setShowExportDialog(true)}
              className="btn-ultra btn-ultra-primary w-full"
            >
              <Download className="w-5 h-5" />
              پشتیبان‌گیری پیشرفته
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* تنظیمات عمومی */}
      <Card className="card-ultra animate-fade-in-up delay-100">
        <CardHeader>
          <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
            <Palette className="w-6 h-6 text-emerald-400" />
            {t('settings.general')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-8">
          {/* تم */}
          <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center">
                {settings.theme === 'dark' ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
              </div>
              <div>
                <p className="text-white font-bold">{t('settings.theme')}</p>
                <p className="text-xs text-slate-400">{t('settings.themeDesc')}</p>
              </div>
            </div>
            <Select value={settings.theme} onValueChange={(v) => updateSettings({ theme: v })}>
              <SelectTrigger className="w-32 input-ultra">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                <SelectItem value="dark" className="text-white">{t('settings.dark')}</SelectItem>
                <SelectItem value="light" className="text-white">{t('settings.light')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* زبان */}
          <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700 hover:border-purple-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-500/15 flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-bold">{t('settings.language')}</p>
                <p className="text-xs text-slate-400">{t('settings.languageDesc')}</p>
              </div>
            </div>
            <Select value={settings.language} onValueChange={(v) => updateSettings({ language: v })}>
              <SelectTrigger className="w-32 input-ultra">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                <SelectItem value="fa" className="text-white">فارسی</SelectItem>
                <SelectItem value="en" className="text-white">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* ارز */}
          <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700 hover:border-amber-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <p className="text-white font-bold">{t('settings.currency')}</p>
                <p className="text-xs text-slate-400">{t('settings.currencyDesc')}</p>
              </div>
            </div>
            <Select value={settings.currency} onValueChange={(v) => updateSettings({ currency: v })}>
              <SelectTrigger className="w-32 input-ultra">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                <SelectItem value="IRR" className="text-white">ریال</SelectItem>
                <SelectItem value="USD" className="text-white">دلار</SelectItem>
                <SelectItem value="USDT" className="text-white">تتر</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* اعلان‌ها */}
      <Card className="card-ultra animate-fade-in-up delay-200">
        <CardHeader>
          <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-yellow-400" />
            {t('settings.notifications')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-8">
          <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700 hover:border-blue-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-bold">{t('settings.appNotifications')}</p>
                <p className="text-xs text-slate-400">{t('settings.appNotificationsDesc')}</p>
              </div>
            </div>
            <Switch 
              checked={settings.notifications} 
              onCheckedChange={(v) => updateSettings({ notifications: v })}
            />
          </div>
          
          <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700 hover:border-cyan-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/15 flex items-center justify-center">
                {settings.sound ? <Volume2 className="w-5 h-5 text-cyan-400" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
              </div>
              <div>
                <p className="text-white font-bold">{t('settings.sound')}</p>
                <p className="text-xs text-slate-400">{t('settings.soundDesc')}</p>
              </div>
            </div>
            <Switch 
              checked={settings.sound} 
              onCheckedChange={(v) => updateSettings({ sound: v })}
            />
          </div>

          <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700 hover:border-green-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-green-500/15 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-white font-bold">{t('settings.autoBackup')}</p>
                <p className="text-xs text-slate-400">{t('settings.autoBackupDesc')}</p>
              </div>
            </div>
            <Switch 
              checked={settings.autoBackup} 
              onCheckedChange={(v) => updateSettings({ autoBackup: v })}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* ==================== وضعیت مجوز نوتیفیکیشن ==================== */}
      {settings.notifications && (
        <Card className="card-ultra animate-fade-in-up delay-250">
          <CardHeader>
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-cyan-400" />
              وضعیت مجوز نوتیفیکیشن
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    notificationPermission === 'granted' 
                      ? 'bg-emerald-500/15' 
                      : notificationPermission === 'denied'
                      ? 'bg-red-500/15'
                      : 'bg-amber-500/15'
                  }`}>
                    {notificationPermission === 'granted' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : notificationPermission === 'denied' ? (
                      <XCircle className="w-5 h-5 text-red-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-bold">
                      {notificationPermission === 'granted' && 'مجوز داده شده ✅'}
                      {notificationPermission === 'denied' && 'مجوز رد شده ❌'}
                      {notificationPermission === 'default' && 'مجوز داده نشده ⚠️'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {notificationPermission === 'granted' && 'نوتیفیکیشن‌ها فعال هستند'}
                      {notificationPermission === 'denied' && 'برای فعال‌سازی، تنظیمات مرورگر را تغییر دهید'}
                      {notificationPermission === 'default' && 'برای دریافت اعلان‌ها، مجوز دهید'}
                    </p>
                  </div>
                </div>
                {notificationPermission !== 'granted' && (
                  <Button
                    onClick={requestNotificationPermission}
                    className="btn-ultra btn-ultra-primary"
                  >
                    <Bell className="w-5 h-5" />
                    درخواست مجوز
                  </Button>
                )}
              </div>
              
              {notificationPermission === 'denied' && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <p className="text-red-300 text-sm">
                    💡 <strong>راهنمایی:</strong> برای فعال‌سازی نوتیفیکیشن‌ها:
                  </p>
                  <ol className="text-red-300 text-sm mt-2 space-y-1 list-decimal list-inside">
                    <li>روی آیکون قفل 🔒 کنار آدرس بار کلیک کنید</li>
                    <li>به Site settings بروید</li>
                    <li>Notifications را روی Allow قرار دهید</li>
                    <li>صفحه را رفرش کنید</li>
                  </ol>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* پشتیبان‌گیری ساده */}
      <Card className="card-ultra animate-fade-in-up delay-300">
        <CardHeader>
          <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-400" />
            {t('settings.backup')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-8">
          <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700 hover:border-blue-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <Upload className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-bold">{t('settings.import')}</p>
                <p className="text-xs text-slate-400">{t('settings.importDesc')}</p>
              </div>
            </div>
            <Button 
              onClick={handleImportClick}
              disabled={isImporting}
              className="btn-ultra btn-ultra-secondary"
            >
              <Upload className="w-5 h-5" />
              {isImporting ? t('settings.loading') : t('settings.selectFile')}
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-800/50 border-2 border-red-500/20 hover:border-red-500/40 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-red-500/15 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-white font-bold">{t('settings.reset')}</p>
                <p className="text-xs text-slate-400">{t('settings.resetDesc')}</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowResetDialog(true)}
              className="btn-ultra btn-ultra-danger"
            >
              <Trash2 className="w-5 h-5" />
              {t('settings.resetButton')}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* درباره برنامه */}
      <Card className="card-ultra animate-fade-in-up delay-400">
        <CardHeader>
          <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
            <Info className="w-6 h-6 text-purple-400" />
            {t('settings.about')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="p-6 rounded-2xl bg-slate-800/50 border-2 border-slate-700 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center glow-green-ultra animate-pulse-glow">
                <span className="text-white text-3xl font-black">M</span>
              </div>
              <div>
                <h3 className="text-white font-black text-xl">{t('settings.appName')}</h3>
                <p className="text-slate-400 text-sm">{t('settings.appDesc')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-slate-700">
              <div>
                <p className="text-xs text-slate-400">{t('settings.version')}</p>
                <p className="text-white font-bold font-mono">1.0.0</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{t('settings.builtWith')}</p>
                <p className="text-white font-bold">React + Tauri</p>
              </div>
            </div>
            
            <div className="pt-4 border-t-2 border-slate-700">
              <p className="text-xs text-slate-400 mb-3">{t('settings.features')}</p>
              <ul className="text-sm text-slate-300 space-y-2">
                {[
                  t('settings.feature1'),
                  t('settings.feature2'),
                  t('settings.feature3'),
                  t('settings.feature4'),
                  t('settings.feature5'),
                  t('settings.feature6'),
                  t('settings.feature7'),
                  t('settings.feature8'),
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* خروج */}
      <Card className="card-ultra animate-fade-in-up delay-500" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-red-500/15 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-white font-bold">{t('settings.exit')}</p>
                <p className="text-xs text-slate-400">{t('settings.exitDesc')}</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowExitDialog(true)}
              className="btn-ultra btn-ultra-danger"
            >
              <LogOut className="w-5 h-5" />
              {t('settings.exitButton')}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Dialog پاک کردن */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="card-ultra text-white">
          <DialogHeader>
            <DialogTitle className="text-right text-2xl font-black flex items-center gap-2">
              <AlertTriangle className="w-7 h-7 text-red-400" />
              {t('settings.resetDialogTitle')}
            </DialogTitle>
            <DialogDescription className="text-right text-slate-400">
              {t('settings.resetDialogDesc')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="p-5 rounded-2xl bg-red-500/10 border-2 border-red-500/30">
              <p className="text-red-400 font-bold">⚠️ {t('settings.warning')}</p>
              <p className="text-red-300 text-sm mt-2">
                {t('settings.warningResetText')}
              </p>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button onClick={() => setShowResetDialog(false)} className="btn-ultra btn-ultra-secondary">
              {t('settings.cancel')}
            </Button>
            <Button onClick={handleResetData} className="btn-ultra btn-ultra-danger">
              <Trash2 className="w-5 h-5" />
              {t('settings.yesDelete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog پشتیبان‌گیری پیشرفته */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="card-ultra text-white">
          <DialogHeader>
            <DialogTitle className="text-right text-2xl font-black flex items-center gap-2">
              <Shield className="w-7 h-7 text-emerald-400" />
              پشتیبان‌گیری پیشرفته
            </DialogTitle>
            <DialogDescription className="text-right text-slate-400">
              ایجاد فایل پشتیبان با امکان رمزگذاری
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700 space-y-3">
              <p className="text-white font-bold">داده‌های شامل:</p>
              <ul className="text-slate-400 text-sm space-y-2">
                {[
                  'حساب‌های مالی',
                  'دارایی‌های فیزیکی',
                  'فعالیت‌های ترید',
                  'وام‌ها و بدهی‌ها',
                  'اشتراک‌ها',
                  'اهداف و یادآورها',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-purple-400" />
                  <p className="text-white font-bold">رمزگذاری AES-256</p>
                </div>
                <Switch 
                  checked={useEncryption} 
                  onCheckedChange={setUseEncryption}
                />
              </div>
              <p className="text-xs text-slate-400">
                با فعال‌سازی، فایل با رمز عبور محافظت می‌شود
              </p>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button onClick={() => setShowExportDialog(false)} className="btn-ultra btn-ultra-secondary">
              {t('settings.cancel')}
            </Button>
            <Button 
              onClick={() => {
                if (useEncryption) {
                  setShowBackupPasswordDialog(true)
                } else {
                  handleExportData()
                }
              }}
              className="btn-ultra btn-ultra-primary"
            >
              <Download className="w-5 h-5" />
              ایجاد پشتیبان
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog رمز عبور Backup */}
      <Dialog open={showBackupPasswordDialog} onOpenChange={setShowBackupPasswordDialog}>
        <DialogContent className="card-ultra text-white">
          <DialogHeader>
            <DialogTitle className="text-right text-2xl font-black flex items-center gap-2">
              <Lock className="w-7 h-7 text-purple-400" />
              رمز عبور پشتیبان
            </DialogTitle>
            <DialogDescription className="text-right text-slate-400">
              رمز عبور قوی وارد کنید (حداقل ۸ کاراکتر)
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="relative">
              <Input
                type={showBackupPassword ? 'text' : 'password'}
                value={backupPassword}
                onChange={(e) => setBackupPassword(e.target.value)}
                placeholder="رمز عبور..."
                className="input-ultra w-full"
              />
              <button
                onClick={() => setShowBackupPassword(!showBackupPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showBackupPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {backupPassword.length > 0 && backupPassword.length < 8 && (
              <p className="text-red-400 text-xs mt-2">رمز عبور باید حداقل ۸ کاراکتر باشد</p>
            )}
          </div>
          
          <DialogFooter className="gap-2">
            <Button onClick={() => setShowBackupPasswordDialog(false)} className="btn-ultra btn-ultra-secondary">
              {t('settings.cancel')}
            </Button>
            <Button 
              onClick={handleExportData}
              disabled={backupPassword.length < 8}
              className="btn-ultra btn-ultra-primary"
            >
              <Download className="w-5 h-5" />
              دانلود رمزگذاری شده
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog بهینه‌سازی */}
      <Dialog open={showOptimizeDialog} onOpenChange={setShowOptimizeDialog}>
        <DialogContent className="card-ultra text-white">
          <DialogHeader>
            <DialogTitle className="text-right text-2xl font-black flex items-center gap-2">
              <Zap className="w-7 h-7 text-amber-400" />
              بهینه‌سازی دیتابیس
            </DialogTitle>
            <DialogDescription className="text-right text-slate-400">
              حذف داده‌های اضافی و فشرده‌سازی
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700 space-y-3">
              <p className="text-white font-bold">عملیات بهینه‌سازی:</p>
              <ul className="text-slate-400 text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  حذف فیلدهای خالی از رکوردها
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  فشرده‌سازی داده‌ها
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  بررسی یکپارچگی داده‌ها
                </li>
              </ul>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button onClick={() => setShowOptimizeDialog(false)} className="btn-ultra btn-ultra-secondary">
              {t('settings.cancel')}
            </Button>
            <Button onClick={handleOptimize} className="btn-ultra btn-ultra-primary">
              <Zap className="w-5 h-5" />
              شروع بهینه‌سازی
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog خروج */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="card-ultra text-white">
          <DialogHeader>
            <DialogTitle className="text-right text-2xl font-black flex items-center gap-2">
              <LogOut className="w-7 h-7 text-red-400" />
              {t('settings.exit')}
            </DialogTitle>
            <DialogDescription className="text-right text-slate-400">
              {t('settings.exitDesc')}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2">
            <Button onClick={() => setShowExitDialog(false)} className="btn-ultra btn-ultra-secondary">
              {t('settings.cancel')}
            </Button>
            <Button 
              onClick={() => {
                showToast('در حال خروج...', 'info')
                setTimeout(() => window.close(), 800)
              }}
              className="btn-ultra btn-ultra-danger"
            >
              <LogOut className="w-5 h-5" />
              {t('settings.exitButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}