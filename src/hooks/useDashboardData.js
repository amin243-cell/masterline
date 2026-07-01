import { useState, useEffect, useCallback, useRef } from 'react'
import useStore from '../store/useStore'
import { toast } from 'sonner'

// ==================== تابع invoke ====================
const getInvoke = () => {
  // روش 1: از طریق window.__TAURI_INTERNALS__
  if (window.__TAURI_INTERNALS__) {
    return window.__TAURI_INTERNALS__.invoke
  }
  // روش 2: از طریق window.__TAURI__
  if (window.__TAURI__?.core?.invoke) {
    return window.__TAURI__.core.invoke
  }
  // روش 3: import داینامیک (برای توسعه)
  throw new Error('Tauri API not available')
}

export function useDashboardData() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const isFirstRender = useRef(true)
  
  const {
    setAccounts,
    setAssets,
    setSummary,
    setActivities,
    setGoals,
    setLoans,
    setDebts,
    setSubscriptions,
    setReminders,
    recalculateSummary,
  } = useStore()

  const fetchAllData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const invoke = getInvoke()
      console.log('🔄 Fetching data from Tauri...')
      
      const [accounts, assets, activities, goals, loans, debts, subscriptions, reminders] = await Promise.all([
        invoke('get_accounts').catch(err => { console.warn('get_accounts error:', err); return [] }),
        invoke('get_assets').catch(err => { console.warn('get_assets error:', err); return [] }),
        invoke('get_activities').catch(err => { console.warn('get_activities error:', err); return [] }),
        invoke('get_goals').catch(err => { console.warn('get_goals error:', err); return [] }),
        invoke('get_loans').catch(err => { console.warn('get_loans error:', err); return [] }),
        invoke('get_debts').catch(err => { console.warn('get_debts error:', err); return [] }),
        invoke('get_subscriptions').catch(err => { console.warn('get_subscriptions error:', err); return [] }),
        invoke('get_reminders').catch(err => { console.warn('get_reminders error:', err); return [] }),
      ])

      console.log('✅ Data fetched:', { 
        accounts: accounts?.length, 
        assets: assets?.length,
        goals: goals?.length,
        loans: loans?.length,
      })

      if (accounts && accounts.length > 0) setAccounts(accounts)
      if (assets && assets.length > 0) setAssets(assets)
      if (activities && activities.length > 0) setActivities(activities)
      if (goals && goals.length > 0) setGoals(goals)
      if (loans && loans.length > 0) setLoans(loans)
      if (debts && debts.length > 0) setDebts(debts)
      if (subscriptions && subscriptions.length > 0) setSubscriptions(subscriptions)
      if (reminders && reminders.length > 0) setReminders(reminders)

      recalculateSummary()
      setLastUpdate(new Date().toLocaleTimeString('fa-IR'))
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err)
      setError(err.message || 'خطا در دریافت داده‌ها')
    } finally {
      setLoading(false)
    }
  }, [
    setAccounts,
    setAssets,
    setSummary,
    setActivities,
    setGoals,
    setLoans,
    setDebts,
    setSubscriptions,
    setReminders,
    recalculateSummary,
  ])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      fetchAllData()
    }
    
    // رفرش هر ۵ دقیقه
    const interval = setInterval(() => {
      fetchAllData()
    }, 300000)

    return () => clearInterval(interval)
  }, [fetchAllData])

  return {
    loading,
    error,
    lastUpdate,
    refresh: fetchAllData,
  }
}