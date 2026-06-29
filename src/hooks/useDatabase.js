import { useState, useCallback, useMemo } from 'react'
import useStore from '../store/useStore'
import {
  getDatabaseStats,
  checkDatabaseHealth,
  optimizeDatabase,
  createEncryptedBackup,
  restoreEncryptedBackup,
  trackDatabaseChange,
  cleanOldData,
  getSectionLabel,
} from '../utils/database'

export function useDatabase() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastBackupTime, setLastBackupTime] = useState(null)
  
  const importAllData = useStore((state) => state.importAllData)
  const settings = useStore((state) => state.settings)
  const updateSettings = useStore((state) => state.updateSettings)
  
  // دریافت آمار دیتابیس (با useMemo برای جلوگیری از رندر مجدد)
  const stats = useMemo(() => getDatabaseStats(), [])
  
  // بررسی سلامت (با useMemo)
  const health = useMemo(() => checkDatabaseHealth(), [])
  
  // تابع رفرش آمار و سلامت
  const refreshStats = useCallback(() => {
    // این تابع فقط برای به‌روزرسانی stats و health استفاده می‌شود
    // در نسخه فعلی، stats و health از useMemo استفاده می‌کنند
    // برای رفرش، می‌توانیم از forceUpdate استفاده کنیم
    // اما در اینجا فقط یک callback خالی برمی‌گردانیم
    return {
      stats: getDatabaseStats(),
      health: checkDatabaseHealth(),
    }
  }, [])
  
  // بهینه‌سازی دیتابیس
  const optimize = useCallback(async (options = {}) => {
    setLoading(true)
    setError(null)
    try {
      const result = optimizeDatabase({
        removeOldActivities: options.removeOldActivities !== false,
        oldActivityMonths: options.oldActivityMonths || 24,
        compressData: options.compressData !== false,
      })
      
      // به‌روزرسانی استور
      useStore.setState(result.optimized)
      trackDatabaseChange()
      
      // ذخیره زمان بهینه‌سازی در تنظیمات
      updateSettings({ lastOptimized: new Date().toISOString() })
      
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [updateSettings])
  
  // ایجاد Backup با پشتیبانی از مسیر سفارشی
  const backup = useCallback(async (password = null, options = {}) => {
    setLoading(true)
    setError(null)
    try {
      const result = await createEncryptedBackup(password)
      
      // اگر مسیر سفارشی داده شده، از آن استفاده کن
      let fileName = options.fileName || `masterline-backup-${new Date().toISOString().split('T')[0]}`
      if (result.encrypted) {
        fileName += '-encrypted'
      }
      fileName += '.json'
      
      // دانلود فایل
      const blob = new Blob([result.data], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      // ذخیره زمان پشتیبان‌گیری
      setLastBackupTime(new Date())
      updateSettings({ lastBackup: new Date().toISOString() })
      
      trackDatabaseChange()
      
      return {
        ...result,
        fileName,
        downloadTime: new Date().toISOString(),
      }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [updateSettings])
  
  // بازیابی Backup با پشتیبانی از رمز و فایل
  const restore = useCallback(async (file, password = null) => {
    setLoading(true)
    setError(null)
    try {
      const text = await file.text()
      
      let data
      if (password) {
        data = await restoreEncryptedBackup(text, password)
      } else {
        // بررسی اینکه آیا فایل رمزگذاری شده است
        try {
          const parsed = JSON.parse(text)
          if (parsed.appName === 'Masterline' && parsed.data) {
            data = parsed.data
          } else {
            throw new Error('فایل نامعتبر است')
          }
        } catch (parseErr) {
          // اگر JSON نبود یا ساختارش درست نبود
          throw new Error('فایل نامعتبر است یا فرمت آن صحیح نیست')
        }
      }
      
      // وارد کردن داده‌ها
      importAllData(data)
      trackDatabaseChange()
      
      return {
        ...data,
        restoredAt: new Date().toISOString(),
        recordCount: Object.values(data).reduce((sum, arr) => sum + (arr?.length || 0), 0),
      }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [importAllData])
  
  // پاک کردن داده‌های قدیمی
  const cleanOldData = useCallback(async (daysToKeep = 365) => {
    setLoading(true)
    setError(null)
    try {
      const result = await cleanOldData(daysToKeep)
      
      // به‌روزرسانی استور
      useStore.setState(result.cleaned)
      trackDatabaseChange()
      
      return {
        ...result,
        cleanedAt: new Date().toISOString(),
      }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])
  
  // پشتیبان‌گیری خودکار (برای استفاده در پس‌زمینه)
  const autoBackupIfNeeded = useCallback(async () => {
    if (!settings?.autoBackup) return null
    
    // بررسی اینکه آخرین پشتیبان‌گیری کی بوده
    const lastBackup = settings.lastBackup ? new Date(settings.lastBackup) : null
    if (lastBackup) {
      const daysSinceLastBackup = (Date.now() - lastBackup.getTime()) / (1000 * 60 * 60 * 24)
      
      // اگر کمتر از یک روز از پشتیبان‌گیری گذشته باشد، نیازی نیست
      if (daysSinceLastBackup < 1) return null
    }
    
    // انجام پشتیبان‌گیری خودکار
    try {
      const password = settings.backupPassword || null
      const result = await backup(password, { silent: true })
      return result
    } catch (err) {
      console.error('خطا در پشتیبان‌گیری خودکار:', err)
      return null
    }
  }, [settings, backup])
  
  // بررسی سلامت دیتابیس با جزئیات بیشتر
  const getHealthDetails = useCallback(() => {
    const healthCheck = health
    return {
      ...healthCheck,
      score: healthCheck.score || 0,
      isHealthy: healthCheck.healthy,
      issuesCount: healthCheck.issues?.length || 0,
      warningsCount: healthCheck.warnings?.length || 0,
      status: healthCheck.healthy ? 'سالم' : 'نیاز به توجه',
      color: healthCheck.score >= 80 ? 'green' : healthCheck.score >= 60 ? 'yellow' : 'red',
    }
  }, [health])
  
  // دریافت آمار هر بخش به صورت جداگانه
  const getSectionStats = useCallback((sectionKey) => {
    return stats.sections?.[sectionKey] || {
      count: 0,
      size: 0,
      sizeFormatted: '0 B',
    }
  }, [stats])
  
  // دریافت برچسب بخش
  const getSectionLabel = useCallback((key) => {
    return getSectionLabel(key)
  }, [])
  
  return {
    // داده‌ها
    stats,
    health,
    loading,
    error,
    lastBackupTime,
    
    // عملیات‌ها
    optimize,
    backup,
    restore,
    cleanOldData,
    autoBackupIfNeeded,
    refreshStats,
    
    // توابع کمکی
    getHealthDetails,
    getSectionStats,
    getSectionLabel,
  }
}