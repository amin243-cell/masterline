import { Card, CardContent } from "../ui/card"
import { TrendingUp, TrendingDown } from 'lucide-react'

export function SummaryCard({ title, value, trend, icon: Icon, currency = "$", delay = "0" }) {
  const isPositive = trend >= 0

  return (
    <Card 
      className={`glass-card animate-fade-in-up opacity-0 hover:scale-[1.02] transition-all duration-300 cursor-pointer group`}
      style={{ animationDelay: `${delay}s`, animationFillMode: 'forwards' }}
    >
      <CardContent className="p-6">
        {/* آیکون با افکت */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10'} group-hover:scale-110 transition-transform duration-300`}>
            {Icon && <Icon className={`w-6 h-6 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`} />}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>

        {/* عنوان */}
        <p className="text-sm text-slate-400 mb-2">{title}</p>

        {/* مقدار */}
        <p className={`text-3xl font-bold ${isPositive ? 'text-gradient-green' : 'text-gradient-red'}`}>
          {currency}{typeof value === 'number' ? value.toLocaleString() : value}
        </p>

        {/* خط تزئینی پایین */}
        <div className={`mt-4 h-0.5 rounded-full ${isPositive ? 'bg-gradient-to-r from-emerald-500/50 to-transparent' : 'bg-gradient-to-r from-red-500/50 to-transparent'}`} />
      </CardContent>
    </Card>
  )
}