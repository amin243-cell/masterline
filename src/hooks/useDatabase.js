import { useState, useCallback } from 'react'
import useStore from '../store/useStore'
import {
  getDatabaseStats,
  checkDatabaseHealth,
  optimizeDatabase,
  createEncryptedBackup,
  restoreEncryptedBackup,
  trackDatabaseChange,
} from '../utils/database'

export function useDatabase() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const importAllData = useStore((state) => state.importAllData)
  
  // دریافت آمار دیتابیس
  const stats = getDatabaseStats()
  
  // بررسی سلامت
  const health = checkDatabaseHealth()
  
  // بهینه‌سازی دیتابیس
  const optimize = useCallback(async (options = {}) => {
    setLoading(true)
    setError(null)
    try {
      const result = optimizeDatabase(options)
      useStore.setState(result.optimized)
      trackDatabaseChange()
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])
  
  // ایجاد Backup
  const backup = useCallback(async (password = null) => {
    setLoading(true)
    setError(null)
    try {
      const result = await createEncryptedBackup(password)
      
      // دانلود فایل
      const blob = new Blob([result.data], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const date = new Date().toISOString().split('T')[0]
      a.download = `masterline-backup-${date}${result.encrypted ? '-encrypted' : ''}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      trackDatabaseChange()
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])
  
  // بازیابی Backup
  const restore = useCallback(async (file, password = null) => {
    setLoading(true)
    setError(null)
    try {
      const text = await file.text()
      
      let data
      if (password) {
        data = await restoreEncryptedBackup(text, password)
      } else {
        const parsed = JSON.parse(text)
        if (!parsed.data || parsed.appName !== 'Masterline') {
          throw new Error('فایل نامعتبر است')
        }
        data = parsed.data
      }
      
      importAllData(data)
      trackDatabaseChange()
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [importAllData])
  
  return {
    stats,
    health,
    loading,
    error,
    optimize,
    backup,
    restore,
  }
}