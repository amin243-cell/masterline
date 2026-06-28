import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({
      // ==================== تنظیمات برنامه ====================
      settings: {
        theme: 'dark',
        language: 'fa',
        currency: 'IRR',
        notifications: true,
        sound: true,
        autoBackup: true,
      },

      // ==================== تاریخچه نوتیفیکیشن‌ها ====================
      notificationHistory: [],
      
      // ==================== تنظیمات نوتیفیکیشن ====================
      notificationSettings: {
        loans: { enabled: true, beforeDays: [3, 1, 0] },
        subscriptions: { enabled: true, beforeDays: [7, 3, 0] },
        goals: { enabled: true, milestones: [25, 50, 75, 100] },
        reminders: { enabled: true, beforeMinutes: [60, 30, 0] },
        doNotDisturb: { enabled: false, start: '23:00', end: '08:00' },
      },

      // ==================== خلاصه وضعیت مالی ====================
      summary: {
        netWorth: 24856.32,
        monthlyPnL: 380,
        totalDebts: 50000000,
        totalInvestments: 50000,
      },
      
      // ==================== حساب‌های مالی ====================
      accounts: [
        { id: 1, name: 'بایننس فیوچرز', balance: 24856.32, currency: 'USDT', category: 'trading' },
        { id: 2, name: 'صرافی نوبیتکس', balance: 15000000, currency: 'IRR', category: 'trading' },
        { id: 3, name: 'بانک ملی - حساب جاری', balance: 12500000, currency: 'IRR', category: 'bank' },
        { id: 4, name: 'بانک صادرات - پس‌انداز', balance: 8000000, currency: 'IRR', category: 'bank' },
        { id: 5, name: 'بانک ملت - قرض‌الحسنه', balance: 3000000, currency: 'IRR', category: 'bank' },
        { id: 6, name: 'کیف پول متامسک', balance: 0.87, currency: 'BTC', category: 'crypto' },
        { id: 7, name: 'کیف پول لجر', balance: 2.5, currency: 'ETH', category: 'crypto' },
      ],
      
      // ==================== دارایی‌های فیزیکی ====================
      assets: [
        { id: 1, name: 'سکه تمام بهار آزادی', amount: 5, unit: 'عدد', category: 'gold', buyPrice: 42000000, currentPrice: 45000000, buyDate: '1402/08/15', note: 'خرید از بازار تهران' },
        { id: 2, name: 'طلای آب شده', amount: 12.4, unit: 'گرم', category: 'gold', buyPrice: 3500000, currentPrice: 3800000, buyDate: '1403/01/10', note: '' },
        { id: 3, name: 'نقره', amount: 500, unit: 'گرم', category: 'silver', buyPrice: 45000, currentPrice: 52000, buyDate: '1403/02/20', note: '' },
        { id: 4, name: 'پراید 131', amount: 1, unit: 'دستگاه', category: 'car', buyPrice: 280000000, currentPrice: 320000000, buyDate: '1401/05/01', note: 'مدل 1399' },
        { id: 5, name: 'پول نقد در منزل', amount: 50000000, unit: 'ریال', category: 'cash', buyPrice: 50000000, currentPrice: 50000000, buyDate: '1403/04/01', note: 'پس‌انداز اضطراری' },
      ],

      // ==================== فعالیت‌های ترید ====================
      activities: [
        { id: 1, type: 'profit', accountId: 1, amount: 150, date: '1403/04/25', description: 'سود ترید BTC' },
        { id: 2, type: 'loss', accountId: 1, amount: 45, date: '1403/04/24', description: 'ضرر ترید ETH' },
        { id: 3, type: 'deposit', accountId: 3, amount: 5000000, date: '1403/04/20', description: 'واریز ماهانه' },
      ],

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

      // ==================== اهداف ====================
      goals: [
        { 
          id: 1, 
          title: 'خرید آپارتمان', 
          type: 'savings',
          targetAmount: 2000000000, 
          currentAmount: 450000000, 
          deadline: '1405/06/01',
          priority: 'high',
          note: 'پیش‌پرداخت خانه' 
        },
        { 
          id: 2, 
          title: 'صندوق اضطراری', 
          type: 'savings',
          targetAmount: 100000000, 
          currentAmount: 75000000, 
          deadline: '1403/12/01',
          priority: 'high',
          note: '۶ ماه هزینه زندگی' 
        },
        { 
          id: 3, 
          title: 'رسیدن به ۱۰ هزار دلار', 
          type: 'investment',
          targetAmount: 100000, 
          currentAmount: 24856, 
          deadline: '1404/06/01',
          priority: 'medium',
          note: 'هدف سرمایه‌گذاری' 
        },
      ],

      // ==================== یادآورها ====================
      reminders: [
        { 
          id: 1, 
          title: 'پرداخت قسط وام', 
          date: '1403/05/01', 
          time: '10:00',
          category: 'financial',
          note: 'قسط بانک ملی' 
        },
        { 
          id: 2, 
          title: 'تمدید اشتراک ChatGPT', 
          date: '1403/05/01', 
          time: '00:00',
          category: 'subscription',
          note: '' 
        },
        { 
          id: 3, 
          title: 'بررسی پورتفوی', 
          date: '1403/05/15', 
          time: '18:00',
          category: 'investment',
          note: 'بررسی هفتگی' 
        },
      ],

      // ==================== توابع تنظیمات ====================
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      // ==================== توابع نوتیفیکیشن ====================
      updateNotificationSettings: (newSettings) => set((state) => ({
        notificationSettings: { ...state.notificationSettings, ...newSettings }
      })),
      
      addNotificationToHistory: (notification) => set((state) => ({
        notificationHistory: [
          { ...notification, id: Date.now(), timestamp: new Date().toISOString(), read: false },
          ...state.notificationHistory
        ].slice(0, 100)
      })),
      
      clearNotificationHistory: () => set({ notificationHistory: [] }),

      // ==================== توابع پشتیبان‌گیری ====================
      resetAllData: () => set({
        summary: {
          netWorth: 0,
          monthlyPnL: 0,
          totalDebts: 0,
          totalInvestments: 0,
        },
        accounts: [],
        assets: [],
        activities: [],
        loans: [],
        subscriptions: [],
        debts: [],
        goals: [],
        reminders: [],
      }),

      importAllData: (data) => set((state) => ({
        summary: data.summary || state.summary,
        accounts: data.accounts || state.accounts,
        assets: data.assets || state.assets,
        activities: data.activities || state.activities,
        loans: data.loans || state.loans,
        subscriptions: data.subscriptions || state.subscriptions,
        debts: data.debts || state.debts,
        goals: data.goals || state.goals,
        reminders: data.reminders || state.reminders,
        settings: data.settings || state.settings,
      })),

      // ==================== توابع مدیریت دیتابیس ====================
      trackDatabaseChange: () => {
        const now = new Date().toISOString()
        localStorage.setItem('masterline-storage-last-modified', now)
        if (!localStorage.getItem('masterline-storage-first-entry')) {
          localStorage.setItem('masterline-storage-first-entry', now)
        }
      },

      // ==================== توابع مدیریت حساب‌ها ====================
      addAccount: (account) => set((state) => ({
        accounts: [...state.accounts, { ...account, id: Date.now() }]
      })),
      deleteAccount: (id) => set((state) => ({
        accounts: state.accounts.filter(a => a.id !== id)
      })),
      updateAccount: (id, updatedData) => set((state) => ({
        accounts: state.accounts.map(a => a.id === id ? { ...a, ...updatedData } : a)
      })),

      // ==================== توابع مدیریت دارایی‌ها ====================
      addAsset: (asset) => set((state) => ({
        assets: [...state.assets, { ...asset, id: Date.now() }]
      })),
      deleteAsset: (id) => set((state) => ({
        assets: state.assets.filter(a => a.id !== id)
      })),
      updateAsset: (id, updatedData) => set((state) => ({
        assets: state.assets.map(a => a.id === id ? { ...a, ...updatedData } : a)
      })),

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

      // ==================== توابع مدیریت اهداف ====================
      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, { ...goal, id: Date.now() }]
      })),
      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter(g => g.id !== id)
      })),
      updateGoal: (id, updatedData) => set((state) => ({
        goals: state.goals.map(g => g.id === id ? { ...g, ...updatedData } : g)
      })),
      addToGoal: (goalId, amount) => set((state) => ({
        goals: state.goals.map(g => {
          if (g.id === goalId) {
            const newAmount = Math.min(g.targetAmount, g.currentAmount + amount)
            return {
              ...g,
              currentAmount: newAmount,
              status: newAmount >= g.targetAmount ? 'completed' : 'in-progress'
            }
          }
          return g
        })
      })),

      // ==================== توابع مدیریت یادآورها ====================
      addReminder: (reminder) => set((state) => ({
        reminders: [...state.reminders, { ...reminder, id: Date.now() }]
      })),
      deleteReminder: (id) => set((state) => ({
        reminders: state.reminders.filter(r => r.id !== id)
      })),
      updateReminder: (id, updatedData) => set((state) => ({
        reminders: state.reminders.map(r => r.id === id ? { ...r, ...updatedData } : r)
      })),

      updateSummary: (newData) => set((state) => ({
        summary: { ...state.summary, ...newData }
      })),
    }),
    {
      name: 'masterline-storage',
    }
  )
)

export default useStore