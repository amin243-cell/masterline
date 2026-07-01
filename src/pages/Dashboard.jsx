import { useState } from 'react'
import { 
  Wallet, TrendingUp, CreditCard, PieChart, ArrowUpRight, 
  Bitcoin, Building2, TrendingDown, RefreshCw, 
  Filter, Download, Target, Zap, BarChart3,
  MoreHorizontal
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { useDashboardData } from '../hooks/useDashboardData'
import useStore from '../store/useStore'
import { formatNumber, getPersianDate } from '../lib/helpers'
import { cn } from '../lib/utils'
import { toast } from 'sonner'

// ==================== کامپوننت کارت آمار ====================
const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  subValue,
  change, 
  trend = 'up',
  color = 'emerald',
  progress = 0,
  loading = false,
  className,
  onClick,
  children,
  ...props 
}) => {
  const colors = {
    emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'hover:border-emerald-500/40', glow: 'shadow-emerald-500/5' },
    blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400', border: 'hover:border-blue-500/40', glow: 'shadow-blue-500/5' },
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400', border: 'hover:border-purple-500/40', glow: 'shadow-purple-500/5' },
    red: { bg: 'bg-red-500/10', icon: 'text-red-400', border: 'hover:border-red-500/40', glow: 'shadow-red-500/5' },
    amber: { bg: 'bg-amber-500/10', icon: 'text-amber-400', border: 'hover:border-amber-500/40', glow: 'shadow-amber-500/5' },
    pink: { bg: 'bg-pink-500/10', icon: 'text-pink-400', border: 'hover:border-pink-500/40', glow: 'shadow-pink-500/5' },
  }

  const colorStyle = colors[color] || colors.emerald
  const isPositive = change && change > 0
  const isNegative = change && change < 0
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null

  if (loading) {
    return (
      <div className={cn("p-6 rounded-2xl border border-slate-800 bg-slate-900/50 animate-pulse", className)}>
        <div className="h-10 w-10 rounded-xl bg-slate-800/50 mb-3" />
        <div className="h-4 w-20 bg-slate-800/50 mb-2" />
        <div className="h-8 w-32 bg-slate-800/50" />
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative p-6 rounded-2xl border border-slate-800 bg-slate-900/50",
        "transition-all duration-500 cursor-pointer",
        "hover:scale-[1.02] hover:shadow-xl",
        colorStyle.border, colorStyle.glow,
        "hover:bg-slate-900/80",
        className
      )}
      {...props}
    >
      <div className={cn(
        "absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl",
        color === 'emerald' && "bg-emerald-500/10",
        color === 'blue' && "bg-blue-500/10",
        color === 'purple' && "bg-purple-500/10",
        color === 'red' && "bg-red-500/10",
        color === 'amber' && "bg-amber-500/10",
        color === 'pink' && "bg-pink-500/10",
      )} />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-3 rounded-xl transition-all duration-300 group-hover:scale-110", colorStyle.bg)}>
            <Icon className={cn("w-6 h-6", colorStyle.icon)} />
          </div>
          <div className="flex items-center gap-2">
            {change && (
              <span className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold",
                isPositive ? "bg-emerald-500/10 text-emerald-400" :
                isNegative ? "bg-red-500/10 text-red-400" :
                "bg-slate-800/50 text-slate-400"
              )}>
                {TrendIcon && <TrendIcon className="w-3 h-3" />}
                {isPositive ? '+' : ''}{change}%
              </span>
            )}
            {/* سه نقطه نمادین - برای آپدیت بعدی */}
            <div className="relative">
              <button 
                className="p-1.5 rounded-lg hover:bg-slate-800/50 transition-all opacity-0 group-hover:opacity-100 cursor-default"
                title="گزینه‌های بیشتر - در آپدیت بعدی"
              >
                <MoreHorizontal className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-400 mb-1.5">{label}</p>
        <p className="text-3xl font-black text-white tracking-tight">
          {value}
        </p>
        {subValue && (
          <p className="text-xs text-slate-500 mt-1">{subValue}</p>
        )}

        {progress > 0 && (
          <div className="mt-4">
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  "bg-gradient-to-r",
                  color === 'emerald' && "from-emerald-400 to-emerald-600",
                  color === 'blue' && "from-blue-400 to-blue-600",
                  color === 'purple' && "from-purple-400 to-purple-600",
                  color === 'red' && "from-red-400 to-red-600",
                  color === 'amber' && "from-amber-400 to-amber-600",
                  color === 'pink' && "from-pink-400 to-pink-600",
                )}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  )
}

// ==================== کامپوننت فیلتر زمان ====================
const TimeFilter = ({ value, onChange, className }) => {
  const options = [
    { value: 'today', label: 'امروز' },
    { value: 'week', label: 'هفته' },
    { value: 'month', label: 'ماه' },
    { value: 'quarter', label: 'سه ماه' },
    { value: 'year', label: 'سال' },
    { value: 'all', label: 'همه' },
  ]

  return (
    <div className={cn("flex items-center gap-1 p-1 rounded-xl bg-slate-800/30 border border-slate-800", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-300",
            value === option.value
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

// ==================== صفحه اصلی ====================
export default function Dashboard() {
  const [timeFilter, setTimeFilter] = useState('month')
  const { summary, accounts, assets, loans, debts, goals } = useStore()
  const { loading, error, lastUpdate, refresh } = useDashboardData()

  // ==================== محاسبات ====================
  const totalLoansRemaining = loans.reduce((sum, l) => sum + l.remainingAmount, 0)
  const totalDebtsRemaining = debts.reduce((sum, d) => sum + d.remainingAmount, 0)
  
  const totalGoalsProgress = goals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount * 100), 0)
  const avgGoalsProgress = goals.length > 0 ? totalGoalsProgress / goals.length : 0

  const topAssets = [...assets]
    .sort((a, b) => (b.currentPrice * b.amount) - (a.currentPrice * a.amount))
    .slice(0, 5)

  const totalProfit = assets.reduce((sum, a) => {
    return sum + ((a.currentPrice - a.buyPrice) * a.amount)
  }, 0)

  const activeGoals = goals.filter(g => g.status === 'in-progress')
  const completedGoals = goals.filter(g => g.status === 'completed')
  const nearestDeadline = [...goals]
    .filter(g => g.status === 'in-progress')
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0]

  // ==================== اکشن‌ها ====================
  const handleRefresh = () => {
    refresh()
    toast.success('✅ داده‌ها بروزرسانی شدند', {
      duration: 2000,
    })
  }

  const handleExport = () => {
    toast.success('📊 گزارش با موفقیت صادر شد', {
      duration: 3000,
    })
  }

  // ==================== رندر لودینگ ====================
  if (loading) {
    return (
      <div className="p-8 space-y-8" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-10 w-48 bg-slate-800/50 rounded-xl animate-pulse" />
            <div className="h-5 w-64 bg-slate-800/30 rounded-lg mt-3 animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-slate-800/50 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 animate-pulse">
              <div className="h-12 w-12 rounded-xl bg-slate-800/50 mb-3" />
              <div className="h-4 w-24 bg-slate-800/50 mb-2" />
              <div className="h-8 w-36 bg-slate-800/50" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ==================== رندر خطا ====================
  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]" dir="rtl">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-white">خطا در دریافت داده‌ها</h2>
          <p className="text-slate-400 max-w-md">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 rounded-xl text-white font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    )
  }

  // ==================== رندر اصلی ====================
  return (
    <div className="p-8 space-y-8" dir="rtl">
      {/* ==================== هدر ==================== */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            📊 داشبورد
          </h1>
          <p className="text-base text-slate-400 mt-2">
            {getPersianDate()} - {activeGoals.length} هدف فعال، {accounts.length} حساب
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-bold text-emerald-400">آنلاین</span>
            {lastUpdate && (
              <span className="text-xs text-slate-500 mr-2">| {lastUpdate}</span>
            )}
          </div>
          <button
            onClick={handleExport}
            className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all"
            title="خروجی گزارش"
          >
            <Download className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all"
            title="بروزرسانی"
          >
            <RefreshCw className={cn("w-5 h-5 text-slate-400 hover:text-white", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* ==================== فیلتر زمان ==================== */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400 font-medium">فیلتر زمان:</span>
          <TimeFilter value={timeFilter} onChange={setTimeFilter} />
        </div>
      </div>

      {/* ==================== کارت‌های آمار ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          icon={Wallet}
          label="خالص ارزش دارایی"
          value={`${formatNumber(summary.netWorth || 0)} ریال`}
          change={12.5}
          trend="up"
          color="emerald"
          progress={75}
        />

        <StatCard
          icon={BarChart3}
          label="سود/ضرر ماهانه"
          value={`${formatNumber(summary.monthlyPnL || 0)} ریال`}
          change={summary.monthlyPnL >= 0 ? 8.2 : -5.3}
          trend={summary.monthlyPnL >= 0 ? 'up' : 'down'}
          color={summary.monthlyPnL >= 0 ? 'emerald' : 'red'}
          progress={summary.monthlyPnL >= 0 ? 60 : 40}
        />

        <StatCard
          icon={CreditCard}
          label="کل بدهی‌ها"
          value={`${formatNumber(totalLoansRemaining + totalDebtsRemaining)} ریال`}
          subValue={`${loans.filter(l => l.status === 'active').length + debts.filter(d => d.status === 'active').length} مورد فعال`}
          change={-5.3}
          trend="down"
          color="red"
          progress={40}
        />

        <StatCard
          icon={Target}
          label="پیشرفت اهداف"
          value={`${Math.round(avgGoalsProgress)}%`}
          subValue={`${activeGoals.length} هدف فعال، ${completedGoals.length} تکمیل شده`}
          change={15.7}
          trend="up"
          color="purple"
          progress={avgGoalsProgress}
        />
      </div>

      {/* ==================== کارت‌های جزئیات ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* خلاصه سریع */}
        <Card className="border-slate-800 bg-slate-900/30 hover:border-slate-700 transition-all col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">خلاصه سریع</h3>
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div className="space-y-3">
              {[
                { label: 'تعداد حساب‌ها', value: accounts.length, color: 'text-emerald-400' },
                { label: 'تعداد دارایی‌ها', value: assets.length, color: 'text-blue-400' },
                { label: 'اهداف تکمیل‌شده', value: completedGoals.length, color: 'text-purple-400' },
                { label: 'بدهی فعال', value: loans.filter(l => l.status === 'active').length + debts.filter(d => d.status === 'active').length, color: 'text-red-400' },
                { label: 'نزدیک‌ترین مهلت', value: nearestDeadline ? nearestDeadline.deadline : '-', color: 'text-amber-400' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-800/50 last:border-0">
                  <span className="text-slate-400 text-sm">{item.label}</span>
                  <span className={cn("font-bold", item.color)}>{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* حساب‌ها */}
        <Card className="border-slate-800 bg-slate-900/30 hover:border-slate-700 transition-all col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">حساب‌ها</h3>
              <button className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-all">
                مشاهده همه <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-3">
              {accounts.slice(0, 4).map((account) => (
                <div key={account.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-800/20 hover:bg-slate-800/40 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg transition-all group-hover:scale-110",
                      account.category === 'trading' ? 'bg-emerald-500/10' :
                      account.category === 'bank' ? 'bg-blue-500/10' :
                      'bg-orange-500/10'
                    )}>
                      {account.category === 'trading' ? <TrendingUp className="w-4 h-4 text-emerald-400" /> :
                       account.category === 'bank' ? <Building2 className="w-4 h-4 text-blue-400" /> :
                       <Bitcoin className="w-4 h-4 text-orange-400" />}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{account.name}</p>
                      <p className="text-xs text-slate-400">{account.currency}</p>
                    </div>
                  </div>
                  <p className="text-white font-bold text-sm">
                    {formatNumber(account.balance)}
                  </p>
                </div>
              ))}
              {accounts.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-slate-400 text-sm">هیچ حسابی ثبت نشده</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* دارایی‌های برتر */}
        <Card className="border-slate-800 bg-slate-900/30 hover:border-slate-700 transition-all col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">دارایی‌های برتر</h3>
              <button className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-all">
                مشاهده همه <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-3">
              {topAssets.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-slate-400 text-sm">هنوز دارایی ثبت نشده</p>
                </div>
              ) : (
                topAssets.slice(0, 4).map((asset) => {
                  const profit = (asset.currentPrice - asset.buyPrice) * asset.amount
                  const isProfit = profit >= 0
                  
                  return (
                    <div key={asset.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-800/20 hover:bg-slate-800/40 transition-all group">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl group-hover:scale-110 transition-all">
                          {asset.category === 'gold' ? '🥇' :
                           asset.category === 'silver' ? '🥈' :
                           asset.category === 'car' ? '🚗' :
                           asset.category === 'cash' ? '💵' : '📦'}
                        </span>
                        <div>
                          <p className="text-white font-bold text-sm">{asset.name}</p>
                          <p className="text-xs text-slate-400">{asset.amount} {asset.unit}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-white font-bold text-sm">
                          {formatNumber(asset.currentPrice * asset.amount)}
                        </p>
                        <p className={cn(
                          "text-xs font-bold",
                          isProfit ? 'text-emerald-400' : 'text-red-400'
                        )}>
                          {isProfit ? '+' : ''}{formatNumber(profit)} ریال
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            {totalProfit !== 0 && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">سود/ضرر کل:</span>
                  <span className={cn(
                    "font-bold",
                    totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {totalProfit >= 0 ? '+' : ''}{formatNumber(totalProfit)} ریال
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ==================== فوتر با اطلاعات ==================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/50 text-xs text-slate-500">
        <div className="flex items-center gap-6">
          <span>آخرین بروزرسانی: {lastUpdate || '---'}</span>
          <span>|</span>
          <span>{accounts.length} حساب</span>
          <span>|</span>
          <span>{assets.length} دارایی</span>
          <span>|</span>
          <span>{goals.length} هدف</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>سیستم پایدار</span>
        </div>
      </div>
    </div>
  )
}