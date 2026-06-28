import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  CreditCard,
  Target,
  Settings,
  Zap,
  Calculator,
  BarChart3
} from 'lucide-react'

const menuItems = [
  { path: '/', label: 'داشبورد', icon: LayoutDashboard, color: 'emerald' },
  { path: '/accounts', label: 'حساب‌ها و دارایی‌ها', icon: Wallet, color: 'blue' },
  { path: '/trading', label: 'ثبت سود/ضرر', icon: TrendingUp, color: 'emerald' },
  { path: '/loans', label: 'وام‌ها و بدهی‌ها', icon: CreditCard, color: 'red' },
  { path: '/goals', label: 'اهداف و یادآورها', icon: Target, color: 'purple' },
  { path: '/tools', label: 'ابزارهای تریدر', icon: Calculator, color: 'amber' },
  { path: '/analytics', label: 'آمار و گزارش‌ها', icon: BarChart3, color: 'blue' },
  { path: '/settings', label: 'تنظیمات', icon: Settings, color: 'slate' },
]

const colorClasses = {
  emerald: 'group-hover:text-emerald-400',
  blue: 'group-hover:text-blue-400',
  red: 'group-hover:text-red-400',
  purple: 'group-hover:text-purple-400',
  amber: 'group-hover:text-amber-400',
  slate: 'group-hover:text-slate-300',
}

const activeColorClasses = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  red: 'bg-red-500/10 text-red-400 border-red-500/30',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  slate: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
}

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-l border-slate-800 flex flex-col" dir="rtl">
      {/* هدر */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-blue-400">Masterline</h1>
        <p className="text-xs text-slate-500 mt-1">مدیریت مالی هوشمند</p>
      </div>

      {/* منو */}
      <nav className="flex-1 p-4 space-y-1 overflow-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                  isActive
                    ? activeColorClasses[item.color]
                    : `border-transparent text-slate-400 hover:bg-slate-800/50 ${colorClasses[item.color]}`
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* فوتر */}
      <div className="p-4 border-t border-slate-800">
        <div className="text-xs text-slate-600 text-center">نسخه 0.1.0</div>
      </div>
    </aside>
  )
}