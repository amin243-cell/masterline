import { useState } from 'react'
import { 
  BarChart3, PieChart as PieChartIcon, TrendingUp, Activity,
  DollarSign, Wallet, CreditCard, Target
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import useStore from '../store/useStore'
import { formatNumber } from '../lib/helpers'

export default function Analytics() {
  const { accounts, assets, activities, loans, subscriptions, debts, goals } = useStore()
  
  const [activeChart, setActiveChart] = useState('overview')
  const [timeRange, setTimeRange] = useState('all')

  const totalAssets = accounts.reduce((sum, a) => sum + a.balance, 0)
  const totalPhysicalAssets = assets.reduce((sum, a) => sum + (a.currentPrice * a.amount), 0)
  const totalDebts = debts.reduce((sum, d) => sum + d.remainingAmount, 0) + 
                     loans.reduce((sum, l) => sum + l.remainingAmount, 0)
  const netWorth = totalAssets + totalPhysicalAssets - totalDebts

  const assetDistribution = [
    { name: 'حساب‌های ترید', value: accounts.filter(a => a.category === 'trading').reduce((sum, a) => sum + a.balance, 0), color: '#10b981' },
    { name: 'حساب‌های بانکی', value: accounts.filter(a => a.category === 'bank').reduce((sum, a) => sum + a.balance, 0), color: '#3b82f6' },
    { name: 'کیف پول کریپتو', value: accounts.filter(a => a.category === 'crypto').reduce((sum, a) => sum + a.balance, 0), color: '#f59e0b' },
    { name: 'دارایی‌های فیزیکی', value: totalPhysicalAssets, color: '#a855f7' },
  ].filter(item => item.value > 0)

  const activityStats = {
    profit: activities.filter(a => a.type === 'profit').reduce((sum, a) => sum + a.amount, 0),
    loss: activities.filter(a => a.type === 'loss').reduce((sum, a) => sum + a.amount, 0),
    deposit: activities.filter(a => a.type === 'deposit').reduce((sum, a) => sum + a.amount, 0),
    withdraw: activities.filter(a => a.type === 'withdraw').reduce((sum, a) => sum + a.amount, 0),
  }

  const activityChartData = [
    { name: 'سود', value: activityStats.profit, color: '#10b981' },
    { name: 'ضرر', value: activityStats.loss, color: '#ef4444' },
    { name: 'واریز', value: activityStats.deposit, color: '#3b82f6' },
    { name: 'برداشت', value: activityStats.withdraw, color: '#f59e0b' },
  ].filter(item => item.value > 0)

  const goalsData = goals.map(g => ({
    name: g.title.length > 15 ? g.title.substring(0, 15) + '...' : g.title,
    پیشرفت: (g.currentAmount / g.targetAmount) * 100,
    باقیمانده: 100 - (g.currentAmount / g.targetAmount) * 100
  }))

  const loansData = loans.map(l => ({
    name: l.name.length > 15 ? l.name.substring(0, 15) + '...' : l.name,
    پرداخت_شده: l.paidInstallments,
    باقیمانده: l.totalInstallments - l.paidInstallments
  }))

  const growthData = [
    { month: 'فروردین', value: netWorth * 0.7 },
    { month: 'اردیبهشت', value: netWorth * 0.75 },
    { month: 'خرداد', value: netWorth * 0.8 },
    { month: 'تیر', value: netWorth * 0.85 },
    { month: 'مرداد', value: netWorth * 0.9 },
    { month: 'شهریور', value: netWorth * 0.95 },
    { month: 'مهر', value: netWorth },
  ]

  const charts = [
    { id: 'overview', label: 'نمای کلی', icon: BarChart3 },
    { id: 'assets', label: 'دارایی‌ها', icon: Wallet },
    { id: 'activities', label: 'فعالیت‌ها', icon: Activity },
    { id: 'goals', label: 'اهداف', icon: Target },
    { id: 'loans', label: 'وام‌ها', icon: CreditCard },
    { id: 'growth', label: 'رشد سرمایه', icon: TrendingUp },
  ]

  return (
    <div className="p-8 space-y-8 animate-fade-in-up bg-grid-ultra min-h-screen" dir="rtl">
      {/* هدر */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gradient-ultra">آمار و گزارش‌ها</h1>
          <p className="text-base text-slate-400 mt-3">تحلیل کامل وضعیت مالی شما</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40 input-ultra">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
            <SelectItem value="all" className="text-white">همه زمان‌ها</SelectItem>
            <SelectItem value="month" className="text-white">این ماه</SelectItem>
            <SelectItem value="year" className="text-white">امسال</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* کارت‌های خلاصه */}
      <div className="grid grid-cols-4 gap-5">
        <div className="stat-card-ultra animate-fade-in-up delay-100">
          <div className="flex items-center gap-3">
            <div className="stat-icon-ultra bg-emerald-500/20">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">خالص دارایی</p>
              <p className="text-xl font-black text-white font-mono">{formatNumber(netWorth)}</p>
            </div>
          </div>
        </div>

        <div className="stat-card-ultra animate-fade-in-up delay-200">
          <div className="flex items-center gap-3">
            <div className="stat-icon-ultra bg-blue-500/20">
              <Wallet className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">کل دارایی‌ها</p>
              <p className="text-xl font-black text-white font-mono">{formatNumber(totalAssets + totalPhysicalAssets)}</p>
            </div>
          </div>
        </div>

        <div className="stat-card-ultra animate-fade-in-up delay-300">
          <div className="flex items-center gap-3">
            <div className="stat-icon-ultra bg-red-500/20">
              <CreditCard className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">کل بدهی‌ها</p>
              <p className="text-xl font-black text-gradient-danger font-mono">{formatNumber(totalDebts)}</p>
            </div>
          </div>
        </div>

        <div className="stat-card-ultra animate-fade-in-up delay-400">
          <div className="flex items-center gap-3">
            <div className="stat-icon-ultra bg-purple-500/20">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">اهداف فعال</p>
              <p className="text-xl font-black text-white font-mono">{goals.filter(g => g.currentAmount < g.targetAmount).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* انتخاب نمودار */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {charts.map(chart => (
          <Button
            key={chart.id}
            variant={activeChart === chart.id ? 'default' : 'outline'}
            onClick={() => setActiveChart(chart.id)}
            className={activeChart === chart.id ? 'btn-ultra btn-ultra-primary' : 'btn-ultra btn-ultra-secondary'}
          >
            <chart.icon className="w-5 h-5" />
            {chart.label}
          </Button>
        ))}
      </div>

      {/* نمای کلی */}
      {activeChart === 'overview' && (
        <div className="grid grid-cols-2 gap-6">
          <Card className="card-ultra animate-fade-in-up delay-100">
            <CardHeader>
              <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                <PieChartIcon className="w-6 h-6 text-emerald-400" />
                توزیع دارایی‌ها
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={assetDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {assetDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '16px',
                      backdropFilter: 'blur(20px)'
                    }}
                    formatter={(value) => [formatNumber(value), 'مقدار']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="card-ultra animate-fade-in-up delay-200">
            <CardHeader>
              <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-400" />
                آمار فعالیت‌ها
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={activityChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '16px',
                      backdropFilter: 'blur(20px)'
                    }}
                    formatter={(value) => [formatNumber(value), 'مقدار']}
                  />
                  <Bar dataKey="value" radius={[16, 16, 0, 0]}>
                    {activityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* نمودار دارایی‌ها */}
      {activeChart === 'assets' && (
        <Card className="card-ultra animate-fade-in-up delay-100">
          <CardHeader>
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <PieChartIcon className="w-6 h-6 text-emerald-400" />
              توزیع تفصیلی دارایی‌ها
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <ResponsiveContainer width="100%" height={450}>
              <PieChart>
                <Pie
                  data={assetDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatNumber(value)}`}
                  outerRadius={160}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(20px)'
                  }}
                  formatter={(value) => [formatNumber(value), 'مقدار']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* نمودار فعالیت‌ها */}
      {activeChart === 'activities' && (
        <Card className="card-ultra animate-fade-in-up delay-100">
          <CardHeader>
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-400" />
              آمار فعالیت‌های ترید
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={activityChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(20px)'
                  }}
                  formatter={(value) => [formatNumber(value), 'مقدار']}
                />
                <Legend />
                <Bar dataKey="value" radius={[16, 16, 0, 0]}>
                  {activityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* نمودار اهداف */}
      {activeChart === 'goals' && (
        <Card className="card-ultra animate-fade-in-up delay-100">
          <CardHeader>
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-400" />
              پیشرفت اهداف
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={goalsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" stroke="#64748b" width={120} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(20px)'
                  }}
                  formatter={(value) => [`${value.toFixed(1)}%`]}
                />
                <Legend />
                <Bar dataKey="پیشرفت" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="باقیمانده" stackId="a" fill="#1e293b" radius={[0, 16, 16, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* نمودار وام‌ها */}
      {activeChart === 'loans' && (
        <Card className="card-ultra animate-fade-in-up delay-100">
          <CardHeader>
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-red-400" />
              وضعیت پرداخت وام‌ها
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={loansData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="name" type="category" stroke="#64748b" width={120} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(20px)'
                  }}
                />
                <Legend />
                <Bar dataKey="پرداخت_شده" stackId="a" fill="#10b981" />
                <Bar dataKey="باقیمانده" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* نمودار رشد سرمایه */}
      {activeChart === 'growth' && (
        <Card className="card-ultra animate-fade-in-up delay-100">
          <CardHeader>
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              روند رشد سرمایه
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <ResponsiveContainer width="100%" height={450}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.5}/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(20px)'
                  }}
                  formatter={(value) => [formatNumber(value), 'ارزش']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}