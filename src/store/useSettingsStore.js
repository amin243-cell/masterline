import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useSettingsStore = create(
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
        backupSchedule: 'daily',
        backupPassword: '',
        lastBackup: null,
        lastOptimized: null,
        lastCleanup: null,
        password: '',
        appLockEnabled: false,
      },

      // ==================== تنظیمات اعلان‌ها ====================
      notificationSettings: {
        loan_days: '3,1,0',
        subscription_days: '7,3,0',
        goal_percent: '25,50,75,100',
        general_minutes: '60,30,0',
        dnd_enabled: false,
        dnd_start: '23:00',
        dnd_end: '08:00'
      },

      // ==================== توابع تنظیمات ====================
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      resetSettings: () => set({
        settings: {
          theme: 'dark',
          language: 'fa',
          currency: 'IRR',
          notifications: true,
          sound: true,
          autoBackup: true,
          backupSchedule: 'daily',
          backupPassword: '',
          lastBackup: null,
          lastOptimized: null,
          lastCleanup: null,
          password: '',
          appLockEnabled: false,
        }
      }),

      // ==================== توابع تنظیمات اعلان‌ها ====================
      setNotificationSettings: (settings) => set({ notificationSettings: settings }),
      
      updateNotificationSettings: (newSettings) => set((state) => ({
        notificationSettings: { ...state.notificationSettings, ...newSettings }
      })),
    }),
    {
      name: 'masterline-settings',
      partialize: (state) => ({
        settings: state.settings,
        notificationSettings: state.notificationSettings,
      }),
    }
  )
)

export default useSettingsStore