import { Wallet, TrendingUp, CreditCard, PieChart, ArrowUpRight, Bitcoin, Building2, TrendingDown } from 'lucide-react'
import { EquityChart } from '../components/dashboard/EquityChart'
import { Card, CardContent } from '../components/ui/card'
import useStore from '../store/useStore'
import { formatNumber } from '../lib/helpers'

export default function Dashboard() {
  const { summary, accounts, assets } = useStore()

  // محاسبه ارزش کل دارایی‌های فیزیکی
  const totalAssetsValue = assets.reduce((sum, a) => sum + (a.currentPrice * a.amount), 0)

  // گرفتن ۵ دارایی برتر بر اساس ارزش فعلی
  const topAssets = [...assets]
    .sort((a, b) => (b.currentPrice * b.amount) - (a.currentPrice * a.amount))
    .slice(0, 5)

  // محاسبه سود/ضرر کل دارایی‌ها
  const totalProfit = assets.reduce((sum, a) => {
    return sum + ((a.currentPrice - a.buyPrice) * a.amount)
  }, 0)

  return (
    <div className="p-8 space-y-8 animate-fade-in-up" dir="rtl">
      {/* هدر صفحه فوق حرفه‌ای */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gradient-ultra">داشبورد</h1>
          <p className="text-base text-slate-400 mt-3">نمای کلی وضعیت مالی شما</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 glow-green-ultra">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse-glow" />
          <span className="text-sm font-bold text-emerald-400">آنلاین</span>
        </div>
      </div>

      {/* کارت‌های آمار فوق حرفه‌ای */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* خالص ارزش دارایی */}
        <div className="stat-card-ultra animate-fade-in-up delay-100">
          <div className="flex items-start justify-between mb-4">
            <div className="stat-icon-ultra bg-emerald-500/20">
              <Wallet className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="badge-ultra badge-success-ultra">
              <TrendingUp className="w-3 h-3" />
              12.5%
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-2">خالص ارزش دارایی</p>
          <p className="text-3xl font-black text-gradient-ultra">
            ${formatNumber(summary.netWorth)}
          </p>
          <div className="mt-4 h-1 rounded-full bg-emerald-500/20 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: '75%' }} />
          </div>
        </div>

        {/* سود/ضرر ماهانه */}
        <div className="stat-card-ultra animate-fade-in-up delay-200">
          <div className="flex items-start justify-between mb-4">
            <div className="stat-icon-ultra bg-emerald-500/20">
              <TrendingUp className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="badge-ultra badge-success-ultra">
              <TrendingUp className="w-3 h-3" />
              8.2%
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-2">سود/ضرر ماهانه</p>
          <p className="text-3xl font-black text-gradient-ultra">
            ${formatNumber(summary.monthlyPnL)}
          </p>
          <div className="mt-4 h-1 rounded-full bg-emerald-500/20 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: '60%' }} />
          </div>
        </div>

        {/* کل بدهی‌ها */}
        <div className="stat-card-ultra animate-fade-in-up delay-300">
          <div className="flex items-start justify-between mb-4">
            <div className="stat-icon-ultra bg-red-500/20">
              <CreditCard className="w-7 h-7 text-red-400" />
            </div>
            <div className="badge-ultra badge-danger-ultra">
              <TrendingDown className="w-3 h-3" />
              5.3%
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-2">کل بدهی‌ها</p>
          <p className="text-3xl font-black text-gradient-danger">
            {formatNumber(summary.totalDebts)}
          </p>
          <div className="mt-4 h-1 rounded-full bg-red-500/20 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full" style={{ width: '40%' }} />
          </div>
        </div>

        {/* ارزش دارایی‌های فیزیکی */}
        <div className="stat-card-ultra animate-fade-in-up delay-400">
          <div className="flex items-start justify-between mb-4">
            <div className="stat-icon-ultra bg-purple-500/20">
              <PieChart className="w-7 h-7 text-purple-400" />
            </div>
            <div className="badge-ultra badge-info-ultra">
              <TrendingUp className="w-3 h-3" />
              15.7%
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-2">ارزش دارایی‌های فیزیکی</p>
          <p className="text-3xl font-black text-gradient-blue">
            {formatNumber(totalAssetsValue)}
          </p>
          <div className="mt-4 h-1 rounded-full bg-purple-500/20 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full" style={{ width: '85%' }} />
          </div>
        </div>
      </div>

      {/* نمودار رشد سرمایه */}
      <Card className="card-ultra animate-fade-in-up delay-500">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white">نمودار رشد سرمایه</h3>
              <p className="text-sm text-slate-400 mt-2">روند ۷ ماه گذشته</p>
            </div>
            <div className="flex gap-3">
              {['1W', '1M', '3M', '1Y', 'ALL'].map((period, i) => (
                <button
                  key={period}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    i === 4 
                      ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 glow-green-ultra' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <EquityChart />
        </CardContent>
      </Card>

      {/* لیست دارایی‌ها */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* حساب‌ها */}
        <Card className="card-ultra animate-fade-in-up delay-700">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">حساب‌ها</h3>
              <button className="text-sm font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-2 transition-all duration-300 hover:gap-3">
                مشاهده همه <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {accounts.slice(0, 5).map((account, index) => (
                <div 
                  key={account.id} 
                  className="item-card-ultra flex justify-between items-center p-5 cursor-pointer"
                  style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`stat-icon-ultra ${
                      account.category === 'trading' ? 'bg-emerald-500/20' :
                      account.category === 'bank' ? 'bg-blue-500/20' :
                      'bg-orange-500/20'
                    }`}>
                      {account.category === 'trading' ? <TrendingUp className="w-6 h-6 text-emerald-400" /> :
                       account.category === 'bank' ? <Building2 className="w-6 h-6 text-blue-400" /> :
                       <Bitcoin className="w-6 h-6 text-orange-400" />}
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">{account.name}</p>
                      <p className="text-sm text-slate-400 mt-1">
                        {account.category === 'trading' ? 'حساب ترید' : 
                         account.category === 'bank' ? 'حساب بانکی' : 'کیف پول کریپتو'}
                      </p>
                    </div>
                  </div>
                  <p className="text-white font-black text-xl font-mono">
                    {formatNumber(account.balance)} <span className="text-sm text-slate-400">{account.currency}</span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* دارایی‌های برتر */}
        <Card className="card-ultra animate-fade-in-up delay-1000">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">دارایی‌های برتر</h3>
              <button className="text-sm font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-2 transition-all duration-300 hover:gap-3">
                مشاهده همه <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {topAssets.length === 0 ? (
                <div className="empty-state-ultra py-12">
                  <p className="text-slate-500">هنوز دارایی ثبت نشده است</p>
                </div>
              ) : (
                topAssets.map((asset, index) => {
                  const profit = (asset.currentPrice - asset.buyPrice) * asset.amount
                  const isProfit = profit >= 0
                  
                  return (
                    <div 
                      key={asset.id} 
                      className="item-card-ultra flex justify-between items-center p-5 cursor-pointer"
                      style={{ animationDelay: `${0.9 + index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">
                          {asset.category === 'gold' ? '🥇' :
                           asset.category === 'silver' ? '🥈' :
                           asset.category === 'car' ? '🚗' :
                           asset.category === 'realEstate' ? '' :
                           asset.category === 'cash' ? '💵' : '📦'}
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">{asset.name}</p>
                          <p className="text-sm text-slate-400 mt-1">{asset.amount} {asset.unit}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-white font-black text-xl font-mono">
                          {formatNumber(asset.currentPrice * asset.amount)}
                        </p>
                        <p className={`text-sm font-bold font-mono mt-1 ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isProfit ? '+' : ''}{formatNumber(profit)} ریال
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            {totalProfit !== 0 && (
              <div className="mt-6 pt-6 border-t-2 border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">سود/ضرر کل دارایی‌ها:</span>
                  <span className={`font-black text-2xl font-mono ${totalProfit >= 0 ? 'text-gradient-ultra' : 'text-gradient-danger'}`}>
                    {totalProfit >= 0 ? '+' : ''}{formatNumber(totalProfit)} ریال
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}