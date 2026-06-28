import useStore from '../store/useStore'

// بررسی مجوز
export const checkNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return false
  }
  
  if (Notification.permission === 'granted') {
    return true
  }
  
  if (Notification.permission === 'denied') {
    return false
  }
  
  try {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  } catch (error) {
    return false
  }
}

// ارسال نوتیفیکیشن
export const sendDesktopNotification = async (options) => {
  const { title, body } = options
  
  try {
    const permissionGranted = await checkNotificationPermission()
    if (!permissionGranted) {
      console.warn('Notification permission not granted')
      return false
    }
    
    const notification = new Notification(title, {
      body,
      dir: 'rtl',
      lang: 'fa',
    })
    
    setTimeout(() => notification.close(), 5000)
    
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

export const sendLoanReminder = async (loan) => {
  const state = useStore.getState()
  if (!state.settings.notifications) return
  
  await sendDesktopNotification({
    title: 'یادآوری پرداخت وام',
    body: 'قسط وام "' + loan.name + '" به مبلغ ' + loan.monthlyPayment.toLocaleString() + ' ریال سررسید شده است',
  })
}

export const sendSubscriptionReminder = async (subscription) => {
  const state = useStore.getState()
  if (!state.settings.notifications) return
  
  await sendDesktopNotification({
    title: 'تمدید اشتراک',
    body: 'اشتراک "' + subscription.name + '" در تاریخ ' + subscription.nextRenewal + ' تمدید می‌شود',
  })
}

export const sendGoalReminder = async (goal, percentage) => {
  const state = useStore.getState()
  if (!state.settings.notifications) return
  
  await sendDesktopNotification({
    title: 'پیشرفت هدف مالی',
    body: 'هدف "' + goal.title + '" به ' + percentage + '% رسید!',
  })
}

export const sendGeneralReminder = async (reminder) => {
  const state = useStore.getState()
  if (!state.settings.notifications) return
  
  await sendDesktopNotification({
    title: reminder.title,
    body: reminder.note || 'یادآوری برنامه',
  })
}

export const checkScheduledNotifications = async () => {
  const state = useStore.getState()
  
  state.goals.forEach(goal => {
    if (goal.status !== 'completed') {
      const percentage = Math.round((goal.currentAmount / goal.targetAmount) * 100)
      
      if (percentage === 25 || percentage === 50 || percentage === 75 || percentage === 100) {
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

export const sendTestNotification = async () => {
  await sendDesktopNotification({
    title: 'تست نوتیفیکیشن',
    body: 'این یک نوتیفیکیشن تستی است. اگر این را می‌بینید، سیستم نوتیفیکیشن به درستی کار می‌کند!',
  })
}