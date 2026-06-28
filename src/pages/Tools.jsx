import { useState } from 'react'
import { 
  Calculator, TrendingUp, Target, DollarSign, 
  BarChart3, Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { formatNumber } from '../lib/helpers'

export default function Tools() {
  const [activeTool, setActiveTool] = useState('compound')

  const [compound, setCompound] = useState({
    initial: 10000,
    rate: 20,
    years: 5,
    compounds: 12
  })

  const calculateCompound = () => {
    const P = compound.initial
    const r = compound.rate / 100
    const n = compound.compounds
    const t = compound.years
    const A = P * Math.pow((1 + r / n), n * t)
    const profit = A - P
    return { final: A, profit, profitPercent: (profit / P) * 100 }
  }

  const [riskReward, setRiskReward] = useState({
    entry: 50000,
    stopLoss: 48000,
    takeProfit: 56000
  })

  const calculateRiskReward = () => {
    const risk = Math.abs(riskReward.entry - riskReward.stopLoss)
    const reward = Math.abs(riskReward.takeProfit - riskReward.entry)
    const ratio = risk > 0 ? reward / risk : 0
    return { risk, reward, ratio }
  }

  const [positionSizeState, setPositionSizeState] = useState({
    balance: 10000,
    riskPercent: 2,
    entry: 50000,
    stopLoss: 48000
  })

  const calculatePositionSize = () => {
    const riskAmount = positionSizeState.balance * (positionSizeState.riskPercent / 100)
    const stopDistance = Math.abs(positionSizeState.entry - positionSizeState.stopLoss)
    const size = stopDistance > 0 ? riskAmount / stopDistance : 0
    const value = size * positionSizeState.entry
    return { riskAmount, size, value }
  }

  const [pnl, setPnl] = useState({
    entry: 50000,
    exit: 55000,
    quantity: 0.5,
    direction: 'long'
  })

  const calculatePnL = () => {
    const priceDiff = pnl.direction === 'long' 
      ? pnl.exit - pnl.entry 
      : pnl.entry - pnl.exit
    const profit = priceDiff * pnl.quantity
    const profitPercent = pnl.entry > 0 ? (priceDiff / pnl.entry) * 100 : 0
    return { profit, profitPercent }
  }

  const [breakEven, setBreakEven] = useState({
    entry: 50000,
    fee: 0.1,
    leverage: 1,
    direction: 'long'
  })

  const calculateBreakEven = () => {
    const feeAmount = breakEven.entry * (breakEven.fee / 100) * 2
    const adjustedFee = feeAmount / breakEven.leverage
    const breakEvenPrice = breakEven.direction === 'long'
      ? breakEven.entry + adjustedFee
      : breakEven.entry - adjustedFee
    return { breakEvenPrice, totalFees: feeAmount }
  }

  const [fibonacci, setFibonacci] = useState({
    high: 60000,
    low: 40000,
    type: 'retracement'
  })

  const calculateFibonacci = () => {
    const diff = fibonacci.high - fibonacci.low
    const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]
    
    if (fibonacci.type === 'retracement') {
      return levels.map(level => ({
        level: (level * 100).toFixed(1),
        price: fibonacci.high - (diff * level)
      }))
    } else {
      return levels.map(level => ({
        level: (level * 100).toFixed(1),
        price: fibonacci.low + (diff * level)
      }))
    }
  }

  const tools = [
    { id: 'compound', label: 'سود مرکب', icon: TrendingUp },
    { id: 'riskReward', label: 'ریسک به ریوارد', icon: Target },
    { id: 'positionSize', label: 'اندازه پوزیشن', icon: BarChart3 },
    { id: 'pnl', label: 'سود/ضرر', icon: DollarSign },
    { id: 'breakEven', label: 'نقطه سربه‌سر', icon: Activity },
    { id: 'fibonacci', label: 'فیبوناچی', icon: Calculator },
  ]

  return (
    <div className="p-8 space-y-8 animate-fade-in-up bg-grid-ultra min-h-screen" dir="rtl">
      {/* هدر */}
      <div>
        <h1 className="text-4xl font-black text-gradient-ultra">ابزارهای تریدر</h1>
        <p className="text-base text-slate-400 mt-3">ماشین حساب‌های کاربردی برای معاملات</p>
      </div>

      {/* انتخاب ابزار */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {tools.map(tool => (
          <Button
            key={tool.id}
            variant={activeTool === tool.id ? 'default' : 'outline'}
            onClick={() => setActiveTool(tool.id)}
            className={activeTool === tool.id ? 'btn-ultra btn-ultra-primary' : 'btn-ultra btn-ultra-secondary'}
          >
            <tool.icon className="w-5 h-5" />
            {tool.label}
          </Button>
        ))}
      </div>

      {/* ماشین حساب سود مرکب */}
      {activeTool === 'compound' && (
        <Card className="card-ultra animate-fade-in-up delay-100">
          <CardHeader>
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              ماشین حساب سود مرکب
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-5">
                <div className="space-y-3">
                  <Label className="label-ultra">سرمایه اولیه (دلار)</Label>
                  <Input 
                    type="number"
                    value={compound.initial} 
                    onChange={(e) => setCompound({...compound, initial: parseFloat(e.target.value) || 0})} 
                    className="input-ultra font-mono" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="label-ultra">نرخ سود سالانه (%)</Label>
                  <Input 
                    type="number"
                    value={compound.rate} 
                    onChange={(e) => setCompound({...compound, rate: parseFloat(e.target.value) || 0})} 
                    className="input-ultra font-mono" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="label-ultra">مدت زمان (سال)</Label>
                  <Input 
                    type="number"
                    value={compound.years} 
                    onChange={(e) => setCompound({...compound, years: parseFloat(e.target.value) || 0})} 
                    className="input-ultra font-mono" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="label-ultra">تعداد ترکیب در سال</Label>
                  <Select value={compound.compounds.toString()} onValueChange={(v) => setCompound({...compound, compounds: parseInt(v)})}>
                    <SelectTrigger className="input-ultra"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                      <SelectItem value="1" className="text-white">سالانه (1)</SelectItem>
                      <SelectItem value="4" className="text-white">سه‌ماهه (4)</SelectItem>
                      <SelectItem value="12" className="text-white">ماهانه (12)</SelectItem>
                      <SelectItem value="365" className="text-white">روزانه (365)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-5">
                <div className="p-8 rounded-3xl bg-slate-800/50 border-2 border-slate-700">
                  <h3 className="text-slate-400 text-sm mb-5">نتایج</h3>
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs text-slate-400">مبلغ نهایی</p>
                      <p className="text-3xl font-black text-gradient-ultra font-mono">
                        ${formatNumber(calculateCompound().final.toFixed(2))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">سود کل</p>
                      <p className="text-2xl font-black text-white font-mono">
                        ${formatNumber(calculateCompound().profit.toFixed(2))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">درصد سود</p>
                      <p className="text-xl font-black text-gradient-ultra font-mono">
                        {calculateCompound().profitPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ماشین حساب ریسک به ریوارد */}
      {activeTool === 'riskReward' && (
        <Card className="card-ultra animate-fade-in-up delay-100">
          <CardHeader>
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6 text-emerald-400" />
              ماشین حساب ریسک به ریوارد
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-5">
                <div className="space-y-3">
                  <Label className="label-ultra">قیمت ورود</Label>
                  <Input 
                    type="number"
                    value={riskReward.entry} 
                    onChange={(e) => setRiskReward({...riskReward, entry: parseFloat(e.target.value) || 0})} 
                    className="input-ultra font-mono" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="label-ultra">حد ضرر (Stop Loss)</Label>
                  <Input 
                    type="number"
                    value={riskReward.stopLoss} 
                    onChange={(e) => setRiskReward({...riskReward, stopLoss: parseFloat(e.target.value) || 0})} 
                    className="input-ultra font-mono" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="label-ultra">حد سود (Take Profit)</Label>
                  <Input 
                    type="number"
                    value={riskReward.takeProfit} 
                    onChange={(e) => setRiskReward({...riskReward, takeProfit: parseFloat(e.target.value) || 0})} 
                    className="input-ultra font-mono" 
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div className="p-8 rounded-3xl bg-slate-800/50 border-2 border-slate-700">
                  <h3 className="text-slate-400 text-sm mb-5">نتایج</h3>
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs text-slate-400">نسبت ریسک به ریوارد</p>
                      <p className="text-4xl font-black text-gradient-ultra font-mono">
                        1:{calculateRiskReward().ratio.toFixed(2)}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400">مقدار ریسک</p>
                        <p className="text-xl font-black text-gradient-danger font-mono">
                          {formatNumber(calculateRiskReward().risk)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">مقدار ریوارد</p>
                        <p className="text-xl font-black text-gradient-ultra font-mono">
                          {formatNumber(calculateRiskReward().reward)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ماشین حساب اندازه پوزیشن */}
      {activeTool === 'positionSize' && (
        <Card className="card-ultra animate-fade-in-up delay-100">
          <CardHeader>
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
              ماشین حساب اندازه پوزیشن
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-5">
                <div className="space-y-3">
                  <Label className="label-ultra">موجودی حساب (دلار)</Label>
                  <Input 
                    type="number"
                    value={positionSizeState.balance} 
                    onChange={(e) => setPositionSizeState({...positionSizeState, balance: parseFloat(e.target.value) || 0})} 
                    className="input-ultra font-mono" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="label-ultra">درصد ریسک (%)</Label>
                  <Input 
                    type="number"
                    value={positionSizeState.riskPercent} 
                    onChange={(e) => setPositionSizeState({...positionSizeState, riskPercent: parseFloat(e.target.value) || 0})} 
                    className="input-ultra font-mono" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="label-ultra">قیمت ورود</Label>
                  <Input 
                    type="number"
                    value={positionSizeState.entry} 
                    onChange={(e) => setPositionSizeState({...positionSizeState, entry: parseFloat(e.target.value) || 0})} 
                    className="input-ultra font-mono" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="label-ultra">حد ضرر</Label>
                  <Input 
                    type="number"
                    value={positionSizeState.stopLoss} 
                    onChange={(e) => setPositionSizeState({...positionSizeState, stopLoss: parseFloat(e.target.value) || 0})} 
                    className="input-ultra font-mono" 
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div className="p-8 rounded-3xl bg-slate-800/50 border-2 border-slate-700">
                  <h3 className="text-slate-400 text-sm mb-5">نتایج</h3>
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs text-slate-400">مقدار ریسک</p>
                      <p className="text-2xl font-black text-gradient-danger font-mono">
                        ${formatNumber(calculatePositionSize().riskAmount.toFixed(2))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">اندازه پوزیشن</p>
                      <p className="text-3xl font-black text-gradient-ultra font-mono">
                        {formatNumber(calculatePositionSize().size.toFixed(4))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">ارزش پوزیشن</p>
                      <p className="text-xl font-black text-white font-mono">
                        ${formatNumber(calculatePositionSize().value.toFixed(2))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ماشین حساب سود/ضرر */}
      {activeTool === 'pnl' && (
        <Card className="card-ultra animate-fade-in-up delay-100">
          <CardHeader>
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-400" />
              ماشین حساب سود/ضرر
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-5">
                <div className="space-y-3">
                  <Label className="label-ultra">جهت معامله</Label>
                  <Select value={pnl.direction} onValueChange={(v) => setPnl({...pnl, direction: v})}>
                    <SelectTrigger className="input-ultra"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                      <SelectItem value="long" className="text-white">Long (خرید)</SelectItem>
                      <SelectItem value="short" className="text-white">Short (فروش)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="label-ultra">قیمت ورود</Label>
                  <Input 
                    type="number"
                    value={pnl.entry} 
                    onChange={(e) => setPnl({...pnl, entry: parseFloat(e.target.value) || 0})} 
                    className="input-ultra font-mono" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="label-ultra">قیمت خروج</Label>
                  <Input 
                    type="number"
                    value={pnl.exit} 
                    onChange={(e) => setPnl({...pnl, exit: parseFloat(e.target.value) || 0})} 
                    className="input-ultra font-mono" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="label-ultra">حجم (تعداد)</Label>
                  <Input 
                    type="number"
                    value={pnl.quantity} 
                    onChange={(e) => setPnl({...pnl, quantity: parseFloat(e.target.value) || 0})} 
                    className="input-ultra font-mono" 
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div className="p-8 rounded-3xl bg-slate-800/50 border-2 border-slate-700">
                  <h3 className="text-slate-400 text-sm mb-5">نتایج</h3>
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs text-slate-400">سود/ضرر</p>
                      <p className={`text-3xl font-black font-mono ${calculatePnL().profit >= 0 ? 'text-gradient-ultra' : 'text-gradient-danger'}`}>
                        {calculatePnL().profit >= 0 ? '+' : ''}${formatNumber(calculatePnL().profit.toFixed(2))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">درصد سود/ضرر</p>
                      <p className={`text-2xl font-black font-mono ${calculatePnL().profitPercent >= 0 ? 'text-gradient-ultra' : 'text-gradient-danger'}`}>
                        {calculatePnL().profitPercent >= 0 ? '+' : ''}{calculatePnL().profitPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ماشین حساب نقطه سربه‌سر */}
      {activeTool === 'breakEven' && (
        <Card className="card-ultra animate-fade-in-up delay-100">
          <CardHeader>
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-emerald-400" />
              ماشین حساب نقطه سربه‌سر
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-5">
                <div className="space-y-3">
                  <Label className="label-ultra">جهت معامله</Label>
                  <Select value={breakEven.direction} onValueChange={(v) => setBreakEven({...breakEven, direction: v})}>
                    <SelectTrigger className="input-ultra"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                      <SelectItem value="long" className="text-white">Long (خرید)</SelectItem>
                      <SelectItem value="short" className="text-white">Short (فروش)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="label-ultra">قیمت ورود</Label>
                  <Input 
                    type="number"
                    value={breakEven.entry} 
                    onChange={(e) => setBreakEven({...breakEven, entry: parseFloat(e.target.value) || 0})} 
                    className="input-ultra font-mono" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="label-ultra">کارمزد (%)</Label>
                  <Input 
                    type="number"
                    value={breakEven.fee} 
                    onChange={(e) => setBreakEven({...breakEven, fee: parseFloat(e.target.value) || 0})} 
                    className="input-ultra font-mono" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="label-ultra">لوریج</Label>
                  <Input 
                    type="number"
                    value={breakEven.leverage} 
                    onChange={(e) => setBreakEven({...breakEven, leverage: parseFloat(e.target.value) || 1})} 
                    className="input-ultra font-mono" 
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div className="p-8 rounded-3xl bg-slate-800/50 border-2 border-slate-700">
                  <h3 className="text-slate-400 text-sm mb-5">نتایج</h3>
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs text-slate-400">نقطه سربه‌سر</p>
                      <p className="text-3xl font-black font-mono" style={{ color: '#fbbf24' }}>
                        {formatNumber(calculateBreakEven().breakEvenPrice.toFixed(2))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">کل کارمزدها</p>
                      <p className="text-xl font-black text-white font-mono">
                        {formatNumber(calculateBreakEven().totalFees.toFixed(2))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ماشین حساب فیبوناچی */}
      {activeTool === 'fibonacci' && (
        <Card className="card-ultra animate-fade-in-up delay-100">
          <CardHeader>
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <Calculator className="w-6 h-6 text-emerald-400" />
              ماشین حساب فیبوناچی
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-5">
                <div className="space-y-3">
                  <Label className="label-ultra">نوع محاسبه</Label>
                  <Select value={fibonacci.type} onValueChange={(v) => setFibonacci({...fibonacci, type: v})}>
                    <SelectTrigger className="input-ultra"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                      <SelectItem value="retracement" className="text-white">اصلاحی (Retracement)</SelectItem>
                      <SelectItem value="extension" className="text-white">گسترشی (Extension)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="label-ultra">قیمت سقف (High)</Label>
                  <Input 
                    type="number"
                    value={fibonacci.high} 
                    onChange={(e) => setFibonacci({...fibonacci, high: parseFloat(e.target.value) || 0})} 
                    className="input-ultra font-mono" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="label-ultra">قیمت کف (Low)</Label>
                  <Input 
                    type="number"
                    value={fibonacci.low} 
                    onChange={(e) => setFibonacci({...fibonacci, low: parseFloat(e.target.value) || 0})} 
                    className="input-ultra font-mono" 
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div className="p-8 rounded-3xl bg-slate-800/50 border-2 border-slate-700">
                  <h3 className="text-slate-400 text-sm mb-5">سطوح فیبوناچی</h3>
                  <div className="space-y-2">
                    {calculateFibonacci().map((fib, index) => (
                      <div key={index} className="flex justify-between items-center p-3 rounded-2xl bg-slate-900/50 border border-slate-700">
                        <span className="text-slate-400 text-sm font-semibold">{fib.level}%</span>
                        <span className="text-white font-black font-mono">{formatNumber(fib.price.toFixed(2))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}