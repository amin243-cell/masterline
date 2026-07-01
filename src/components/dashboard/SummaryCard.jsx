import React, { useMemo } from 'react'
import { 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
} from 'lucide-react'
import { formatCurrency, formatPercentage } from '../../lib/helpers'
import { cn } from '../../lib/utils'
import { Skeleton } from '../ui/skeleton'

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  changeLabel,
  variant = 'default',
  loading = false,
  className,
  onClick,
  ...props 
}) => {
  const variants = {
    default: 'border-slate-800 bg-slate-900/50',
    success: 'border-emerald-500/30 bg-emerald-950/20',
    danger: 'border-red-500/30 bg-red-950/20',
    warning: 'border-amber-500/30 bg-amber-950/20',
    info: 'border-blue-500/30 bg-blue-950/20',
    purple: 'border-purple-500/30 bg-purple-950/20',
  }

  const iconVariants = {
    default: 'bg-slate-800/50 text-slate-400',
    success: 'bg-emerald-500/20 text-emerald-400',
    danger: 'bg-red-500/20 text-red-400',
    warning: 'bg-amber-500/20 text-amber-400',
    info: 'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
  }

  if (loading) {
    return (
      <div className={cn("p-6 rounded-2xl border", variants[variant], className)}>
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-2 w-full" />
      </div>
    )
  }

  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0
  const changeDisplay = change !== undefined ? formatPercentage(change) : null
  const changeIcon = isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : null

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-6 rounded-2xl border transition-all duration-300 cursor-pointer",
        variants[variant],
        "hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-500/30 hover:scale-[1.02]",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-xl", iconVariants[variant])}>
          <Icon className="w-6 h-6" />
        </div>
        {changeDisplay && (
          <div className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold",
            isPositive ? "bg-emerald-500/20 text-emerald-400" : 
            isNegative ? "bg-red-500/20 text-red-400" : 
            "bg-slate-800/50 text-slate-400"
          )}>
            {changeIcon && React.createElement(changeIcon, { className: "w-3 h-3" })}
            {changeDisplay}
          </div>
        )}
      </div>
      
      <p className="text-sm text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
      
      {changeLabel && (
        <p className="text-xs text-slate-500 mt-1">{changeLabel}</p>
      )}
      
      {'progress' in props && (
        <div className="mt-3 h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000"
            style={{ width: `${Math.min(props.progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}

export function SummaryCards({ 
  data, 
  loading = false, 
  className 
}) {
  const stats = useMemo(() => {
    if (!data || loading) return null

    const {
      netWorth = 0,
      monthlyPnL = 0,
      totalDebts = 0,
      totalAssets = 0,
      netWorthChange = 0,
      monthlyPnLChange = 0,
    } = data

    return {
      netWorth: {
        value: formatCurrency(netWorth, 'ریال'),
        change: netWorthChange,
        changeLabel: `نسبت به ماه قبل`,
        icon: Wallet,
        variant: 'success',
      },
      monthlyPnL: {
        value: formatCurrency(monthlyPnL, 'ریال'),
        change: monthlyPnLChange,
        changeLabel: `سود/زیان ماهانه`,
        icon: TrendingUp,
        variant: monthlyPnL >= 0 ? 'success' : 'danger',
      },
      debts: {
        value: formatCurrency(totalDebts, 'ریال'),
        change: null,
        changeLabel: `کل بدهی‌ها`,
        icon: CreditCard,
        variant: 'danger',
      },
      assets: {
        value: formatCurrency(totalAssets, 'ریال'),
        change: null,
        changeLabel: `کل دارایی‌ها`,
        icon: PieChart,
        variant: 'purple',
      },
    }
  }, [data, loading])

  if (loading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
        {[1, 2, 3, 4].map((i) => (
          <StatCard key={i} loading={true} variant="default" />
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center text-slate-400 py-8">
        داده‌ای برای نمایش وجود ندارد
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {Object.values(stats).map((stat, index) => (
        <StatCard
          key={index}
          icon={stat.icon}
          label={stat.changeLabel}
          value={stat.value}
          change={stat.change}
          changeLabel={stat.changeLabel}
          variant={stat.variant}
        />
      ))}
    </div>
  )
}

export default SummaryCards