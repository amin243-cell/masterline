import { useState, useEffect, useCallback } from 'react'

// ==================== نسخه کامل برای پشتیبانی از صفحه اعلان‌ها ====================
export const useNotifications = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [settings, setSettings] = useState({
    loans: { enabled: true, beforeDays: [3, 1, 0] },
    subscriptions: { enabled: true, beforeDays: [7, 3, 0] },
    goals: { enabled: true, milestones: [25, 50, 75, 100] },
    general: { enabled: true, beforeMinutes: [60, 30, 0] },
    dnd_enabled: false,
    dnd_start: '23:00',
    dnd_end: '08:00',
  })
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [isDndActive, setIsDndActive] = useState(false)

  // ==================== داده‌های تست ====================
  const testNotifications = [
    {
      id: 1,
      title: 'قسط وام',
      body: 'قسط وام شما ۳ روز دیگر سررسید است',
      notification_type: 'loan',
      related_id: 1,
      related_type: 'loan',
      is_read: false,
      created_at: new Date().toISOString(),
      scheduled_for: null,
    },
    {
      id: 2,
      title: 'تمدید اشتراک',
      body: 'اشتراک شما ۷ روز دیگر تمدید می‌شود',
      notification_type: 'subscription',
      related_id: 2,
      related_type: 'subscription',
      is_read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      scheduled_for: null,
    },
    {
      id: 3,
      title: 'پیشرفت هدف',
      body: '۵۰٪ از هدف شما محقق شد',
      notification_type: 'goal',
      related_id: 3,
      related_type: 'goal',
      is_read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      scheduled_for: null,
    },
    {
      id: 4,
      title: 'یادآور عمومی',
      body: 'زمان جلسه فردا ساعت ۱۰ صبح',
      notification_type: 'general',
      related_id: null,
      related_type: null,
      is_read: false,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      scheduled_for: null,
    },
  ]

  // ==================== توابع اصلی ====================
  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      // استفاده از داده‌های تست
      setTimeout(() => {
        setNotifications(testNotifications)
        const unread = testNotifications.filter(n => !n.is_read).length
        setUnreadCount(unread)
        setLoading(false)
      }, 500)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }, [])

  const fetchSettings = useCallback(async () => {
    // تنظیمات پیش‌فرض
    return settings
  }, [settings])

  const sendNotification = useCallback(async (title, body, type, relatedId = null, relatedType = null, scheduledFor = null) => {
    const newNotif = {
      id: Date.now(),
      title,
      body,
      notification_type: type || 'general',
      related_id: relatedId,
      related_type: relatedType,
      is_read: false,
      created_at: new Date().toISOString(),
      scheduled_for: scheduledFor,
    }
    setNotifications(prev => [newNotif, ...prev])
    setUnreadCount(prev => prev + 1)
    return newNotif.id
  }, [])

  const markAsRead = useCallback(async (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllRead = useCallback(async () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true }))
    )
    setUnreadCount(0)
  }, [])

  const deleteNotification = useCallback(async (id) => {
    setNotifications(prev => {
      const filtered = prev.filter(n => n.id !== id)
      const unread = filtered.filter(n => !n.is_read).length
      setUnreadCount(unread)
      return filtered
    })
  }, [])

  const clearHistory = useCallback(async () => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  const updateSettings = useCallback(async (newSettings) => {
    setSettings(prev => {
      // پشتیبانی از فرمت‌های مختلف
      if (newSettings.dnd_enabled !== undefined) {
        return { ...prev, ...newSettings }
      }
      // فرمت nested
      const updated = { ...prev }
      Object.keys(newSettings).forEach(key => {
        if (typeof newSettings[key] === 'object' && newSettings[key] !== null) {
          updated[key] = { ...updated[key], ...newSettings[key] }
        } else {
          updated[key] = newSettings[key]
        }
      })
      return updated
    })
  }, [])

  const checkPermission = useCallback(async () => {
    return true
  }, [])

  const requestPermission = useCallback(async () => {
    return true
  }, [])

  const testNotification = useCallback(async () => {
    return true
  }, [])

  // ==================== بارگذاری اولیه ====================
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    loading,
    error,
    notifications,
    settings,
    unreadCount,
    permissionGranted,
    isDndActive,
    fetchNotifications,
    fetchSettings,
    sendNotification,
    markAsRead,
    markAllRead,
    deleteNotification,
    clearHistory,
    updateSettings,
    checkPermission,
    requestPermission,
    testNotification,
  }
}