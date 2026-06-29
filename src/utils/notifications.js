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

// ==================== ارسال نوتیفیکیشن (با Tauri) ====================
export const sendDesktopNotification = async (options) => {
  const { title, body, icon, sound, actions } = options
  const state = useStore.getState()
  
  // بررسی تنظیمات
  if (!state.settings?.notifications) {
    console.log('Notifications are disabled')
    return false
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
    sendNotification({
      title: title || 'Masterline',
      body: body || '',
      icon: icon || null,
      sound: (state.settings?.sound && sound) ? sound : null,
      actions: actions || [],
    })

    // ذخیره در تاریخچه
    addToNotificationHistory({
      title,
      body,
      type: 'desktop',
      timestamp: new Date().toISOString(),
      read: false,
    })

    return true
  } catch (error) {
    console.error('Error sending notification:', error)
    return false
  }
}

// ==================== توابع مدیریت تاریخچه ====================

export const addToNotificationHistory = (notification) => {
  const state = useStore.getState()
  const history = state.notificationHistory || []
  const updatedHistory = [
    { ...notification, id: Date.now() + Math.random() },
    ...history
  ].slice(0, 100)
  
  useStore.setState({ notificationHistory: updatedHistory })
}

export const markNotificationAsRead = (id) => {
  const state = useStore.getState()
  const updatedHistory = state.notificationHistory.map(notif => 
    notif.id === id ? { ...notif, read: true } : notif
  )
  useStore.setState({ notificationHistory: updatedHistory })
}

export const markAllAsRead = () => {
  const state = useStore.getState()
  const updatedHistory = state.notificationHistory.map(notif => ({
    ...notif,
    read: true,
  }))
  useStore.setState({ notificationHistory: updatedHistory })
}

export const clearNotificationHistory = () => {
  useStore.setState({ notificationHistory: [] })
}

export const deleteNotification = (id) => {
  const state = useStore.getState()
  const updatedHistory = state.notificationHistory.filter(notif => notif.id !== id)
  useStore.setState({ notificationHistory: updatedHistory })
}

// ==================== توابع اختصاصی ====================

export const sendLoanReminder = async (loan) => {
  const state = useStore.getState()
  if (!state.settings.notifications) return
  
  await sendDesktopNotification({
    title: 'یادآوری پرداخت وام',
    body: `قسط وام "${loan.name}" به مبلغ ${loan.monthlyPayment.toLocaleString()} ریال سررسید شده است`,
    sound: 'notification.wav',
  })
}

export const sendSubscriptionReminder = async (subscription) => {
  const state = useStore.getState()
  if (!state.settings.notifications) return
  
  await sendDesktopNotification({
    title: 'تمدید اشتراک',
    body: `اشتراک "${subscription.name}" در تاریخ ${subscription.nextRenewal} تمدید می‌شود`,
    sound: 'notification.wav',
  })
}

export const sendGoalReminder = async (goal, percentage) => {
  const state = useStore.getState()
  if (!state.settings.notifications) return
  
  await sendDesktopNotification({
    title: 'پیشرفت هدف مالی',
    body: `هدف "${goal.title}" به ${percentage}% رسید!`,
    sound: 'notification.wav',
  })
}

export const sendGeneralReminder = async (reminder) => {
  const state = useStore.getState()
  if (!state.settings.notifications) return
  
  await sendDesktopNotification({
    title: reminder.title,
    body: reminder.note || 'یادآوری برنامه',
    sound: 'notification.wav',
  })
}

// ==================== چک‌کننده خودکار ====================

export const checkScheduledNotifications = async () => {
  const state = useStore.getState()
  
  state.goals.forEach(goal => {
    if (goal.status !== 'completed') {
      const percentage = Math.round((goal.currentAmount / goal.targetAmount) * 100)
      
      const milestones = [25, 50, 75, 100]
      if (milestones.includes(percentage)) {
        sendGoalReminder(goal, percentage)
      }
    }
  })
}

export const startNotificationScheduler = () => {
  const interval = setInterval(checkScheduledNotifications, 15 * 60 * 1000)
  setTimeout(checkScheduledNotifications, 3000)
  return interval
}

// ==================== تست ====================

export const sendTestNotification = async () => {
  const state = useStore.getState()
  
  if (!state.settings?.notifications) {
    useStore.getState().updateSettings({ notifications: true })
  }

  if (state.settings?.sound) {
    try {
      await sendDesktopNotification({
        title: '🔊 تست صدا',
        body: 'اگر این پیام را می‌بینید و صدا را می‌شنوید، همه چیز درست کار می‌کند.',
        sound: 'notification.wav',
        icon: '/logo.png',
      })
    } catch (err) {
      console.error('Sound test error:', err)
      await sendDesktopNotification({
        title: '🔔 تست نوتیفیکیشن',
        body: 'اگر این پیام را می‌بینید، نوتیفیکیشن به درستی کار می‌کند.',
        icon: '/logo.png',
      })
    }
  } else {
    await sendDesktopNotification({
      title: '🔔 تست نوتیفیکیشن',
      body: 'اگر این پیام را می‌بینید، نوتیفیکیشن به درستی کار می‌کند.',
      icon: '/logo.png',
    })
  }
}