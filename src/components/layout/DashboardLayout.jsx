// src/components/layout/DashboardLayout.jsx
import { Outlet, NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingUp, 
  Landmark, 
  Target, 
  Wrench, 
  BarChart3, 
  Bell, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../utils/helpers'

const navigation = [
  { name: 'داشبورد', icon: LayoutDashboard, path: '/' },
  { name: 'حساب‌ها', icon: Wallet, path: '/accounts' },
  { name: 'ترید', icon: TrendingUp, path: '/trading' },
  { name: 'وام‌ها', icon: Landmark, path: '/loans' },
  { name: 'اهداف', icon: Target, path: '/goals' },
  { name: 'ابزارها', icon: Wrench, path: '/tools' },
  { name: 'تحلیل', icon: BarChart3, path: '/analytics' },
  { name: 'اعلان‌ها', icon: Bell, path: '/notifications' },
  { name: 'تنظیمات', icon: Settings, path: '/settings' },
]

export default function DashboardLayout({ unreadCount = 0 }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* ============ سایدبار ============ */}
      <aside 
        className={cn(
          "flex flex-col bg-slate-900 border-l border-slate-800 transition-all duration-300",
          isSidebarOpen ? "w-64" : "w-20",
          "hidden md:flex"
        )}
      >
        {/* لوگو */}
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-slate-800",
          isSidebarOpen ? "justify-between" : "justify-center"
        )}>
          {isSidebarOpen ? (
            <>
              <span className="text-xl font-black text-gradient-ultra">Masterline</span>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ناوبری */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar-ultra">
          {navigation.map((item) => {
            const Icon = item.icon
            const isNotifications = item.path === '/notifications'
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative",
                  isActive 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white",
                  !isSidebarOpen && "justify-center"
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {/* نشانگر تعداد اعلان‌های خوانده‌نشده */}
                  {isNotifications && unreadCount > 0 && (
                    <span className={cn(
                      "absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center",
                      !isSidebarOpen && "top-0 -right-2"
                    )}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                {isSidebarOpen && (
                  <span className="text-sm font-medium flex-1">
                    {item.name}
                    {isNotifications && unreadCount > 0 && (
                      <span className="mr-2 px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-md text-[10px] font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* پایین سایدبار */}
        <div className="border-t border-slate-800 p-3">
          <button 
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="text-sm font-medium">خروج</span>}
          </button>
        </div>
      </aside>

      {/* ============ محتوای اصلی ============ */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* هدر موبایل */}
        <header className="md:hidden flex items-center justify-between px-4 h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <span className="text-lg font-black text-gradient-ultra">Masterline</span>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-400 hover:text-white transition-colors relative"
          >
            <Menu className="w-6 h-6" />
            {/* نشانگر تعداد اعلان‌ها در هدر موبایل */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </header>

        {/* منوی موبایل */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md">
            <div className="flex flex-col h-full p-4">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xl font-black text-gradient-ultra">Masterline</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isNotifications = item.path === '/notifications'
                  
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) => cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                        isActive 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" 
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <div className="relative">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {isNotifications && unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium flex-1">
                        {item.name}
                        {isNotifications && unreadCount > 0 && (
                          <span className="mr-2 px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-md text-[10px] font-bold">
                            {unreadCount}
                          </span>
                        )}
                      </span>
                    </NavLink>
                  )
                })}
              </nav>
            </div>
          </div>
        )}

        {/* محتوای صفحه */}
        <div className="flex-1 overflow-y-auto custom-scrollbar-ultra">
          <Outlet />
        </div>
      </main>
    </div>
  )
}