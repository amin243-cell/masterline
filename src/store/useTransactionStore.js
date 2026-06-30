import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useTransactionStore = create(
  persist(
    (set, get) => ({
      // ==================== فعالیت‌های ترید ====================
      activities: [
        { id: 1, type: 'profit', accountId: 1, amount: 150, date: '1403/04/25', description: 'سود ترید BTC' },
        { id: 2, type: 'loss', accountId: 1, amount: 45, date: '1403/04/24', description: 'ضرر ترید ETH' },
        { id: 3, type: 'deposit', accountId: 3, amount: 5000000, date: '1403/04/20', description: 'واریز ماهانه' },
      ],

      // ==================== خلاصه وضعیت مالی ====================
      summary: {
        netWorth: 24856.32,
        monthlyPnL: 380,
        totalDebts: 50000000,
        totalInvestments: 50000,
      },

      // ==================== توابع مدیریت فعالیت‌ها ====================
      addActivity: (activity) => set((state) => ({
        activities: [{ ...activity, id: Date.now() }, ...state.activities]
      })),
      
      deleteActivity: (id) => set((state) => ({
        activities: state.activities.filter(a => a.id !== id)
      })),
      
      updateActivity: (id, updatedData) => set((state) => ({
        activities: state.activities.map(a => a.id === id ? { ...a, ...updatedData } : a)
      })),
      
      getTotalPnL: () => {
        const state = get()
        return state.activities.reduce((total, activity) => {
          if (activity.type === 'profit') return total + activity.amount
          if (activity.type === 'loss') return total - activity.amount
          return total
        }, 0)
      },

      // ==================== توابع مدیریت خلاصه ====================
      updateSummary: (newData) => set((state) => ({
        summary: { ...state.summary, ...newData }
      })),
      
      recalculateSummary: () => {
        const state = get()
        // توجه: این توابع به استورهای دیگر وابسته هستند
        // در مرحله بعد این مشکل را حل می‌کنیم
        const totalBalance = 0 // موقتاً
        const totalAssetValue = 0 // موقتاً
        const totalDebts = 0 // موقتاً
        const totalLoans = 0 // موقتاً
        
        set({
          summary: {
            netWorth: totalBalance + totalAssetValue - totalDebts - totalLoans,
            monthlyPnL: state.getTotalPnL(),
            totalDebts: totalDebts + totalLoans,
            totalInvestments: totalAssetValue,
          }
        })
      },
    }),
    {
      name: 'masterline-transactions',
      partialize: (state) => ({
        activities: state.activities,
        summary: state.summary,
      }),
    }
  )
)

export default useTransactionStore