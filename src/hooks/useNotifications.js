import { useState, useCallback, useEffect } from 'react'
import useStore from '../store/useStore'
import {
  sendDesktopNotification,
  markNotificationAsRead,
  markAllAsRead,
  clearNotificationHistory,
  deleteNotification,
  sendTestNotification,
  startNotificationScheduler,
} from '../utils/notifications'

export function useNotifications() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const notificationHistory = useStore((state) => state.notificationHistory || [])
  const notificationSettings = useStore((state) => state.notificationSettings || {
    loans: { enabled: true, beforeDays: [3, 1, 0] },
    subscriptions: { enabled: true, beforeDays: [7, 3, 0] },
    goals: { enabled: true, milestones: [25, 50, 75, 100] },
    reminders: { enabled: true, beforeMinutes: [60, 30, 0] },
    doNotDisturb: { enabled: false, start: '23:00', end: '08:00' },
  })
  
  const updateNotificationSettings = useStore((state) => state.updateNotificationSettings)
  
  // شمارش نوتیفیکیشن‌های خوانده نشده
  const unreadCount = notificationHistory.filter(n => !n.read).length
  
  // ارسال نوتیفیکیشن سفارشی
  const sendNotification = useCallback(async (title, body, options = {}) => {
    setLoading(true)
    setError(null)
    try {
      await sendDesktopNotification({
        title,
        body,
        ...options,
      })
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])
  
  // علامت‌گذاری به عنوان خوانده شده
  const markAsRead = useCallback((id) => {
    markNotificationAsRead(id)
  }, [])
  
  // علامت‌گذاری همه به عنوان خوانده شده
  const markAllRead = useCallback(() => {
    markAllAsRead()
  }, [])
  
  // پاک‌سازی تاریخچه
  const clearHistory = useCallback(() => {
    clearNotificationHistory()
  }, [])
  
  // حذف نوتیفیکیشن
  const deleteNotif = useCallback((id) => {
    deleteNotification(id)
  }, [])
  
  // ارسال نوتیفیکیشن تستی
  const testNotification = useCallback(async () => {
    setLoading(true)
    try {
      await sendTestNotification()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])
  
  // آپدیت تنظیمات
  const updateSettings = useCallback((newSettings) => {
    updateNotificationSettings({
      ...notificationSettings,
      ...newSettings,
    })
  }, [notificationSettings, updateNotificationSettings])
  
  // شروع چک‌کننده خودکار
  useEffect(() => {
    const interval = startNotificationScheduler()
    return () => clearInterval(interval)
  }, [])
  
  return {
    notificationHistory,
    notificationSettings,
    unreadCount,
    loading,
    error,
    sendNotification,
    markAsRead,
    markAllRead,
    clearHistory,
    deleteNotification: deleteNotif,
    testNotification,
    updateSettings,
  }
}