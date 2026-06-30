import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAccountStore = create(
  persist(
    (set, get) => ({
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
      
      getTotalBalance: () => {
        const state = get()
        return state.accounts.reduce((total, account) => total + account.balance, 0)
      },

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
      
      getTotalAssetValue: () => {
        const state = get()
        return state.assets.reduce((total, asset) => total + (asset.currentPrice || asset.buyPrice || 0) * (asset.amount || 0), 0)
      },
    }),
    {
      name: 'masterline-accounts',
      partialize: (state) => ({
        accounts: state.accounts,
        assets: state.assets,
      }),
    }
  )
)

export default useAccountStore