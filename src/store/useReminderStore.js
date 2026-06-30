import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useReminderStore = create(
  persist(
    (set, get) => ({
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
    }),
    {
      name: 'masterline-reminders',
      partialize: (state) => ({
        reminders: state.reminders,
      }),
    }
  )
)

export default useReminderStore