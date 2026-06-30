import { 
  isPermissionGranted, 
  requestPermission, 
  sendNotification 
} from '@tauri-apps/plugin-notification'
import useStore from '../store/useStore'

// ==================== بررسی مجوز (با Tauri) ====================
export const checkNotificationPermission = async () => {
  try {
    const granted = await isPermissionGranted()
    return granted
  } catch (error) {
    console.error('Error checking notification permission:', error)
    return false
  }
}

// ==================== درخواست مجوز (با Tauri) ====================
export const requestNotificationPermission = async () => {
  try {
    const permission = await requestPermission()
    return permission === 'granted'
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    return false
  }
}

// ==================== ارسال نوتیفیکیشن سیستمی (با Tauri) ====================
export const sendDesktopNotification = async (options) => {
  const { title, body, icon, sound, actions, notificationId } = options
  const state = useStore.getState()
  
  // بررسی تنظیمات
  if (!state.settings?.notifications) {
    console.log('Notifications are disabled')
    return false
  }

  // بررسی حالت مزاحمت نشوید
  const dndEnabled = state.notificationSettings?.dnd_enabled || false
  if (dndEnabled) {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const startTime = state.notificationSettings?.dnd_start?.split(':').map(Number) || [23, 0]
    const endTime = state.notificationSettings?.dnd_end?.split(':').map(Number) || [8, 0]
    
    const startMinutes = startTime[0] * 60 + startTime[1]
    const endMinutes = endTime[0] * 60 + endTime[1]
    
    let isDnd = false
    if (startMinutes < endMinutes) {
      isDnd = currentTime >= startMinutes && currentTime < endMinutes
    } else {
      isDnd = currentTime >= startMinutes || currentTime < endMinutes
    }
    
    if (isDnd) {
      console.log('Do Not Disturb mode is active')
      return false
    }
  }

  try {
    // بررسی مجوز
    let granted = await isPermissionGranted()
    if (!granted) {
      granted = await requestPermission()
      if (!granted) {
        console.warn('Notification permission not granted')
        return false
      }
    }

    // ارسال اعلان با Tauri
    await sendNotification({
      title: title || 'Masterline',
      body: body || '',
      icon: icon || null,
      sound: (state.settings?.sound && sound) ? sound : null,
      actions: actions || [],
    })

    // ذخیره در دیتابیس (از طریق هوک استفاده می‌شود)
    // توجه: این تابع فقط اعلان سیستمی ارسال می‌کند
    // ذخیره در دیتابیس توسط useNotifications انجام می‌شود

    return true
  } catch (error) {
    console.error('Error sending notification:', error)
    return false
  }
}

// ==================== توابع مدیریت تاریخچه (منسوخ - استفاده از useNotifications) ====================

export const addToNotificationHistory = (notification) => {
  console.warn('addToNotificationHistory is deprecated. Use sendNotification from useNotifications hook instead.')
  const state = useStore.getState()
  const notifications = state.notifications || []
  const updatedNotifications = [
    { ...notification, id: Date.now() + Math.random(), is_read: false, created_at: new Date().toISOString() },
    ...notifications
  ].slice(0, 100)
  
  useStore.setState({ notifications: updatedNotifications })
}

export const markNotificationAsRead = (id) => {
  console.warn('markNotificationAsRead is deprecated. Use markAsRead from useNotifications hook instead.')
  const state = useStore.getState()
  const updatedNotifications = state.notifications.map(notif => 
    notif.id === id ? { ...notif, is_read: true } : notif
  )
  useStore.setState({ notifications: updatedNotifications })
}

export const markAllAsRead = () => {
  console.warn('markAllAsRead is deprecated. Use markAllRead from useNotifications hook instead.')
  const state = useStore.getState()
  const updatedNotifications = state.notifications.map(notif => ({
    ...notif,
    is_read: true,
  }))
  useStore.setState({ notifications: updatedNotifications })
}

export const clearNotificationHistory = () => {
  console.warn('clearNotificationHistory is deprecated. Use clearHistory from useNotifications hook instead.')
  useStore.setState({ notifications: [] })
}

export const deleteNotification = (id) => {
  console.warn('deleteNotification is deprecated. Use deleteNotification from useNotifications hook instead.')
  const state = useStore.getState()
  const updatedNotifications = state.notifications.filter(notif => notif.id !== id)
  useStore.setState({ notifications: updatedNotifications })
}

// ==================== توابع اختصاصی ارسال اعلان ====================

export const sendLoanReminder = async (loan) => {
  const state = useStore.getState()
  if (!state.settings?.notifications) return false
  
  // دریافت تنظیمات یادآور وام
  const loanSettings = state.notificationSettings?.loans || { enabled: true, beforeDays: [3, 1, 0] }
  if (!loanSettings.enabled) return false
  
  // محاسبه روزهای قبل از سررسید
  const now = new Date()
  const endDate = new Date(loan.endDate)
  const daysUntilDue = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
  
  // بررسی آیا امروز یکی از روزهای یادآوری است
  if (!loanSettings.beforeDays.includes(daysUntilDue)) return false
  
  await sendDesktopNotification({
    title: '🔔 یادآوری پرداخت وام',
    body: `قسط وام "${loan.name}" به مبلغ ${loan.monthlyPayment?.toLocaleString() || '0'} ریال ${daysUntilDue === 0 ? 'امروز' : `${daysUntilDue} روز دیگر`} سررسید می‌شود`,
    sound: 'notification.wav',
    notificationId: `loan-${loan.id}`,
  })
  
  return true
}

export const sendSubscriptionReminder = async (subscription) => {
  const state = useStore.getState()
  if (!state.settings?.notifications) return false
  
  // دریافت تنظیمات یادآور اشتراک
  const subSettings = state.notificationSettings?.subscriptions || { enabled: true, beforeDays: [7, 3, 0] }
  if (!subSettings.enabled) return false
  
  // محاسبه روزهای قبل از تمدید
  const now = new Date()
  const renewalDate = new Date(subscription.nextRenewal)
  const daysUntilRenewal = Math.ceil((renewalDate - now) / (1000 * 60 * 60 * 24))
  
  // بررسی آیا امروز یکی از روزهای یادآوری است
  if (!subSettings.beforeDays.includes(daysUntilRenewal)) return false
  
  await sendDesktopNotification({
    title: '🔔 یادآوری تمدید اشتراک',
    body: `اشتراک "${subscription.name}" ${daysUntilRenewal === 0 ? 'امروز' : `${daysUntilRenewal} روز دیگر`} تمدید می‌شود`,
    sound: 'notification.wav',
    notificationId: `sub-${subscription.id}`,
  })
  
  return true
}

export const sendGoalReminder = async (goal, percentage) => {
  const state = useStore.getState()
  if (!state.settings?.notifications) return false
  
  // دریافت تنظیمات یادآور اهداف
  const goalSettings = state.notificationSettings?.goals || { enabled: true, milestones: [25, 50, 75, 100] }
  if (!goalSettings.enabled) return false
  
  // بررسی آیا این درصد در لیست milestones است
  if (!goalSettings.milestones.includes(percentage)) return false
  
  await sendDesktopNotification({
    title: '🎯 پیشرفت هدف مالی',
    body: `هدف "${goal.title}" به ${percentage}% رسید! (${goal.currentAmount.toLocaleString()} از ${goal.targetAmount.toLocaleString()})`,
    sound: 'notification.wav',
    notificationId: `goal-${goal.id}`,
  })
  
  return true
}

export const sendGeneralReminder = async (reminder) => {
  const state = useStore.getState()
  if (!state.settings?.notifications) return false
  
  await sendDesktopNotification({
    title: reminder.title || 'یادآوری',
    body: reminder.note || 'زمان یادآوری فرا رسید',
    sound: 'notification.wav',
    notificationId: `reminder-${reminder.id}`,
  })
  
  return true
}

// ==================== چک‌کننده خودکار ====================

export const checkScheduledNotifications = async () => {
  const state = useStore.getState()
  
  // ========== بررسی اهداف ==========
  const goals = state.goals || []
  for (const goal of goals) {
    if (goal.status === 'completed') continue
    
    const percentage = Math.round((goal.currentAmount / goal.targetAmount) * 100)
    const milestones = state.notificationSettings?.goals?.milestones || [25, 50, 75, 100]
    
    // بررسی آیا به یک milestone جدید رسیده‌ایم
    if (milestones.includes(percentage)) {
      await sendGoalReminder(goal, percentage)
    }
  }
  
  // ========== بررسی وام‌ها ==========
  const loans = state.loans || []
  for (const loan of loans) {
    if (loan.status === 'paid' || loan.status === 'completed') continue
    
    await sendLoanReminder(loan)
  }
  
  // ========== بررسی اشتراک‌ها ==========
  const subscriptions = state.subscriptions || []
  for (const sub of subscriptions) {
    if (sub.status === 'cancelled' || sub.status === 'expired') continue
    
    await sendSubscriptionReminder(sub)
  }
}

export const startNotificationScheduler = () => {
  // چک کردن هر ۱۵ دقیقه
  const interval = setInterval(checkScheduledNotifications, 15 * 60 * 1000)
  
  // چک اولیه بعد از ۳ ثانیه
  setTimeout(checkScheduledNotifications, 3000)
  
  console.log('Notification scheduler started')
  return interval
}

// ==================== تست ====================

export const sendTestNotification = async () => {
  const state = useStore.getState()
  
  if (!state.settings?.notifications) {
    useStore.getState().updateSettings({ notifications: true })
  }

  // تست با صدا
  if (state.settings?.sound) {
    try {
      await sendDesktopNotification({
        title: '🔊 تست صدا',
        body: 'اگر این پیام را می‌بینید و صدا را می‌شنوید، همه چیز درست کار می‌کند.',
        sound: 'notification.wav',
        icon: '/logo.png',
      })
      return true
    } catch (err) {
      console.error('Sound test error:', err)
      // fallback به تست بدون صدا
      await sendDesktopNotification({
        title: '🔔 تست نوتیفیکیشن',
        body: 'اگر این پیام را می‌بینید، نوتیفیکیشن به درستی کار می‌کند.',
        icon: '/logo.png',
      })
      return true
    }
  } else {
    await sendDesktopNotification({
      title: '🔔 تست نوتیفیکیشن',
      body: 'اگر این پیام را می‌بینید، نوتیفیکیشن به درستی کار می‌کند.',
      icon: '/logo.png',
    })
    return true
  }
}

// ==================== ابزارهای کمکی ====================

export const getUnreadCount = () => {
  const state = useStore.getState()
  const notifications = state.notifications || []
  return notifications.filter(n => !n.is_read).length
}

export const getNotificationById = (id) => {
  const state = useStore.getState()
  const notifications = state.notifications || []
  return notifications.find(n => n.id === id)
}

export const getNotificationsByType = (type) => {
  const state = useStore.getState()
  const notifications = state.notifications || []
  return notifications.filter(n => n.notification_type === type)
}

export const getRecentNotifications = (limit = 10) => {
  const state = useStore.getState()
  const notifications = state.notifications || []
  return notifications.slice(0, limit)
}