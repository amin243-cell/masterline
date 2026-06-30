import { Routes, Route } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Accounts from './pages/Accounts'
import Trading from './pages/Trading'
import Loans from './pages/Loans'
import Goals from './pages/Goals'
import Tools from './pages/Tools'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Notifications from './pages/Notifications'
import NotificationPermissionHandler from './components/NotificationPermissionHandler'
import { useNotifications } from './hooks/useNotifications'
import { useEffect, useCallback } from 'react'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  // ==================== استفاده از useNotifications با try/catch ====================
  let unreadCount = 0
  let fetchNotifications = () => {}
  let error = null
  
  try {
    const result = useNotifications()
    unreadCount = result?.unreadCount ?? 0
    fetchNotifications = result?.fetchNotifications ?? (() => {})
    error = result?.error ?? null
  } catch (e) {
    console.warn('useNotifications error:', e)
    error = e.message
  }
  
  // ==================== بارگذاری اعلان‌ها ====================
  const loadNotifications = useCallback(() => {
    try {
      fetchNotifications()
    } catch (e) {
      console.warn('Error loading notifications:', e)
    }
  }, [fetchNotifications])
  
  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // ==================== اگر خطا داشت، فقط لاگ می‌کنیم ====================
  if (error) {
    console.warn('Notification error (ignored):', error)
  }

  return (
    <ErrorBoundary>
      <NotificationPermissionHandler />
      <Routes>
        <Route path="/" element={<DashboardLayout unreadCount={unreadCount} />}>
          <Route index element={<Dashboard />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="trading" element={<Trading />} />
          <Route path="loans" element={<Loans />} />
          <Route path="goals" element={<Goals />} />
          <Route path="tools" element={<Tools />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}

export default App