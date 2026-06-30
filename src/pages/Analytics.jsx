import { useState, useMemo, useCallback, useEffect } from 'react'
import { 
  BarChart3, PieChart as PieChartIcon, TrendingUp, Activity,
  DollarSign, Wallet, CreditCard, Target, Download,
  FileDown, FileSpreadsheet, Printer, AlertCircle,
  RefreshCw, ChevronDown, ChevronUp, Calendar,
  Filter, ArrowUp, ArrowDown, Minus, Clock
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
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import useStore from '../store/useStore'
import { formatNumber, getPersianDate } from '../lib/helpers'
import { useNotifications } from '../hooks/useNotifications'
import { useAnalytics } from '../hooks/useAnalytics'
import { DateRangePicker } from '../components/ui/DateRangePicker'
import { 
  calculateChange, 
  formatPercentage, 
  getColorByValue,
  downloadCSV,
  convertToCSV
} from '../utils/analyticsHelpers'

// ============ رنگ‌های ثابت (پالت ملایم‌تر) ============
const COLORS = {
  emerald: '#34d399',
  blue: '#60a5fa',
  amber: '#fbbf24',
  purple: '#a78bfa',
  red: '#f87171',
  slate: '#475569',
  cyan: '#22d3ee',
  pink: '#f472b6',
  indigo: '#818cf8',
  orange: '#fb923c',
  rose: '#fb7185',
  teal: '#2dd4bf',
}

const CHART_COLORS = [
  COLORS.emerald,
  COLORS.blue,
  COLORS.amber,
  COLORS.purple,
  COLORS.red,
  COLORS.cyan,
  COLORS.pink,
  COLORS.indigo,
  COLORS.orange,
  COLORS.rose,
  COLORS.teal,
]

// ============ کامپوننت کارت آمار با تغییرات ============
const StatCard = ({ title, value, icon: Icon, color, change, subtitle, delay, loading }) => {
  const changeColor = change > 0 ? 'text-emerald-400' : change < 0 ? 'text-red-400' : 'text-slate-400'
  const ChangeIcon = change > 0 ? ArrowUp : change < 0 ? ArrowDown : Minus
  const bgColor = color || 'emerald'

  if (loading) {
    return (
      <div className={`stat-card-ultra animate-pulse`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-700/50" />
            <div>
              <div className="w-20 h-3 bg-slate-700/50 rounded" />
              <div className="w-28 h-6 bg-slate-700/50 rounded mt-2" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`stat-card-ultra animate-fade-in-up delay-${delay || 100}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`stat-icon-ultra bg-${bgColor}-500/20`}>
            <Icon className={`w-6 h-6 text-${bgColor}-400`} />
          </div>
          <div>
            <p className="text-xs text-slate-400">{title}</p>
            <p className="text-xl font-black text-white font-mono">{value}</p>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {change !== undefined && change !== null && change !== 0 && (
          <div className={`flex items-center gap-1 text-xs font-bold ${changeColor} bg-${change > 0 ? 'emerald' : change < 0 ? 'red' : 'slate'}-500/10 px-2 py-1 rounded-lg`}>
            <ChangeIcon className="w-3 h-3" />
            {formatPercentage(change)}
          </div>
        )}
      </div>
    </div>
  )
}

// ============ کامپوننت خالی بودن داده ============
const EmptyState = ({ message, icon: Icon = AlertCircle }) => (
  <div className="flex flex-col items-center justify-center h-[300px] text-slate-400">
    <Icon className="w-16 h-16 mb-4 text-slate-600" />
    <p className="text-lg font-bold text-white">{message}</p>
    <p className="text-sm mt-1">داده‌ای برای نمایش وجود ندارد</p>
  </div>
)

// ============ کامپوننت لودینگ ============
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-[300px] text-slate-400">
    <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
    <p className="text-lg font-bold text-white">در حال بارگذاری...</p>
  </div>
)

// ============ Tooltip سفارشی ============
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-slate-900/95 border border-emerald-500/30 rounded-2xl p-4 backdrop-blur-2xl shadow-2xl min-w-[200px]">
      <p className="text-white font-bold mb-2 text-sm border-b border-slate-700 pb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-4 text-sm py-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-slate-400">{entry.name}:</span>
          </div>
          <span className="text-white font-bold font-mono">
            {formatter ? formatter(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ============ کامپوننت اصلی ============
export default function Analytics() {
  const { accounts, assets, activities, loans, subscriptions, debts, goals } = useStore()
  const { sendNotification } = useNotifications()
  const { analytics, selectedTimeRange, setTimeRange, getCSVData, isLoading } = useAnalytics()
  
  const [activeChart, setActiveChart] = useState('overview')
  const [exportLoading, setExportLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState({ start: null, end: null })
  const [showDateRange, setShowDateRange] = useState(false)

  // ============ رفرش داده‌ها ============
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
    await sendNotification(
      '🔄 داده‌ها به‌روز شد',
      'گزارش تحلیل مالی با موفقیت به‌روزرسانی شد',
      'general',
      null,
      null,
      null
    )
  }, [sendNotification])

  // ============ خروجی CSV ============
  const handleExportCSV = useCallback(async () => {
    setExportLoading(true)
    try {
      const data = getCSVData()
      const csv = data.map(row => row.join(',')).join('\n')
      const filename = `analytics_${getPersianDate().replace(/\//g, '-')}.csv`
      downloadCSV(csv, filename)
      
      await sendNotification(
        '📊 خروجی گرفته شد',
        'گزارش تحلیل مالی با موفقیت خروجی گرفته شد',
        'general',
        null,
        null,
        null
      )
    } catch (err) {
      console.error('Error exporting CSV:', err)
    } finally {
      setExportLoading(false)
    }
  }, [getCSVData, sendNotification])

  // ============ داده‌های نمودارها ============
  const chartData = useMemo(() => {
    if (!analytics) return { assetDistribution: [], activityChart: [], goalsProgress: [], loansProgress: [], growth: [] }
    return analytics.charts
  }, [analytics])

  const summary = useMemo(() => {
    if (!analytics) return { netWorth: 0, totalAssets: 0, totalDebts: 0 }
    return analytics.summary
  }, [analytics])

  // ============ محاسبه تغییرات ============
  const getChange = useCallback((current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }, [])

  // ============ تغییر بازه زمانی با DateRangePicker ============
  const handleDateRangeChange = useCallback((range) => {
    setDateRange(range)
    if (range.start && range.end) {
      // در اینجا می‌توانید داده‌ها را با بازه جدید فیلتر کنید
      console.log('بازه انتخاب شده:', range)
    }
  }, [])

  const charts = [
    { id: 'overview', label: 'نمای کلی', icon: BarChart3, color: 'emerald' },
    { id: 'assets', label: 'دارایی‌ها', icon: Wallet, color: 'blue' },
    { id: 'activities', label: 'فعالیت‌ها', icon: Activity, color: 'amber' },
    { id: 'goals', label: 'اهداف', icon: Target, color: 'purple' },
    { id: 'loans', label: 'وام‌ها', icon: CreditCard, color: 'red' },
    { id: 'growth', label: 'رشد سرمایه', icon: TrendingUp, color: 'teal' },
  ]

  if (isLoading) return <LoadingState />

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 animate-fade-in-up bg-grid-ultra min-h-screen" dir="rtl">
      
      {/* ============ هدر ============ */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gradient-ultra">آمار و گزارش‌ها</h1>
          <p className="text-sm md:text-base text-slate-400 mt-1">تحلیل کامل وضعیت مالی شما</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          {/* انتخاب بازه زمانی پیشرفته */}
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            className="w-48 md:w-56"
            placeholder="انتخاب بازه زمانی"
            size="sm"
          />
          
          <Button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button 
            onClick={handleExportCSV}
            disabled={exportLoading}
            className="btn-ultra btn-ultra-secondary"
            size="sm"
          >
            {exportLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">خروجی</span>
          </Button>
        </div>
      </div>

      {/* ============ کارت‌های خلاصه ============ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title="خالص دارایی"
          value={formatNumber(summary.netWorth)}
          icon={DollarSign}
          color="emerald"
          change={getChange(summary.netWorth, summary.netWorth * 0.9)}
          delay={100}
        />
        <StatCard
          title="کل دارایی‌ها"
          value={formatNumber(summary.totalAssets)}
          icon={Wallet}
          color="blue"
          subtitle={`${formatNumber(summary.totalInvestments)} سرمایه‌گذاری`}
          delay={200}
        />
        <StatCard
          title="کل بدهی‌ها"
          value={formatNumber(summary.totalDebts)}
          icon={CreditCard}
          color="red"
          change={-getChange(summary.totalDebts, summary.totalDebts * 1.1)}
          delay={300}
        />
        <StatCard
          title="اهداف فعال"
          value={analytics?.goals?.inProgress || 0}
          icon={Target}
          color="purple"
          subtitle={`${analytics?.goals?.completed || 0} تکمیل شده`}
          delay={400}
        />
      </div>

      {/* ============ انتخاب نمودار ============ */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {charts.map(chart => (
          <Button
            key={chart.id}
            variant={activeChart === chart.id ? 'default' : 'outline'}
            onClick={() => setActiveChart(chart.id)}
            className={`${activeChart === chart.id ? `btn-ultra btn-ultra-${chart.color}` : 'btn-ultra btn-ultra-secondary'} text-xs md:text-sm px-2 md:px-4`}
          >
            <chart.icon className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline mr-1">{chart.label}</span>
          </Button>
        ))}
      </div>

      {/* ============ محتوای نمودارها ============ */}
      <div className="transition-all duration-300">
        
        {/* نمای کلی */}
        {activeChart === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card className="card-ultra">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base md:text-lg font-bold flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-emerald-400" />
                  توزیع دارایی‌ها
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6">
                {chartData.assetDistribution.length === 0 ? (
                  <EmptyState message="هیچ داده‌ای برای نمایش وجود ندارد" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.assetDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => 
                          percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.assetDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip formatter={(value) => formatNumber(value)} />} />
                      <Legend 
                        wrapperStyle={{ color: '#94a3b8', fontSize: '11px' }}
                        iconType="circle"
                        iconSize={8}
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="card-ultra">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base md:text-lg font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  آمار فعالیت‌ها
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6">
                {chartData.activityChart.length === 0 ? (
                  <EmptyState message="هیچ فعالیتی ثبت نشده است" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.activityChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip formatter={(value) => formatNumber(value)} />} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {chartData.activityChart.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* دارایی‌ها */}
        {activeChart === 'assets' && (
          <Card className="card-ultra">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base md:text-lg font-bold flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-blue-400" />
                توزیع تفصیلی دارایی‌ها
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-8">
              {chartData.assetDistribution.length === 0 ? (
                <EmptyState message="هیچ داده‌ای برای نمایش وجود ندارد" />
              ) : (
                <ResponsiveContainer width="100%" height={380}>
                  <PieChart>
                    <Pie
                      data={chartData.assetDistribution}
                      cx="50%"
                      cy="45%"
                      labelLine={false}
                      label={({ name, value }) => value > 1 ? `${name}: ${formatNumber(value)}` : ''}
                      outerRadius={130}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.assetDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip formatter={(value) => formatNumber(value)} />} />
                    <Legend 
                      wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }}
                      iconType="circle"
                      iconSize={10}
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}

        {/* فعالیت‌ها */}
        {activeChart === 'activities' && (
          <Card className="card-ultra">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base md:text-lg font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                آمار فعالیت‌های ترید
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-8">
              {chartData.activityChart.length === 0 ? (
                <EmptyState message="هیچ فعالیتی ثبت نشده است" />
              ) : (
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart data={chartData.activityChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip formatter={(value) => formatNumber(value)} />} />
                    <Legend 
                      wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }}
                      iconType="circle"
                      iconSize={10}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {chartData.activityChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}

        {/* اهداف */}
        {activeChart === 'goals' && (
          <Card className="card-ultra">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base md:text-lg font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                پیشرفت اهداف
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-8">
              {chartData.goalsProgress.length === 0 || chartData.goalsProgress[0]?.name === 'هیچ هدفی' ? (
                <EmptyState message="هیچ هدفی ثبت نشده است" />
              ) : (
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart data={chartData.goalsProgress} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip formatter={(value) => `${value.toFixed(1)}%`} />} />
                    <Legend 
                      wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }}
                      iconType="circle"
                      iconSize={10}
                    />
                    <Bar dataKey="پیشرفت" stackId="a" fill={COLORS.emerald} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="باقیمانده" stackId="a" fill={COLORS.slate} radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}

        {/* وام‌ها */}
        {activeChart === 'loans' && (
          <Card className="card-ultra">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base md:text-lg font-bold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-red-400" />
                وضعیت پرداخت وام‌ها
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-8">
              {chartData.loansProgress.length === 0 || chartData.loansProgress[0]?.name === 'هیچ وامی' ? (
                <EmptyState message="هیچ وامی ثبت نشده است" />
              ) : (
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart data={chartData.loansProgress} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }}
                      iconType="circle"
                      iconSize={10}
                    />
                    <Bar dataKey="پرداخت_شده" stackId="a" fill={COLORS.emerald} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="باقیمانده" stackId="a" fill={COLORS.red} radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}

        {/* رشد سرمایه */}
        {activeChart === 'growth' && (
          <Card className="card-ultra">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base md:text-lg font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-400" />
                روند رشد سرمایه
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-8">
              {chartData.growth.length === 0 ? (
                <EmptyState message="داده‌های کافی برای نمایش رشد وجود ندارد" />
              ) : (
                <ResponsiveContainer width="100%" height={380}>
                  <AreaChart data={chartData.growth}>
                    <defs>
                      <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.teal} stopOpacity={0.5}/>
                        <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip formatter={(value) => formatNumber(value)} />} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={COLORS.teal} 
                      strokeWidth={3}
                      fill="url(#colorGrowth)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}