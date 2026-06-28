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

function App() {
  return (
    <>
      <NotificationPermissionHandler />
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
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
    </>
  )
}

export default App