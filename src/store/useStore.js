// ==================== Importها ====================
import useSettingsStore from './useSettingsStore'
import useAccountStore from './useAccountStore'
import useTransactionStore from './useTransactionStore'
import useLoanStore from './useLoanStore'
import useGoalStore from './useGoalStore'
import useReminderStore from './useReminderStore'

// ==================== هوک ترکیبی ====================
const useStore = () => {
  const settings = useSettingsStore()
  const accounts = useAccountStore()
  const transactions = useTransactionStore()
  const loans = useLoanStore()
  const goals = useGoalStore()
  const reminders = useReminderStore()
  
  // ==================== توابع ترکیبی ====================
  const recalculateSummary = () => {
    const totalBalance = accounts.accounts.reduce((sum, a) => sum + a.balance, 0)
    const totalAssetValue = accounts.assets.reduce((sum, a) => sum + (a.currentPrice || 0) * (a.amount || 0), 0)
    const totalDebts = loans.debts.reduce((sum, d) => sum + d.remainingAmount, 0)
    const totalLoans = loans.loans.reduce((sum, l) => sum + l.remainingAmount, 0)
    const monthlyPnL = transactions.getTotalPnL()
    
    transactions.updateSummary({
      netWorth: totalBalance + totalAssetValue - totalDebts - totalLoans,
      monthlyPnL: monthlyPnL,
      totalDebts: totalDebts + totalLoans,
      totalInvestments: totalAssetValue,
    })
  }

  // ==================== توابع مدیریت داده از دیتابیس (اصلاح‌شده) ====================
  const setAccounts = (data) => {
    // فقط اگر داده تغییر کرده باشه، آپدیت کن
    const currentIds = accounts.accounts.map(a => a.id)
    const newIds = data.map(a => a.id)
    
    // اگر لیست یکسان بود، آپدیت نکن
    if (JSON.stringify(currentIds) === JSON.stringify(newIds)) {
      return
    }
    
    // پاک کردن همه و اضافه کردن دوباره (راه‌حل ساده)
    // توجه: این کار باعث ری‌رندر میشه ولی از حلقه بی‌نهایت جلوگیری می‌کنه
    data.forEach(account => {
      const existing = accounts.accounts.find(a => a.id === account.id)
      if (!existing) {
        accounts.addAccount(account)
      }
    })
  }

  const setAssets = (data) => {
    const currentIds = accounts.assets.map(a => a.id)
    const newIds = data.map(a => a.id)
    if (JSON.stringify(currentIds) === JSON.stringify(newIds)) return
    
    data.forEach(asset => {
      const existing = accounts.assets.find(a => a.id === asset.id)
      if (!existing) {
        accounts.addAsset(asset)
      }
    })
  }

  const setSummary = (data) => {
    transactions.updateSummary(data)
  }

  const setActivities = (data) => {
    const currentIds = transactions.activities.map(a => a.id)
    const newIds = data.map(a => a.id)
    if (JSON.stringify(currentIds) === JSON.stringify(newIds)) return
    
    data.forEach(activity => {
      const existing = transactions.activities.find(a => a.id === activity.id)
      if (!existing) {
        transactions.addActivity(activity)
      }
    })
  }

  const setGoals = (data) => {
    const currentIds = goals.goals.map(g => g.id)
    const newIds = data.map(g => g.id)
    if (JSON.stringify(currentIds) === JSON.stringify(newIds)) return
    
    data.forEach(goal => {
      const existing = goals.goals.find(g => g.id === goal.id)
      if (!existing) {
        goals.addGoal(goal)
      }
    })
  }

  const setLoans = (data) => {
    const currentIds = loans.loans.map(l => l.id)
    const newIds = data.map(l => l.id)
    if (JSON.stringify(currentIds) === JSON.stringify(newIds)) return
    
    data.forEach(loan => {
      const existing = loans.loans.find(l => l.id === loan.id)
      if (!existing) {
        loans.addLoan(loan)
      }
    })
  }

  const setDebts = (data) => {
    const currentIds = loans.debts.map(d => d.id)
    const newIds = data.map(d => d.id)
    if (JSON.stringify(currentIds) === JSON.stringify(newIds)) return
    
    data.forEach(debt => {
      const existing = loans.debts.find(d => d.id === debt.id)
      if (!existing) {
        loans.addDebt(debt)
      }
    })
  }

  const setSubscriptions = (data) => {
    const currentIds = loans.subscriptions.map(s => s.id)
    const newIds = data.map(s => s.id)
    if (JSON.stringify(currentIds) === JSON.stringify(newIds)) return
    
    data.forEach(sub => {
      const existing = loans.subscriptions.find(s => s.id === sub.id)
      if (!existing) {
        loans.addSubscription(sub)
      }
    })
  }

  const setReminders = (data) => {
    const currentIds = reminders.reminders.map(r => r.id)
    const newIds = data.map(r => r.id)
    if (JSON.stringify(currentIds) === JSON.stringify(newIds)) return
    
    data.forEach(reminder => {
      const existing = reminders.reminders.find(r => r.id === reminder.id)
      if (!existing) {
        reminders.addReminder(reminder)
      }
    })
  }

  // ==================== توابع عمومی ====================
  const resetAllData = () => {
    settings.resetSettings()
  }

  const exportAllData = () => {
    return {
      version: '2.0.0',
      exportDate: new Date().toISOString(),
      appName: 'Masterline',
      data: {
        settings: settings.settings,
        notificationSettings: settings.notificationSettings,
        summary: transactions.summary,
        accounts: accounts.accounts,
        assets: accounts.assets,
        activities: transactions.activities,
        loans: loans.loans,
        subscriptions: loans.subscriptions,
        debts: loans.debts,
        goals: goals.goals,
        reminders: reminders.reminders,
        goalHistory: goals.goalHistory,
      }
    }
  }

  const importAllData = (data) => {
    if (!data || !data.data) {
      console.error('Invalid import data')
      return false
    }

    try {
      const { data: imported } = data
      
      if (imported.settings) settings.updateSettings(imported.settings)
      if (imported.notificationSettings) settings.updateNotificationSettings(imported.notificationSettings)
      if (imported.summary) transactions.updateSummary(imported.summary)
      
      if (imported.accounts) {
        imported.accounts.forEach(account => {
          const existing = accounts.accounts.find(a => a.id === account.id)
          if (!existing) {
            accounts.addAccount(account)
          }
        })
      }
      
      if (imported.assets) {
        imported.assets.forEach(asset => {
          const existing = accounts.assets.find(a => a.id === asset.id)
          if (!existing) {
            accounts.addAsset(asset)
          }
        })
      }
      
      if (imported.activities) {
        imported.activities.forEach(activity => {
          transactions.addActivity(activity)
        })
      }
      
      if (imported.loans) {
        imported.loans.forEach(loan => {
          loans.addLoan(loan)
        })
      }
      
      if (imported.subscriptions) {
        imported.subscriptions.forEach(sub => {
          loans.addSubscription(sub)
        })
      }
      
      if (imported.debts) {
        imported.debts.forEach(debt => {
          loans.addDebt(debt)
        })
      }
      
      if (imported.goals) {
        imported.goals.forEach(goal => {
          goals.addGoal(goal)
        })
      }
      
      if (imported.reminders) {
        imported.reminders.forEach(reminder => {
          reminders.addReminder(reminder)
        })
      }
      
      recalculateSummary()
      return true
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }

  // ==================== خروجی ====================
  return {
    // تنظیمات
    settings: settings.settings,
    notificationSettings: settings.notificationSettings,
    updateSettings: settings.updateSettings,
    resetSettings: settings.resetSettings,
    setNotificationSettings: settings.setNotificationSettings,
    updateNotificationSettings: settings.updateNotificationSettings,
    
    // حساب‌ها و دارایی‌ها
    accounts: accounts.accounts,
    assets: accounts.assets,
    addAccount: accounts.addAccount,
    deleteAccount: accounts.deleteAccount,
    updateAccount: accounts.updateAccount,
    getTotalBalance: accounts.getTotalBalance,
    addAsset: accounts.addAsset,
    deleteAsset: accounts.deleteAsset,
    updateAsset: accounts.updateAsset,
    getTotalAssetValue: accounts.getTotalAssetValue,
    setAccounts,
    setAssets,
    
    // تراکنش‌ها
    activities: transactions.activities,
    summary: transactions.summary,
    addActivity: transactions.addActivity,
    deleteActivity: transactions.deleteActivity,
    updateActivity: transactions.updateActivity,
    getTotalPnL: transactions.getTotalPnL,
    updateSummary: transactions.updateSummary,
    recalculateSummary: recalculateSummary,
    setSummary,
    setActivities,
    
    // وام‌ها و بدهی‌ها
    loans: loans.loans,
    subscriptions: loans.subscriptions,
    debts: loans.debts,
    addLoan: loans.addLoan,
    deleteLoan: loans.deleteLoan,
    updateLoan: loans.updateLoan,
    payLoanInstallment: loans.payLoanInstallment,
    addSubscription: loans.addSubscription,
    deleteSubscription: loans.deleteSubscription,
    updateSubscription: loans.updateSubscription,
    renewSubscription: loans.renewSubscription,
    addDebt: loans.addDebt,
    deleteDebt: loans.deleteDebt,
    updateDebt: loans.updateDebt,
    payDebt: loans.payDebt,
    setLoans,
    setDebts,
    setSubscriptions,
    
    // اهداف
    goals: goals.goals,
    goalHistory: goals.goalHistory,
    addGoal: goals.addGoal,
    deleteGoal: goals.deleteGoal,
    updateGoal: goals.updateGoal,
    addToGoal: goals.addToGoal,
    addGoalHistory: goals.addGoalHistory,
    clearGoalHistory: goals.clearGoalHistory,
    getGoalHistory: goals.getGoalHistory,
    setGoals,
    
    // یادآورها
    reminders: reminders.reminders,
    addReminder: reminders.addReminder,
    deleteReminder: reminders.deleteReminder,
    updateReminder: reminders.updateReminder,
    setReminders,
    
    // توابع عمومی
    resetAllData: resetAllData,
    exportAllData: exportAllData,
    importAllData: importAllData,
    
    // ==================== توابع قدیمی برای سازگاری ====================
    notifications: [],
    unreadCount: 0,
    setNotifications: () => {},
    setUnreadCount: () => {},
    addNotificationToHistory: () => {},
    clearNotificationHistory: () => {},
    markNotificationAsRead: () => {},
    markAllNotificationsAsRead: () => {},
    resetSection: () => {},
    trackDatabaseChange: () => {},
  }
}

export default useStore