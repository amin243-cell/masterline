// ==================== خروجی همه استورها ====================
export { default as useSettingsStore } from './useSettingsStore'
export { default as useAccountStore } from './useAccountStore'
export { default as useTransactionStore } from './useTransactionStore'
export { default as useLoanStore } from './useLoanStore'
export { default as useGoalStore } from './useGoalStore'
export { default as useReminderStore } from './useReminderStore'

// ==================== برای سازگاری با کدهای قدیمی ====================
// یک استور ترکیبی برای رفاه کار
import { useSettingsStore } from './useSettingsStore'
import { useAccountStore } from './useAccountStore'
import { useTransactionStore } from './useTransactionStore'
import { useLoanStore } from './useLoanStore'
import { useGoalStore } from './useGoalStore'
import { useReminderStore } from './useReminderStore'

// هوک ترکیبی برای دسترسی به همه استورها در یک جا
export const useMasterStore = () => {
  const settings = useSettingsStore()
  const accounts = useAccountStore()
  const transactions = useTransactionStore()
  const loans = useLoanStore()
  const goals = useGoalStore()
  const reminders = useReminderStore()
  
  return {
    ...settings,
    ...accounts,
    ...transactions,
    ...loans,
    ...goals,
    ...reminders,
  }
}