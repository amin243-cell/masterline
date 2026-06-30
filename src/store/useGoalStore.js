import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getPersianDate } from '../lib/helpers'

const useGoalStore = create(
  persist(
    (set, get) => ({
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
          note: 'پیش‌پرداخت خانه',
          repeat: 'none',
          lastReset: null,
          createdAt: new Date().toISOString()
        },
        { 
          id: 2, 
          title: 'صندوق اضطراری', 
          type: 'savings',
          targetAmount: 100000000, 
          currentAmount: 75000000, 
          deadline: '1403/12/01',
          priority: 'high',
          note: '۶ ماه هزینه زندگی',
          repeat: 'none',
          lastReset: null,
          createdAt: new Date().toISOString()
        },
        { 
          id: 3, 
          title: 'رسیدن به ۱۰ هزار دلار', 
          type: 'investment',
          targetAmount: 100000, 
          currentAmount: 24856, 
          deadline: '1404/06/01',
          priority: 'medium',
          note: 'هدف سرمایه‌گذاری',
          repeat: 'none',
          lastReset: null,
          createdAt: new Date().toISOString()
        },
      ],

      // ==================== تاریخچه تغییرات اهداف ====================
      goalHistory: [],

      // ==================== توابع مدیریت اهداف ====================
      addGoal: (goal) => {
        const newGoal = { 
          ...goal, 
          id: Date.now(),
          status: 'in-progress',
          repeat: goal.repeat || 'none',
          lastReset: null,
          createdAt: new Date().toISOString()
        }
        set((state) => ({
          goals: [...state.goals, newGoal]
        }))
        get().addGoalHistory(newGoal.id, 'created', { 
          title: newGoal.title, 
          targetAmount: newGoal.targetAmount 
        })
        return newGoal.id
      },

      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter(g => g.id !== id)
        }))
        get().clearGoalHistory(id)
      },

      updateGoal: (id, updatedData) => {
        set((state) => ({
          goals: state.goals.map(g => {
            if (g.id === id) {
              const oldGoal = { ...g }
              const newGoal = { ...g, ...updatedData }
              const changes = []
              if (oldGoal.targetAmount !== newGoal.targetAmount) {
                changes.push(`مبلغ هدف از ${oldGoal.targetAmount} به ${newGoal.targetAmount} تغییر کرد`)
              }
              if (oldGoal.deadline !== newGoal.deadline) {
                changes.push(`مهلت هدف از ${oldGoal.deadline || 'نامشخص'} به ${newGoal.deadline || 'نامشخص'} تغییر کرد`)
              }
              if (oldGoal.priority !== newGoal.priority) {
                changes.push(`اولویت از ${oldGoal.priority} به ${newGoal.priority} تغییر کرد`)
              }
              if (changes.length > 0) {
                get().addGoalHistory(id, 'updated', { changes: changes.join('، ') })
              }
              return newGoal
            }
            return g
          })
        }))
      },

      addToGoal: (goalId, amount) => {
        set((state) => {
          const goal = state.goals.find(g => g.id === goalId)
          if (!goal) return state
          
          const newAmount = Math.min(goal.targetAmount, goal.currentAmount + amount)
          const wasCompleted = goal.currentAmount >= goal.targetAmount
          const isNowCompleted = newAmount >= goal.targetAmount
          
          get().addGoalHistory(goalId, 'progress', { 
            amount, 
            newAmount,
            targetAmount: goal.targetAmount,
            progress: (newAmount / goal.targetAmount) * 100
          })
          
          if (!wasCompleted && isNowCompleted) {
            get().addGoalHistory(goalId, 'completed', { 
              title: goal.title,
              targetAmount: goal.targetAmount
            })
          }
          
          return {
            goals: state.goals.map(g => {
              if (g.id === goalId) {
                return {
                  ...g,
                  currentAmount: newAmount,
                  status: newAmount >= g.targetAmount ? 'completed' : 'in-progress'
                }
              }
              return g
            })
          }
        })
      },

      // ==================== توابع تاریخچه اهداف ====================
      addGoalHistory: (goalId, action, details) => {
        const newEntry = {
          id: Date.now(),
          goalId,
          action,
          details,
          timestamp: new Date().toISOString(),
          date: getPersianDate(),
        }
        set((state) => ({
          goalHistory: [newEntry, ...state.goalHistory].slice(0, 100)
        }))
      },

      clearGoalHistory: (goalId) => {
        set((state) => ({
          goalHistory: state.goalHistory.filter(h => h.goalId !== goalId)
        }))
      },

      getGoalHistory: (goalId) => {
        const state = get()
        return state.goalHistory.filter(h => h.goalId === goalId)
      },
    }),
    {
      name: 'masterline-goals',
      partialize: (state) => ({
        goals: state.goals,
        goalHistory: state.goalHistory,
      }),
    }
  )
)

export default useGoalStore