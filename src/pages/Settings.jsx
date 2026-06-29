import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { 
  Bell, Database, Info, LogOut, 
  Moon, Sun, Globe, Palette, Download, Upload,
  Trash2, AlertTriangle, CheckCircle2, 
  Volume2, VolumeX, Sparkles, Shield, Clock,
  HardDrive, Activity, Zap, FileCheck, Lock,
  Eye, EyeOff, RefreshCw, XCircle, CheckCircle,
  Search, Save, HelpCircle, Settings as SettingsIcon,
  Key
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardGrid, CardStat } from '../components/ui/card'
import { Button, ButtonGroup } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Switch, SwitchItem, SwitchGroup, SwitchCard } from '../components/ui/switch'
import { Input, InputGroup, SearchInput } from '../components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogSection,
  DialogActions,
} from '../components/ui/dialog'
import { useToast } from '../components/ui/toast'
import useStore from '../store/useStore'
import { useTranslation } from '../hooks/useTranslation'
import { useDatabase } from '../hooks/useDatabase'
import { useNotifications } from '../hooks/useNotifications'
import { getSectionLabel } from '../utils/database'

// ============ کامپوننت پیشنهادات هوشمند ============
const SmartSuggestions = ({ 
  stats, 
  health, 
  settings, 
  permission,
  updateSettings,
  setShowOptimizeDialog,
  requestPermission,
  t 
}) => {
  const suggestions = []
  
  if (stats.totalRecords > 10 && !settings.autoBackup) {
    suggestions.push({
      id: 'auto-backup',
      icon: Shield,
      title: t('settings.suggestions.backup.title'),
      description: t('settings.suggestions.backup.description', { count: stats.totalRecords }),
      action: () => updateSettings({ autoBackup: true }),
      actionLabel: t('settings.suggestions.backup.action'),
      priority: 'high'
    })
  }
  
  if (stats.storageUsage > 70) {
    suggestions.push({
      id: 'optimize',
      icon: Zap,
      title: t('settings.suggestions.optimize.title'),
      description: t('settings.suggestions.optimize.description', { usage: stats.storageUsage.toFixed(1) }),
      action: () => setShowOptimizeDialog(true),
      actionLabel: t('settings.suggestions.optimize.action'),
      priority: 'high'
    })
  }
  
  if (settings.notifications && permission !== 'granted') {
    suggestions.push({
      id: 'notification-permission',
      icon: Bell,
      title: t('settings.suggestions.notification.title'),
      description: t('settings.suggestions.notification.description'),
      action: requestPermission,
      actionLabel: t('settings.suggestions.notification.action'),
      priority: 'medium'
    })
  }
  
  // پیشنهاد امنیتی
  if (!settings.password && !settings.appLockEnabled) {
    suggestions.push({
      id: 'security',
      icon: Shield,
      title: 'امنیت برنامه فعال نیست',
      description: 'برای امنیت بیشتر، رمز عبور یا قفل PIN را فعال کنید.',
      action: () => {
        document.getElementById('security-section')?.scrollIntoView({ behavior: 'smooth' })
      },
      actionLabel: 'رفتن به بخش امنیت',
      priority: 'medium'
    })
  }
  
  if (suggestions.length === 0) return null
  
  const sortedSuggestions = suggestions.sort((a, b) => {
    const priority = { high: 3, medium: 2, low: 1 }
    return priority[b.priority] - priority[a.priority]
  })
  
  return (
    <Card variant="warning" className="animate-fade-in-up">
      <CardHeader 
        icon={Sparkles}
        title={t('settings.smartSuggestions')}
        description={`${suggestions.length} ${t('settings.suggestions.count')}`}
        iconClassName="text-amber-400"
      />
      <CardContent noPadding>
        <div className="divide-y divide-slate-700/50">
          {sortedSuggestions.map((sug) => {
            const Icon = sug.icon
            return (
              <div 
                key={sug.id} 
                className="flex items-center justify-between p-4 hover:bg-slate-800/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{sug.title}</p>
                    <p className="text-xs text-slate-400">{sug.description}</p>
                  </div>
                </div>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={sug.action}
                >
                  {sug.actionLabel}
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// ============ کامپوننت اصلی ============
export default function Settings() {
  const { t } = useTranslation()
  const { success, error: toastError } = useToast()
  
  const fileInputRef = useRef(null)
  const encryptedFileInputRef = useRef(null)
  const searchInputRef = useRef(null)
  
  const settings = useStore((state) => state.settings)
  const updateSettings = useStore((state) => state.updateSettings)
  const resetAllData = useStore((state) => state.resetAllData)
  const resetSettings = useStore((state) => state.resetSettings)
  
  // ============ State Management ============
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [showBackupPasswordDialog, setShowBackupPasswordDialog] = useState(false)
  const [showRestorePasswordDialog, setShowRestorePasswordDialog] = useState(false)
  const [showOptimizeDialog, setShowOptimizeDialog] = useState(false)
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDetailedStats, setShowDetailedStats] = useState(false)
  const [testingNotification, setTestingNotification] = useState(false)
  
  // ============ Stateهای بخش امنیت ============
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Password states
  const [backupPassword, setBackupPassword] = useState('')
  const [restorePassword, setRestorePassword] = useState('')
  const [showBackupPassword, setShowBackupPassword] = useState(false)
  const [showRestorePassword, setShowRestorePassword] = useState(false)
  const [useEncryption, setUseEncryption] = useState(false)
  
  // Database hook
  const { stats, health, loading, error, optimize, backup, restore } = useDatabase()
  
  // Notifications hook
  const { 
    isSupported, 
    permission, 
    requestPermission, 
    testNotification,
    isGranted,
    isDenied,
    isDefault
  } = useNotifications()
  
  // ============ Effects ============
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (hasChanges) saveSettings()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setShowResetDialog(false)
        setShowExportDialog(false)
        setShowOptimizeDialog(false)
        setShowBackupPasswordDialog(false)
        setShowRestorePasswordDialog(false)
        setShowExitDialog(false)
        setShowChangePasswordDialog(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasChanges])
  
  // ============ Handlers ============
  const handleSettingChange = useCallback((key, value) => {
    updateSettings({ [key]: value })
    setHasChanges(true)
  }, [updateSettings])
  
  const saveSettings = useCallback(async () => {
    setIsSaving(true)
    try {
      await updateSettings(settings)
      setLastSaved(new Date())
      setHasChanges(false)
      success(t('settings.saveSuccess'))
    } catch (err) {
      toastError(t('settings.saveError'))
    } finally {
      setIsSaving(false)
    }
  }, [settings, updateSettings, success, toastError, t])
  
  // ============ توابع بخش امنیت ============
  const handleChangePassword = useCallback(() => {
    if (newPassword.length < 8) {
      toastError('رمز عبور باید حداقل ۸ کاراکتر باشد')
      return
    }
    if (newPassword !== confirmPassword) {
      toastError('رمز عبور و تکرار آن مطابقت ندارد')
      return
    }
    
    // بررسی رمز فعلی (اگر قبلاً رمز تنظیم شده باشد)
    if (settings.password && currentPassword !== settings.password) {
      toastError('رمز عبور فعلی اشتباه است')
      return
    }
    
    // ذخیره رمز عبور جدید
    updateSettings({ password: newPassword })
    success('رمز عبور با موفقیت تغییر کرد')
    
    setShowChangePasswordDialog(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }, [newPassword, confirmPassword, currentPassword, settings.password, updateSettings, success, toastError])
  
  const handleRequestPermission = useCallback(async () => {
    try {
      const granted = await requestPermission()
      if (granted) {
        success(t('notification.granted'))
      } else {
        toastError(t('notification.denied'))
      }
    } catch (err) {
      toastError(err.message || t('notification.error'))
    }
  }, [requestPermission, success, toastError, t])
  
  const handleTestNotification = useCallback(async () => {
    setTestingNotification(true)
    try {
      await testNotification()
      success(t('test.notification'))
    } catch (err) {
      toastError(err.message || t('test.error'))
    } finally {
      setTestingNotification(false)
    }
  }, [testNotification, success, toastError, t])
  
  const handleResetData = useCallback(() => {
    resetAllData()
    success(t('settings.resetSuccess'))
    setShowResetDialog(false)
  }, [resetAllData, success, t])
  
  const handleResetSettings = useCallback(() => {
    resetSettings()
    setHasChanges(true)
    success(t('settings.resetSettingsSuccess'))
  }, [resetSettings, success, t])
  
  const handleExportData = useCallback(async () => {
    try {
      await backup(useEncryption ? backupPassword : null)
      success(t('settings.exportSuccess'))
      setShowExportDialog(false)
      setShowBackupPasswordDialog(false)
      setBackupPassword('')
      setUseEncryption(false)
    } catch (err) {
      toastError(err.message || t('settings.exportError'))
    }
  }, [backup, useEncryption, backupPassword, success, toastError, t])
  
  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsImporting(true)
    try {
      await restore(file)
      success(t('settings.importSuccess'))
    } catch (err) {
      toastError(err.message || t('settings.importError'))
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [restore, success, toastError, t])
  
  const handleEncryptedFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!restorePassword) {
      toastError(t('settings.restore.passwordRequired'))
      return
    }
    setIsImporting(true)
    try {
      await restore(file, restorePassword)
      success(t('settings.importSuccess'))
      setShowRestorePasswordDialog(false)
      setRestorePassword('')
    } catch (err) {
      toastError(err.message || t('settings.importError'))
    } finally {
      setIsImporting(false)
      if (encryptedFileInputRef.current) encryptedFileInputRef.current.value = ''
    }
  }, [restore, restorePassword, success, toastError, t])
  
  const handleOptimize = useCallback(async () => {
    try {
      const result = await optimize({ compressData: true })
      success(t('settings.optimizeSuccess', { count: result.removedCount }))
      setShowOptimizeDialog(false)
    } catch (err) {
      toastError(err.message || t('settings.optimizeError'))
    }
  }, [optimize, success, toastError, t])
  
  const getHealthColor = useCallback((score) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'danger'
  }, [])
  
  // ============ Render ============
  return (
    <div className="p-8 space-y-6 bg-grid-ultra min-h-screen overflow-y-auto custom-scrollbar-ultra" dir="rtl">
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
      <input ref={encryptedFileInputRef} type="file" accept=".json" onChange={handleEncryptedFileChange} className="hidden" />
      
      {/* ============ HEADER ============ */}
      <div className="animate-fade-in-up">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center glow-green-ultra animate-float">
              <SettingsIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gradient-ultra">{t('settings.title')}</h1>
              <p className="text-base text-slate-400 mt-1">{t('settings.subtitle')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {hasChanges && (
              <span className="text-xs text-amber-400 font-medium">• {t('settings.unsaved')}</span>
            )}
            {lastSaved && !hasChanges && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {t('settings.savedAt', { time: lastSaved.toLocaleTimeString('fa-IR') })}
              </span>
            )}
            <Button 
              onClick={saveSettings} 
              disabled={!hasChanges || isSaving}
              variant={hasChanges ? 'primary' : 'secondary'}
              icon={isSaving ? RefreshCw : Save}
              loading={isSaving}
            >
              {isSaving ? t('settings.saving') : t('settings.save')}
            </Button>
          </div>
        </div>
        
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <SearchInput
            ref={searchInputRef}
            placeholder={t('settings.search') + ' (Ctrl+F)'}
            onSearch={setSearchQuery}
            className="max-w-md"
            debounce={300}
          />
          <div className="flex gap-3 text-xs text-slate-500">
            <span>⌘+S: {t('settings.save')}</span>
            <span>⌘+F: {t('settings.search')}</span>
            <span>ESC: {t('settings.close')}</span>
          </div>
        </div>
      </div>
      
      {/* ============ SMART SUGGESTIONS ============ */}
      <SmartSuggestions
        stats={stats}
        health={health}
        settings={settings}
        permission={permission}
        updateSettings={updateSettings}
        setShowOptimizeDialog={setShowOptimizeDialog}
        requestPermission={handleRequestPermission}
        t={t}
      />
      
      {/* ============ DATABASE STATS ============ */}
      <Card variant="glow" className="animate-fade-in-up">
        <CardHeader 
          icon={HardDrive}
          title={t('settings.database.title')}
          description={t('settings.database.subtitle')}
          iconClassName="text-blue-400"
          action={
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setShowDetailedStats(!showDetailedStats)}
            >
              {showDetailedStats ? t('settings.hideDetails') : t('settings.showDetails')}
            </Button>
          }
        />
        <CardContent>
          <CardGrid cols={3} gap={4}>
            <CardStat
              label={t('settings.database.totalSize')}
              value={stats.totalSizeFormatted}
              icon={Database}
              variant="primary"
            />
            <CardStat
              label={t('settings.database.totalRecords')}
              value={stats.totalRecords}
              icon={Activity}
              variant="success"
            />
            <CardStat
              label={t('settings.database.health')}
              value={`${health.score}%`}
              icon={FileCheck}
              variant={getHealthColor(health.score)}
              trend={health.healthy ? 'up' : 'down'}
              trendLabel={health.healthy ? t('settings.database.healthy') : t('settings.database.unhealthy')}
            />
          </CardGrid>
          
          {showDetailedStats && (
            <div className="mt-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <h4 className="text-white font-bold text-sm mb-3">{t('settings.database.details')}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(stats.sections).map(([key, data]) => (
                  <div key={key} className="p-2 rounded-lg bg-slate-800/50">
                    <p className="text-xs text-slate-400">{getSectionLabel(key)}</p>
                    <p className="text-sm font-bold text-white">{data.count}</p>
                    <p className="text-xs text-slate-500">{data.sizeFormatted}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {(health.issues.length > 0 || health.warnings.length > 0) && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <h4 className="text-red-400 font-bold text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {t('settings.database.issues')}
              </h4>
              {health.issues.map((issue, i) => (
                <p key={i} className="text-sm text-red-300 mt-1">• {issue}</p>
              ))}
              {health.warnings.map((warning, i) => (
                <p key={i} className="text-sm text-amber-300 mt-1">• {warning}</p>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter align="between">
          <Button 
            variant="secondary" 
            icon={Zap}
            onClick={() => setShowOptimizeDialog(true)}
          >
            {t('settings.database.optimize')}
          </Button>
          <Button 
            variant="primary" 
            icon={Download}
            onClick={() => setShowExportDialog(true)}
          >
            {t('settings.database.backup')}
          </Button>
        </CardFooter>
      </Card>
      
      {/* ============ GENERAL SETTINGS ============ */}
      <Card variant="ultra" className="animate-fade-in-up">
        <CardHeader 
          icon={Palette}
          title={t('settings.general')}
          description={t('settings.generalDesc')}
          iconClassName="text-emerald-400"
        />
        <CardContent className="space-y-3">
          <SwitchItem
            checked={settings.theme === 'dark'}
            onCheckedChange={(v) => handleSettingChange('theme', v ? 'dark' : 'light')}
            label={t('settings.theme')}
            description={t('settings.themeDesc')}
            icon={settings.theme === 'dark' ? Moon : Sun}
          />
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{t('settings.language')}</p>
                <p className="text-xs text-slate-400">{t('settings.languageDesc')}</p>
              </div>
            </div>
            <Select value={settings.language} onValueChange={(v) => handleSettingChange('language', v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fa">فارسی</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <span className="text-lg">💰</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm">{t('settings.currency')}</p>
                <p className="text-xs text-slate-400">{t('settings.currencyDesc')}</p>
              </div>
            </div>
            <Select value={settings.currency} onValueChange={(v) => handleSettingChange('currency', v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IRR">ریال</SelectItem>
                <SelectItem value="USD">دلار</SelectItem>
                <SelectItem value="USDT">تتر</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* ============ NOTIFICATIONS ============ */}
      <Card variant="ultra" className="animate-fade-in-up">
        <CardHeader 
          icon={Bell}
          title={t('settings.notifications')}
          description={t('settings.notificationsDesc')}
          iconClassName="text-yellow-400"
          action={
            !isSupported && (
              <span className="text-xs text-red-400">
                ⚠️ {t('notification.notSupported')}
              </span>
            )
          }
        />
        <CardContent className="space-y-3">
          <SwitchGroup>
            <SwitchItem
              checked={settings.notifications}
              onCheckedChange={(v) => handleSettingChange('notifications', v)}
              label={t('settings.appNotifications')}
              description={t('settings.appNotificationsDesc')}
              icon={Bell}
              disabled={!isSupported}
            />
            <SwitchItem
              checked={settings.sound}
              onCheckedChange={(v) => handleSettingChange('sound', v)}
              label={t('settings.sound')}
              description={t('settings.soundDesc')}
              icon={settings.sound ? Volume2 : VolumeX}
              disabled={!settings.notifications || !isSupported}
            />
            <SwitchItem
              checked={settings.autoBackup}
              onCheckedChange={(v) => handleSettingChange('autoBackup', v)}
              label={t('settings.autoBackup')}
              description={t('settings.autoBackupDesc')}
              icon={Clock}
            />
          </SwitchGroup>

          {/* دکمه تست اعلان‌ها */}
          {isSupported && settings.notifications && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{t('test.title')}</p>
                  <p className="text-xs text-slate-400">{t('test.description')}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleTestNotification}
                disabled={testingNotification || permission !== 'granted'}
                loading={testingNotification}
                icon={Bell}
              >
                {testingNotification ? t('loading') : t('test.title')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============ NOTIFICATION PERMISSION ============ */}
      {isSupported && settings.notifications && permission !== 'granted' && (
        <Card variant="warning" className="animate-fade-in-up">
          <CardHeader 
            icon={Shield}
            title={t('settings.notification.permission')}
            description={
              isDenied 
                ? t('settings.notification.permissionDenied')
                : t('settings.notification.permissionDefault')
            }
            iconClassName="text-amber-400"
            action={
              <Button 
                size="sm" 
                variant="primary"
                onClick={handleRequestPermission}
              >
                {t('settings.notification.request')}
              </Button>
            }
          />
          {isDenied && (
            <CardContent>
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-red-300 text-sm">{t('settings.notification.help')}</p>
              </div>
            </CardContent>
          )}
        </Card>
      )}
      
      {/* ============ SECURITY ============ */}
      <Card id="security-section" variant="ultra" className="animate-fade-in-up">
        <CardHeader 
          icon={Shield}
          title="امنیت"
          description="مدیریت رمز عبور و قفل برنامه"
          iconClassName="text-purple-400"
        />
        <CardContent className="space-y-3">
          {/* تغییر رمز عبور */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-purple-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Key className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">تغییر رمز عبور</p>
                <p className="text-xs text-slate-400">رمز عبور جدید برای ورود به برنامه</p>
              </div>
            </div>
            <Button 
              size="sm"
              variant="secondary"
              icon={Key}
              onClick={() => setShowChangePasswordDialog(true)}
            >
              تغییر
            </Button>
          </div>

          {/* قفل برنامه با PIN */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-purple-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Lock className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">قفل برنامه با PIN</p>
                <p className="text-xs text-slate-400">با فعال‌سازی، هنگام اجرا نیاز به وارد کردن PIN دارید</p>
              </div>
            </div>
            <Switch 
              checked={settings.appLockEnabled || false}
              onCheckedChange={(v) => handleSettingChange('appLockEnabled', v)}
              variant="purple"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* ============ BACKUP & RESET ============ */}
      <Card variant="ultra" className="animate-fade-in-up">
        <CardHeader 
          icon={Database}
          title={t('settings.backup')}
          description={t('settings.backupSubtitle')}
          iconClassName="text-blue-400"
        />
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Upload className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{t('settings.import')}</p>
                <p className="text-xs text-slate-400">{t('settings.importDesc')}</p>
              </div>
            </div>
            <Button 
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              icon={Upload}
              loading={isImporting}
            >
              {isImporting ? t('settings.loading') : t('settings.selectFile')}
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{t('settings.reset')}</p>
                <p className="text-xs text-slate-400">{t('settings.resetDesc')}</p>
              </div>
            </div>
            <ButtonGroup spacing="sm">
              <Button 
                size="sm"
                variant="ghost"
                onClick={handleResetSettings}
              >
                {t('settings.resetSettings')}
              </Button>
              <Button 
                size="sm"
                variant="danger"
                icon={Trash2}
                onClick={() => setShowResetDialog(true)}
              >
                {t('settings.resetButton')}
              </Button>
            </ButtonGroup>
          </div>
        </CardContent>
      </Card>
      
      {/* ============ ABOUT ============ */}
      <Card variant="gradient" className="animate-fade-in-up">
        <CardHeader 
          icon={Info}
          title={t('settings.about')}
          description={t('settings.aboutDesc')}
          iconClassName="text-purple-400"
        />
        <CardContent>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center glow-green-ultra">
              <span className="text-white text-2xl font-black">M</span>
            </div>
            <div>
              <h3 className="text-white font-black text-lg">{t('settings.appName')}</h3>
              <p className="text-slate-400 text-sm">{t('settings.appDesc')}</p>
              <div className="flex gap-4 mt-1">
                <span className="text-xs text-slate-500">{t('settings.version')} 1.0.0</span>
                <span className="text-xs text-slate-500">React + Tauri</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* ============ EXIT ============ */}
      <Card variant="danger" className="animate-fade-in-up">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                <LogOut className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{t('settings.exit')}</p>
                <p className="text-xs text-slate-400">{t('settings.exitDesc')}</p>
              </div>
            </div>
            <Button 
              variant="danger"
              icon={LogOut}
              onClick={() => setShowExitDialog(true)}
            >
              {t('settings.exitButton')}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* ============ DIALOGS ============ */}
      
      {/* Reset Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent variant="danger" size="sm">
          <DialogHeader 
            variant="danger"
            icon={AlertTriangle}
            title={t('settings.resetDialogTitle')}
            description={t('settings.resetDialogDesc')}
          />
          <DialogBody>
            <DialogSection variant="danger">
              <p className="text-sm text-red-300">{t('settings.warningResetText')}</p>
              <div className="mt-3 p-3 rounded-lg bg-slate-900/50">
                <p className="text-xs text-slate-400">
                  {t('settings.database.totalRecords')}: <span className="text-white font-bold">{stats.totalRecords}</span>
                </p>
                <p className="text-xs text-slate-400">
                  {t('settings.database.totalSize')}: <span className="text-white font-bold">{stats.totalSizeFormatted}</span>
                </p>
              </div>
            </DialogSection>
          </DialogBody>
          <DialogActions
            secondaryLabel={t('settings.cancel')}
            onSecondary={() => setShowResetDialog(false)}
            primaryLabel={t('settings.yesDelete')}
            onPrimary={handleResetData}
          />
        </DialogContent>
      </Dialog>
      
      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent variant="security" size="md">
          <DialogHeader 
            variant="security"
            icon={Shield}
            title={t('settings.exportTitle')}
            description={t('settings.exportDescription')}
          />
          <DialogBody>
            <DialogSection>
              <p className="text-sm text-white font-bold">{t('settings.exportIncludes')}</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-400">
                {[
                  t('settings.exportAccounts'),
                  t('settings.exportAssets'),
                  t('settings.exportActivities'),
                  t('settings.exportLoans'),
                  t('settings.exportSubscriptions'),
                  t('settings.exportGoals'),
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </DialogSection>
            
            <DialogSection>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-bold text-sm">{t('settings.exportEncryption')}</span>
                </div>
                <Switch 
                  checked={useEncryption} 
                  onCheckedChange={setUseEncryption}
                  size="sm"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">{t('settings.exportEncryptionDesc')}</p>
            </DialogSection>
          </DialogBody>
          <DialogActions
            secondaryLabel={t('settings.cancel')}
            onSecondary={() => setShowExportDialog(false)}
            primaryLabel={t('settings.exportCreate')}
            onPrimary={() => {
              if (useEncryption) {
                setShowBackupPasswordDialog(true)
              } else {
                handleExportData()
              }
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Backup Password Dialog */}
      <Dialog open={showBackupPasswordDialog} onOpenChange={setShowBackupPasswordDialog}>
        <DialogContent variant="security" size="sm">
          <DialogHeader 
            variant="security"
            icon={Lock}
            title={t('settings.backup.password.title')}
            description={t('settings.backup.password.description')}
          />
          <DialogBody>
            <InputGroup 
              label={t('settings.backup.password.label')}
              description={t('settings.backup.password.minLength')}
              required
            >
              <Input
                type={showBackupPassword ? 'text' : 'password'}
                value={backupPassword}
                onChange={(e) => setBackupPassword(e.target.value)}
                placeholder={t('settings.backup.password.placeholder')}
                icon={Lock}
                error={backupPassword.length > 0 && backupPassword.length < 8 ? t('settings.backup.password.error') : null}
                clearable
              />
            </InputGroup>
            <button
              onClick={() => setShowBackupPassword(!showBackupPassword)}
              className="text-xs text-slate-400 hover:text-white transition-colors mt-1"
            >
              {showBackupPassword ? t('settings.backup.password.hide') : t('settings.backup.password.show')}
            </button>
          </DialogBody>
          <DialogActions
            secondaryLabel={t('settings.cancel')}
            onSecondary={() => setShowBackupPasswordDialog(false)}
            primaryLabel={t('settings.exportDownload')}
            onPrimary={handleExportData}
            primaryDisabled={backupPassword.length < 8}
          />
        </DialogContent>
      </Dialog>
      
      {/* Optimize Dialog */}
      <Dialog open={showOptimizeDialog} onOpenChange={setShowOptimizeDialog}>
        <DialogContent variant="warning" size="sm">
          <DialogHeader 
            variant="warning"
            icon={Zap}
            title={t('settings.optimize.title')}
            description={t('settings.optimize.description')}
          />
          <DialogBody>
            <DialogSection variant="warning">
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  {t('settings.optimize.step1')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  {t('settings.optimize.step2')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  {t('settings.optimize.step3')}
                </li>
              </ul>
            </DialogSection>
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{t('settings.database.totalSize')}</span>
                <span className="text-white font-bold">{stats.totalSizeFormatted}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-400">{t('settings.database.totalRecords')}</span>
                <span className="text-white font-bold">{stats.totalRecords}</span>
              </div>
            </div>
          </DialogBody>
          <DialogActions
            secondaryLabel={t('settings.cancel')}
            onSecondary={() => setShowOptimizeDialog(false)}
            primaryLabel={t('settings.optimize.start')}
            onPrimary={handleOptimize}
          />
        </DialogContent>
      </Dialog>
      
      {/* Exit Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent variant="danger" size="sm">
          <DialogHeader 
            variant="danger"
            icon={LogOut}
            title={t('settings.exit')}
            description={t('settings.exitDesc')}
          />
          <DialogBody>
            <DialogSection variant="warning">
              <p className="text-sm text-amber-300">{t('settings.exitWarning')}</p>
            </DialogSection>
          </DialogBody>
          <DialogActions
            secondaryLabel={t('settings.cancel')}
            onSecondary={() => setShowExitDialog(false)}
            primaryLabel={t('settings.exitButton')}
            onPrimary={() => {
              success(t('settings.exiting'))
              setTimeout(() => window.close(), 800)
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* ============ CHANGE PASSWORD DIALOG ============ */}
      <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
        <DialogContent variant="security" size="md">
          <DialogHeader 
            variant="security"
            icon={Key}
            title="تغییر رمز عبور"
            description="رمز عبور جدید را وارد کنید (حداقل ۸ کاراکتر)"
          />
          <DialogBody>
            <div className="space-y-4">
              {/* رمز عبور فعلی */}
              {settings.password && (
                <InputGroup 
                  label="رمز عبور فعلی"
                  required
                >
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="رمز عبور فعلی را وارد کنید"
                    icon={Lock}
                    clearable
                  />
                </InputGroup>
              )}

              {/* رمز عبور جدید */}
              <InputGroup 
                label="رمز عبور جدید"
                description="حداقل ۸ کاراکتر شامل حروف و اعداد"
                required
                error={newPassword.length > 0 && newPassword.length < 8 ? 'حداقل ۸ کاراکتر' : null}
              >
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="رمز عبور جدید را وارد کنید"
                  icon={Lock}
                  clearable
                />
              </InputGroup>

              {/* تکرار رمز عبور */}
              <InputGroup 
                label="تکرار رمز عبور جدید"
                required
                error={confirmPassword.length > 0 && confirmPassword !== newPassword ? 'رمز عبور مطابقت ندارد' : null}
              >
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="رمز عبور را مجدداً وارد کنید"
                  icon={Lock}
                  clearable
                />
              </InputGroup>

              {/* نمایش رمز */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                {settings.password && (
                  <button
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="hover:text-white transition-colors"
                  >
                    {showCurrentPassword ? '🙈 مخفی' : '👁️ نمایش'} رمز فعلی
                  </button>
                )}
                <button
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="hover:text-white transition-colors"
                >
                  {showNewPassword ? '🙈 مخفی' : '👁️ نمایش'} رمز جدید
                </button>
                <button
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="hover:text-white transition-colors"
                >
                  {showConfirmPassword ? '🙈 مخفی' : '👁️ نمایش'} تکرار رمز
                </button>
              </div>
            </div>
          </DialogBody>
          <DialogActions
            secondaryLabel="انصراف"
            onSecondary={() => {
              setShowChangePasswordDialog(false)
              setCurrentPassword('')
              setNewPassword('')
              setConfirmPassword('')
              setShowCurrentPassword(false)
              setShowNewPassword(false)
              setShowConfirmPassword(false)
            }}
            primaryLabel="تغییر رمز عبور"
            onPrimary={handleChangePassword}
            primaryDisabled={
              (settings.password && !currentPassword) || 
              newPassword.length < 8 || 
              newPassword !== confirmPassword
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}