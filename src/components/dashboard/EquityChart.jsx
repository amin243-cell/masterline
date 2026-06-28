import { Card, CardContent } from "../ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { month: 'فروردین', value: 15000 },
  { month: 'اردیبهشت', value: 16500 },
  { month: 'خرداد', value: 18200 },
  { month: 'تیر', value: 17800 },
  { month: 'مرداد', value: 20100 },
  { month: 'شهریور', value: 22500 },
  { month: 'مهر', value: 24856 },
]

export function EquityChart() {
  return (
    <Card className="glass-card animate-fade-in-up opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
      <CardContent className="p-6">
        {/* هدر نمودار */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">نمودار رشد سرمایه</h3>
            <p className="text-xs text-slate-400 mt-1">روند ۷ ماه گذشته</p>
          </div>
          <div className="flex gap-2">
            {['1W', '1M', '3M', '1Y', 'ALL'].map((period, i) => (
              <button
                key={period}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  i === 4 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* نمودار */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
                }}
                formatter={(value) => [`$${value.toLocaleString()}`, 'ارزش کل']}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                strokeWidth={3}
                fill="url(#colorValue)"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}