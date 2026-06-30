// src/hooks/useAnalytics.js
import { useMemo, useState, useCallback } from 'react'
import useStore from '../store/useStore'

/**
 * هوک مدیریت داده‌های تحلیلی
 * محاسبات آماری و کش کردن نتایج
 */
export const useAnalytics = (timeRange = 'all') => {
  const { 
    accounts, 
    assets, 
    activities, 
    loans, 
    subscriptions, 
    debts, 
    goals 
  } = useStore()

  // ============ State ============
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)

  // ============ فیلتر بر اساس بازه زمانی ============
  const filterByTimeRange = useCallback((data, dateField = 'date') => {
    if (selectedTimeRange === 'all') return data
    
    const now = new Date()
    const startDate = new Date()
    
    if (selectedTimeRange === 'month') {
      startDate.setMonth(now.getMonth() - 1)
    } else if (selectedTimeRange === 'year') {
      startDate.setFullYear(now.getFullYear() - 1)
    }
    
    return data.filter(item => {
      const itemDate = new Date(item[dateField])
      return itemDate >= startDate && itemDate <= now
    })
  }, [selectedTimeRange])

  // ============ محاسبات اصلی ============
  const analytics = useMemo(() => {
    // فیلتر فعالیت‌ها بر اساس بازه زمانی
    const filteredActivities = filterByTimeRange(activities, 'date')
    const filteredLoans = filterByTimeRange(loans, 'startDate')
    const filteredDebts = filterByTimeRange(debts, 'startDate')
    const filteredGoals = filterByTimeRange(goals, 'startDate')

    // ===== دارایی‌ها =====
    const totalAssets = accounts.reduce((sum, a) => sum + a.balance, 0)
    const totalPhysicalAssets = assets.reduce((sum, a) => sum + (a.currentPrice * a.amount), 0)
    const totalInvestments = accounts
      .filter(a => a.category === 'trading' || a.category === 'crypto')
      .reduce((sum, a) => sum + a.balance, 0)

    // ===== بدهی‌ها =====
    const totalDebts = filteredDebts.reduce((sum, d) => sum + d.remainingAmount, 0) + 
                       filteredLoans.reduce((sum, l) => sum + l.remainingAmount, 0)
    const totalLoans = filteredLoans.reduce((sum, l) => sum + l.remainingAmount, 0)
    const totalPersonalDebts = filteredDebts.reduce((sum, d) => sum + d.remainingAmount, 0)

    // ===== فعالیت‌ها =====
    const activityStats = {
      profit: filteredActivities.filter(a => a.type === 'profit').reduce((sum, a) => sum + a.amount, 0),
      loss: filteredActivities.filter(a => a.type === 'loss').reduce((sum, a) => sum + a.amount, 0),
      deposit: filteredActivities.filter(a => a.type === 'deposit').reduce((sum, a) => sum + a.amount, 0),
      withdraw: filteredActivities.filter(a => a.type === 'withdraw').reduce((sum, a) => sum + a.amount, 0),
      total: filteredActivities.length,
      netProfit: filteredActivities
        .filter(a => a.type === 'profit' || a.type === 'loss')
        .reduce((sum, a) => sum + (a.type === 'profit' ? a.amount : -a.amount), 0),
    }

    // ===== اهداف =====
    const goalsStats = {
      total: filteredGoals.length,
      completed: filteredGoals.filter(g => g.currentAmount >= g.targetAmount).length,
      inProgress: filteredGoals.filter(g => g.currentAmount < g.targetAmount).length,
      averageProgress: filteredGoals.length > 0 
        ? filteredGoals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount * 100), 0) / filteredGoals.length 
        : 0,
      totalTarget: filteredGoals.reduce((sum, g) => sum + g.targetAmount, 0),
      totalCurrent: filteredGoals.reduce((sum, g) => sum + g.currentAmount, 0),
    }

    // ===== وام‌ها =====
    const loansStats = {
      total: filteredLoans.length,
      active: filteredLoans.filter(l => l.status === 'active').length,
      paid: filteredLoans.filter(l => l.status === 'paid').length,
      totalAmount: filteredLoans.reduce((sum, l) => sum + l.totalAmount, 0),
      remainingAmount: filteredLoans.reduce((sum, l) => sum + l.remainingAmount, 0),
      paidAmount: filteredLoans.reduce((sum, l) => sum + (l.totalAmount - l.remainingAmount), 0),
    }

    // ===== اشتراک‌ها =====
    const subscriptionsStats = {
      total: subscriptions.length,
      active: subscriptions.filter(s => s.status === 'active').length,
      cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
      monthlyCost: subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => {
          const monthly = s.cycle === 'yearly' ? s.amount / 12 : 
                          s.cycle === 'quarterly' ? s.amount / 3 :
                          s.cycle === 'weekly' ? s.amount * 4 : s.amount
          return sum + monthly
        }, 0),
      yearlyCost: subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => {
          const yearly = s.cycle === 'yearly' ? s.amount :
                         s.cycle === 'quarterly' ? s.amount * 4 :
                         s.cycle === 'weekly' ? s.amount * 52 : s.amount * 12
          return sum + yearly
        }, 0),
    }

    // ===== توزیع دارایی‌ها =====
    const assetDistribution = [
      { 
        name: 'حساب‌های ترید', 
        value: accounts.filter(a => a.category === 'trading').reduce((sum, a) => sum + a.balance, 0),
        color: '#10b981' 
      },
      { 
        name: 'حساب‌های بانکی', 
        value: accounts.filter(a => a.category === 'bank').reduce((sum, a) => sum + a.balance, 0),
        color: '#3b82f6' 
      },
      { 
        name: 'کیف پول کریپتو', 
        value: accounts.filter(a => a.category === 'crypto').reduce((sum, a) => sum + a.balance, 0),
        color: '#f59e0b' 
      },
      { 
        name: 'دارایی‌های فیزیکی', 
        value: totalPhysicalAssets,
        color: '#a855f7' 
      },
    ].filter(item => item.value > 0)

    // ===== خالص دارایی =====
    const netWorth = totalAssets + totalPhysicalAssets - totalDebts

    // ===== داده‌های رشد (محاسبه شده از فعالیت‌ها) =====
    const growthData = (() => {
      if (activities.length === 0) return []
      
      // گروه‌بندی فعالیت‌ها بر اساس ماه
      const monthlyData = {}
      const sortedActivities = [...activities].sort((a, b) => new Date(a.date) - new Date(b.date))
      
      sortedActivities.forEach(activity => {
        const date = new Date(activity.date)
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { profit: 0, loss: 0, deposit: 0, withdraw: 0 }
        }
        if (activity.type === 'profit') monthlyData[monthKey].profit += activity.amount
        if (activity.type === 'loss') monthlyData[monthKey].loss += activity.amount
        if (activity.type === 'deposit') monthlyData[monthKey].deposit += activity.amount
        if (activity.type === 'withdraw') monthlyData[monthKey].withdraw += activity.amount
      })

      // محاسبه رشد تجمعی
      let cumulative = 0
      const monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
      
      return Object.entries(monthlyData).map(([key, data]) => {
        const [year, month] = key.split('-').map(Number)
        const netChange = data.profit - data.loss + data.deposit - data.withdraw
        cumulative += netChange
        return {
          month: `${monthNames[month - 1]} ${year}`,
          value: Math.max(0, totalAssets + cumulative),
          profit: data.profit,
          loss: data.loss,
          deposit: data.deposit,
          withdraw: data.withdraw,
        }
      })
    })()

    return {
      // خلاصه کلی
      summary: {
        netWorth,
        totalAssets: totalAssets + totalPhysicalAssets,
        totalDebts,
        totalInvestments,
        totalPhysicalAssets,
        monthlyIncome: activityStats.profit + activityStats.deposit,
        monthlyExpense: activityStats.loss + activityStats.withdraw,
        monthlyNet: activityStats.netProfit + activityStats.deposit - activityStats.withdraw,
      },
      // بخش‌های مختلف
      accounts: {
        total: accounts.length,
        totalBalance: totalAssets,
        byCategory: {
          trading: accounts.filter(a => a.category === 'trading'),
          bank: accounts.filter(a => a.category === 'bank'),
          crypto: accounts.filter(a => a.category === 'crypto'),
        }
      },
      assets: {
        total: assets.length,
        totalValue: totalPhysicalAssets,
        byCategory: {
          gold: assets.filter(a => a.category === 'gold'),
          silver: assets.filter(a => a.category === 'silver'),
          car: assets.filter(a => a.category === 'car'),
          cash: assets.filter(a => a.category === 'cash'),
          other: assets.filter(a => !['gold', 'silver', 'car', 'cash'].includes(a.category)),
        }
      },
      activities: activityStats,
      loans: loansStats,
      subscriptions: subscriptionsStats,
      debts: {
        total: debts.length,
        totalAmount: debts.reduce((sum, d) => sum + d.totalAmount, 0),
        remainingAmount: totalPersonalDebts,
        paidAmount: debts.reduce((sum, d) => sum + (d.totalAmount - d.remainingAmount), 0),
        active: debts.filter(d => d.status === 'active').length,
        paid: debts.filter(d => d.status === 'paid').length,
      },
      goals: goalsStats,
      // داده‌های نمودارها
      charts: {
        assetDistribution,
        activityChart: [
          { name: 'سود', value: activityStats.profit, color: '#10b981' },
          { name: 'ضرر', value: activityStats.loss, color: '#ef4444' },
          { name: 'واریز', value: activityStats.deposit, color: '#3b82f6' },
          { name: 'برداشت', value: activityStats.withdraw, color: '#f59e0b' },
        ].filter(item => item.value > 0),
        goalsProgress: goals.map(g => ({
          name: g.title.length > 15 ? g.title.substring(0, 15) + '...' : g.title,
          پیشرفت: Math.min((g.currentAmount / g.targetAmount) * 100, 100),
          باقیمانده: Math.max(100 - (g.currentAmount / g.targetAmount) * 100, 0)
        })),
        loansProgress: loans.map(l => ({
          name: l.name.length > 15 ? l.name.substring(0, 15) + '...' : l.name,
          پرداخت_شده: l.paidInstallments || 0,
          باقیمانده: l.totalInstallments - (l.paidInstallments || 0)
        })),
        growth: growthData,
      }
    }
  }, [
    accounts, 
    assets, 
    activities, 
    loans, 
    subscriptions, 
    debts, 
    goals,
    filterByTimeRange,
    selectedTimeRange
  ])

  // ============ تغییر بازه زمانی ============
  const setTimeRange = useCallback((range) => {
    setSelectedTimeRange(range)
  }, [])

  // ============ خروجی گرفتن ============
  const getCSVData = useCallback(() => {
    const data = [
      ['نوع', 'مقدار', 'واحد'],
      ['خالص دارایی', analytics.summary.netWorth, 'ریال'],
      ['کل دارایی‌ها', analytics.summary.totalAssets, 'ریال'],
      ['کل بدهی‌ها', analytics.summary.totalDebts, 'ریال'],
      ['کل سرمایه‌گذاری', analytics.summary.totalInvestments, 'ریال'],
      ['تعداد حساب‌ها', analytics.accounts.total, 'عدد'],
      ['تعداد دارایی‌ها', analytics.assets.total, 'عدد'],
      ['تعداد فعالیت‌ها', analytics.activities.total, 'عدد'],
      ['تعداد وام‌ها', analytics.loans.total, 'عدد'],
      ['تعداد اهداف', analytics.goals.total, 'عدد'],
      ['تعداد بدهی‌ها', analytics.debts.total, 'عدد'],
      ['تعداد اشتراک‌ها', analytics.subscriptions.total, 'عدد'],
    ]
    return data
  }, [analytics])

  return {
    analytics,
    selectedTimeRange,
    setTimeRange,
    getCSVData,
    isLoading: false,
    error: null,
  }
}

export default useAnalytics