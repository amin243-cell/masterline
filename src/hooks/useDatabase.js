import { useState, useCallback, useMemo, useEffect } from 'react'
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
  const [stats, setStats] = useState(getDatabaseStats())
  const [health, setHealth] = useState(checkDatabaseHealth())
  
  const importAllData = useStore((state) => state.importAllData)
  const settings = useStore((state) => state.settings)
  const updateSettings = useStore((state) => state.updateSettings)
  
  // ==================== تابع رفرش آمار ====================
  const refreshStats = useCallback(() => {
    const newStats = getDatabaseStats()
    const newHealth = checkDatabaseHealth()
    setStats(newStats)
    setHealth(newHealth)
    return { stats: newStats, health: newHealth }
  }, [])
  
  // ==================== بهینه‌سازی دیتابیس ====================
  const optimize = useCallback(async (options = {}) => {
    setLoading(true)
    setError(null)
    try {
      const result = optimizeDatabase({
        removeOldActivities: options.removeOldActivities !== false,
        oldActivityMonths: options.oldActivityMonths || 24,
        compressData: options.compressData !== false,
      })
      
      trackDatabaseChange()
      
      if (updateSettings) {
        updateSettings({ lastOptimized: new Date().toISOString() })
      }
      
      refreshStats()
      
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [updateSettings, refreshStats])
  
  // ==================== ایجاد Backup ====================
  const backup = useCallback(async (password = null, options = {}) => {
    setLoading(true)
    setError(null)
    try {
      const result = await createEncryptedBackup(password)
      
      let fileName = options.fileName || `masterline-backup-${new Date().toISOString().split('T')[0]}`
      if (result.encrypted) {
        fileName += '-encrypted'
      }
      fileName += '.json'
      
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
      
      setLastBackupTime(new Date())
      if (updateSettings) {
        updateSettings({ lastBackup: new Date().toISOString() })
      }
      
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
  
  // ==================== بازیابی Backup ====================
  const restore = useCallback(async (file, password = null) => {
    setLoading(true)
    setError(null)
    try {
      const text = await file.text()
      
      let data
      if (password) {
        data = await restoreEncryptedBackup(text, password)
      } else {
        try {
          const parsed = JSON.parse(text)
          if (parsed.appName === 'Masterline' && parsed.data) {
            data = parsed.data
          } else {
            throw new Error('فایل نامعتبر است')
          }
        } catch (parseErr) {
          throw new Error('فایل نامعتبر است یا فرمت آن صحیح نیست')
        }
      }
      
      if (importAllData) {
        importAllData(data)
      }
      trackDatabaseChange()
      refreshStats()
      
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
  }, [importAllData, refreshStats])
  
  // ==================== پاک کردن داده‌های قدیمی ====================
  const cleanOldData = useCallback(async (daysToKeep = 365) => {
    setLoading(true)
    setError(null)
    try {
      const result = await cleanOldData(daysToKeep)
      trackDatabaseChange()
      refreshStats()
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
  }, [refreshStats])
  
  // ==================== پشتیبان‌گیری خودکار ====================
  const autoBackupIfNeeded = useCallback(async () => {
    if (!settings?.autoBackup) return null
    
    const lastBackup = settings.lastBackup ? new Date(settings.lastBackup) : null
    if (lastBackup) {
      const daysSinceLastBackup = (Date.now() - lastBackup.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceLastBackup < 1) return null
    }
    
    try {
      const password = settings.backupPassword || null
      const result = await backup(password, { silent: true })
      return result
    } catch (err) {
      console.error('خطا در پشتیبان‌گیری خودکار:', err)
      return null
    }
  }, [settings, backup])
  
  // ==================== بررسی سلامت ====================
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
  
  // ==================== آمار هر بخش ====================
  const getSectionStats = useCallback((sectionKey) => {
    return stats.sections?.[sectionKey] || {
      count: 0,
      size: 0,
      sizeFormatted: '0 B',
    }
  }, [stats])
  
  // ==================== برچسب بخش ====================
  const getSectionLabelCallback = useCallback((key) => {
    return getSectionLabel(key)
  }, [])
  
  // ==================== بارگذاری اولیه ====================
  useEffect(() => {
    refreshStats()
  }, [refreshStats])
  
  return {
    stats,
    health,
    loading,
    error,
    lastBackupTime,
    optimize,
    backup,
    restore,
    cleanOldData,
    autoBackupIfNeeded,
    refreshStats,
    getHealthDetails,
    getSectionStats,
    getSectionLabel: getSectionLabelCallback,
  }
}