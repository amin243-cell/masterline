import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useLoanStore = create(
  persist(
    (set, get) => ({
      // ==================== وام‌های بانکی ====================
      loans: [
        { 
          id: 1, 
          name: 'وام خرید خودرو', 
          bankName: 'بانک ملی',
          totalAmount: 200000000, 
          remainingAmount: 150000000, 
          interestRate: 18, 
          monthlyPayment: 8500000, 
          startDate: '1402/06/01', 
          endDate: '1404/06/01', 
          totalInstallments: 24, 
          paidInstallments: 6,
          status: 'active',
          note: 'وام ۱۸ درصد' 
        },
      ],

      // ==================== اشتراک‌ها ====================
      subscriptions: [
        { 
          id: 1, 
          name: 'ChatGPT Plus', 
          provider: 'OpenAI',
          amount: 20, 
          currency: 'USD',
          cycle: 'monthly',
          startDate: '1403/01/01', 
          nextRenewal: '1403/05/01', 
          status: 'active',
          note: 'اشتراک سالانه' 
        },
        { 
          id: 2, 
          name: 'Netflix', 
          provider: 'Netflix',
          amount: 15, 
          currency: 'USD',
          cycle: 'monthly',
          startDate: '1402/10/15', 
          nextRenewal: '1403/05/15', 
          status: 'active',
          note: '' 
        },
        { 
          id: 3, 
          name: 'Spotify', 
          provider: 'Spotify',
          amount: 10, 
          currency: 'USD',
          cycle: 'monthly',
          startDate: '1403/02/01', 
          nextRenewal: '1403/05/01', 
          status: 'cancelled',
          note: 'لغو شده' 
        },
      ],

      // ==================== بدهی‌های شخصی ====================
      debts: [
        { 
          id: 1, 
          name: 'بدهی به علی', 
          personName: 'علی محمدی',
          totalAmount: 50000000, 
          remainingAmount: 30000000, 
          startDate: '1403/01/15', 
          dueDate: '1403/10/15', 
          status: 'active',
          note: 'قرض برای خرید ماشین' 
        },
        { 
          id: 2, 
          name: 'بدهی به رضا', 
          personName: 'رضا احمدی',
          totalAmount: 20000000, 
          remainingAmount: 0, 
          startDate: '1402/08/01', 
          dueDate: '1403/02/01', 
          status: 'paid',
          note: 'تسویه شد' 
        },
      ],

      // ==================== توابع مدیریت وام‌ها ====================
      addLoan: (loan) => set((state) => ({
        loans: [...state.loans, { ...loan, id: Date.now() }]
      })),
      
      deleteLoan: (id) => set((state) => ({
        loans: state.loans.filter(l => l.id !== id)
      })),
      
      updateLoan: (id, updatedData) => set((state) => ({
        loans: state.loans.map(l => l.id === id ? { ...l, ...updatedData } : l)
      })),
      
      payLoanInstallment: (loanId, amount) => set((state) => ({
        loans: state.loans.map(l => {
          if (l.id === loanId) {
            const newPaid = l.paidInstallments + 1
            const newRemaining = Math.max(0, l.remainingAmount - amount)
            return {
              ...l,
              paidInstallments: newPaid,
              remainingAmount: newRemaining,
              status: newRemaining === 0 ? 'paid' : 'active'
            }
          }
          return l
        })
      })),

      // ==================== توابع مدیریت اشتراک‌ها ====================
      addSubscription: (sub) => set((state) => ({
        subscriptions: [...state.subscriptions, { ...sub, id: Date.now() }]
      })),
      
      deleteSubscription: (id) => set((state) => ({
        subscriptions: state.subscriptions.filter(s => s.id !== id)
      })),
      
      updateSubscription: (id, updatedData) => set((state) => ({
        subscriptions: state.subscriptions.map(s => s.id === id ? { ...s, ...updatedData } : s)
      })),
      
      renewSubscription: (subId) => set((state) => ({
        subscriptions: state.subscriptions.map(s => {
          if (s.id === subId) {
            return { ...s, lastRenewal: s.nextRenewal }
          }
          return s
        })
      })),

      // ==================== توابع مدیریت بدهی‌ها ====================
      addDebt: (debt) => set((state) => ({
        debts: [...state.debts, { ...debt, id: Date.now() }]
      })),
      
      deleteDebt: (id) => set((state) => ({
        debts: state.debts.filter(d => d.id !== id)
      })),
      
      updateDebt: (id, updatedData) => set((state) => ({
        debts: state.debts.map(d => d.id === id ? { ...d, ...updatedData } : d)
      })),
      
      payDebt: (debtId, amount) => set((state) => ({
        debts: state.debts.map(d => {
          if (d.id === debtId) {
            const newRemaining = Math.max(0, d.remainingAmount - amount)
            return {
              ...d,
              remainingAmount: newRemaining,
              status: newRemaining === 0 ? 'paid' : 'active'
            }
          }
          return d
        })
      })),
    }),
    {
      name: 'masterline-loans',
      partialize: (state) => ({
        loans: state.loans,
        subscriptions: state.subscriptions,
        debts: state.debts,
      }),
    }
  )
)

export default useLoanStore