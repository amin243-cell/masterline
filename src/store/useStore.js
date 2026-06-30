// ==================== Importهای اصلاح شده ====================
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

  const resetAllData = () => {
    settings.resetSettings()
    // می‌توانید برای سایر استورها هم reset اضافه کنید
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
    if (data.settings) settings.updateSettings(data.settings)
    if (data.summary) transactions.updateSummary(data.summary)
    // سایر بخش‌ها را می‌توانید اضافه کنید
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
    
    // تراکنش‌ها
    activities: transactions.activities,
    summary: transactions.summary,
    addActivity: transactions.addActivity,
    deleteActivity: transactions.deleteActivity,
    updateActivity: transactions.updateActivity,
    getTotalPnL: transactions.getTotalPnL,
    updateSummary: transactions.updateSummary,
    recalculateSummary: recalculateSummary,
    
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
    
    // یادآورها
    reminders: reminders.reminders,
    addReminder: reminders.addReminder,
    deleteReminder: reminders.deleteReminder,
    updateReminder: reminders.updateReminder,
    
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