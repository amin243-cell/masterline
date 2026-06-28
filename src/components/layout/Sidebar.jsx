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

export default function Sidebar() {
  return (
    <aside className="w-72 h-screen flex flex-col animate-slide-in-right" dir="rtl">
      {/* پس‌زمینه شیشه‌ای */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-3xl border-l border-slate-800/50" />
      
      {/* محتوای منو */}
      <div className="relative z-10 flex flex-col h-full p-6">
        {/* لوگو */}
        <div className="mb-10 px-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center glow-green-ultra animate-pulse-glow">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gradient-ultra">مسترلاین</h1>
              <p className="text-xs text-slate-400 mt-1">دستیار مالی تریدر</p>
            </div>
          </div>
        </div>
        
        {/* منو */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-500 ease-out group relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-l from-emerald-500/20 to-transparent border-2 border-emerald-500/40 text-white glow-green-ultra'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border-2 border-transparent'
                }`
              }
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* افکت hover */}
              <div className="absolute inset-0 bg-gradient-to-l from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:to-transparent transition-all duration-500" />
              
              <item.icon className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-500" />
              <span className="text-sm font-bold relative z-10">{item.label}</span>
              
              {item.path === '/' && (
                <div className="mr-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow relative z-10" />
              )}
            </NavLink>
          ))}
        </nav>
        
        {/* فوتر */}
        <div className="px-4 py-4 border-t-2 border-slate-800/50 mt-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-sm font-black shadow-lg">
              A
            </div>
            <div className="flex-1">
              <p className="text-sm text-white font-bold">کاربر</p>
              <p className="text-xs text-slate-400">نسخه 1.0.0</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
          </div>
        </div>
      </div>
    </aside>
  )
}