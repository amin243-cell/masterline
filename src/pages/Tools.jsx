import { useState, useCallback, useMemo, useEffect } from 'react'
import { 
  Calculator, TrendingUp, Target, DollarSign, 
  BarChart3, Activity, Copy, Check, RotateCcw,
  Save, History, Trash2, AlertCircle, Share2,
  Download, LineChart, Zap, Star, Award,
  ChevronLeft, ChevronRight, Maximize2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { formatNumber } from '../lib/helpers'
import { useToast } from '../components/ui/toast'
import { useNotifications } from '../hooks/useNotifications'
import useStore from '../store/useStore'
import {
  LineChart as RechartsLine,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'

// ============ کامپوننت نمایش نتیجه ============
const ResultCard = ({ title, value, subValue, color = 'emerald', icon: Icon, onCopy, onSave, onShare, className }) => {
  const [copied, setCopied] = useState(false)
  const colorMap = {
    emerald: 'text-emerald-400 border-emerald-500/30',
    blue: 'text-blue-400 border-blue-500/30',
    purple: 'text-purple-400 border-purple-500/30',
    amber: 'text-amber-400 border-amber-500/30',
    rose: 'text-rose-400 border-rose-500/30',
    teal: 'text-teal-400 border-teal-500/30',
    red: 'text-red-400 border-red-500/30',
  }

  const handleCopy = () => {
    if (onCopy) {
      onCopy(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={`p-4 md:p-6 rounded-2xl bg-slate-800/30 border ${colorMap[color] || colorMap.emerald} backdrop-blur-sm transition-all hover:border-opacity-100 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`w-4 h-4 ${colorMap[color]?.split(' ')[0] || 'text-emerald-400'}`} />}
          <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          {onCopy && (
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-all hover:scale-110 text-slate-400 hover:text-white"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
          {onSave && (
            <button
              onClick={onSave}
              className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-all hover:scale-110 text-slate-400 hover:text-white"
            >
              <Save className="w-4 h-4" />
            </button>
          )}
          {onShare && (
            <button
              onClick={onShare}
              className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-all hover:scale-110 text-slate-400 hover:text-white"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <p className="text-2xl md:text-3xl font-black font-mono mt-2 text-white">
        {value}
      </p>
      {subValue && (
        <p className="text-xs md:text-sm text-slate-400 mt-1">{subValue}</p>
      )}
    </div>
  )
}

// ============ کامپوننت ورودی با لیبل ============
const InputField = ({ label, value, onChange, type = 'number', placeholder, icon: Icon, step = 'any', min, max }) => (
  <div className="space-y-1.5">
    <Label className="label-ultra flex items-center gap-2 text-xs md:text-sm">
      {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
      {label}
    </Label>
    <Input 
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      step={step}
      min={min}
      max={max}
      className="input-ultra font-mono h-10 md:h-11 text-sm" 
    />
  </div>
)

// ============ کامپوننت جدول قدم‌به‌قدم ============
const StepTable = ({ data, title, type = 'yearly' }) => {
  const [sortField, setSortField] = useState('سال')
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const sortedData = useMemo(() => {
    const sorted = [...data]
    const direction = sortDirection === 'asc' ? 1 : -1
    sorted.sort((a, b) => {
      const aVal = a[sortField] || 0
      const bVal = b[sortField] || 0
      return (aVal - bVal) * direction
    })
    return sorted
  }, [data, sortField, sortDirection])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sortedData.slice(start, start + itemsPerPage)
  }, [sortedData, currentPage])

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  if (data.length === 0) {
    return <p className="text-slate-400 text-center py-4">داده‌ای برای نمایش وجود ندارد</p>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>نمایش {paginatedData.length} از {data.length}</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700/50">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50">
            <tr>
              {Object.keys(data[0] || {}).map((key) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="px-3 py-2 text-right text-xs font-bold text-slate-400 cursor-pointer hover:text-white transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1 justify-end">
                    {key}
                    {sortField === key && (
                      <span className="text-emerald-400">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr key={index} className="border-t border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                {Object.entries(row).map(([key, value]) => (
                  <td key={key} className="px-3 py-2 text-right text-xs font-mono whitespace-nowrap">
                    {typeof value === 'number' ? (
                      key === 'درصد' ? (
                        <span className={value > 0 ? 'text-emerald-400' : value < 0 ? 'text-red-400' : 'text-slate-400'}>
                          {value.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-white">
                          {value.toLocaleString()}
                          {(key === 'سرمایه' || key === 'سود' || key === 'سرمایه‌گذاری کل' || key === 'سرمایه‌گذاری' || key === 'سود تجمعی') && ' $'}
                        </span>
                      )
                    ) : (
                      <span className="text-slate-300">{value}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="text-slate-400 hover:text-white h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <span className="text-xs text-slate-400 px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="text-slate-400 hover:text-white h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
          <span className="text-[10px] text-slate-500">
            {itemsPerPage} مورد در هر صفحه
          </span>
        </div>
      )}
    </div>
  )
}

// ============ ابزارها با آیکون و رنگ ============
const TOOLS = [
  { id: 'compound', label: 'سود مرکب', icon: TrendingUp, color: 'emerald', description: 'محاسبه رشد سرمایه با بهره مرکب' },
  { id: 'riskReward', label: 'ریسک به ریوارد', icon: Target, color: 'blue', description: 'محاسبه نسبت ریسک به سود' },
  { id: 'positionSize', label: 'اندازه پوزیشن', icon: BarChart3, color: 'purple', description: 'محاسبه حجم مناسب معامله' },
  { id: 'pnl', label: 'سود/ضرر', icon: DollarSign, color: 'amber', description: 'محاسبه سود و ضرر معامله' },
  { id: 'breakEven', label: 'نقطه سربه‌سر', icon: Activity, color: 'rose', description: 'محاسبه قیمت سربه‌سر' },
  { id: 'fibonacci', label: 'فیبوناچی', icon: Calculator, color: 'teal', description: 'محاسبه سطوح فیبوناچی' },
]

export default function Tools() {
  const [activeTool, setActiveTool] = useState('compound')
  const [copiedValue, setCopiedValue] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [showGrowthChart, setShowGrowthChart] = useState(false)
  const [compoundView, setCompoundView] = useState('chart')
  const { success, error } = useToast()
  const { sendNotification } = useNotifications()
  const { settings } = useStore()

  // ============ Stateهای هر ابزار ============
  const [compound, setCompound] = useState({
    initial: 10000,
    rate: 20,
    years: 5,
    compounds: 12,
    monthlyContribution: 0
  })

  const [riskReward, setRiskReward] = useState({
    entry: 50000,
    stopLoss: 48000,
    takeProfit: 56000
  })

  const [positionSizeState, setPositionSizeState] = useState({
    balance: 10000,
    riskPercent: 2,
    entry: 50000,
    stopLoss: 48000,
    leverage: 1
  })

  const [pnl, setPnl] = useState({
    entry: 50000,
    exit: 55000,
    quantity: 0.5,
    direction: 'long',
    fee: 0.1,
    leverage: 1
  })

  const [breakEven, setBreakEven] = useState({
    entry: 50000,
    fee: 0.1,
    leverage: 1,
    direction: 'long'
  })

  const [fibonacci, setFibonacci] = useState({
    high: 60000,
    low: 40000,
    type: 'retracement'
  })

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('toolHistory')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // ============ ذخیره تاریخچه در localStorage ============
  useEffect(() => {
    try {
      localStorage.setItem('toolHistory', JSON.stringify(history.slice(0, 20)))
    } catch (e) {
      console.error('Error saving history:', e)
    }
  }, [history])

  // ============ داده‌های قدم‌به‌قدم (سالانه) ============
  const getStepByStepData = useCallback(() => {
    const P = compound.initial
    const r = compound.rate / 100
    const t = compound.years
    const monthly = compound.monthlyContribution || 0
    
    const data = []
    const totalMonths = t * 12
    const monthlyRate = r / 12
    
    for (let year = 0; year <= t; year++) {
      const months = year * 12
      let value = P * Math.pow(1 + monthlyRate, months)
      let contributions = P
      
      if (monthly > 0) {
        for (let j = 1; j <= months; j++) {
          value += monthly * Math.pow(1 + monthlyRate, months - j + 1)
          contributions += monthly
        }
      }
      
      data.push({
        سال: year,
        سرمایه: Math.round(value),
        سود: Math.round(value - contributions),
        'سرمایه‌گذاری کل': Math.round(contributions),
        'سود تجمعی': Math.round(value - contributions),
        درصد: contributions > 0 ? ((value - contributions) / contributions * 100) : 0
      })
    }
    
    return data
  }, [compound])

  // ============ داده‌های ماهانه ============
  const getMonthlyData = useCallback(() => {
    const P = compound.initial
    const r = compound.rate / 100
    const t = compound.years
    const monthly = compound.monthlyContribution || 0
    
    const data = []
    const totalMonths = t * 12
    const monthlyRate = r / 12
    
    const step = Math.max(1, Math.floor(totalMonths / 24))
    
    for (let i = 0; i <= totalMonths; i += step) {
      if (i === 0) {
        data.push({
          ماه: 'شروع',
          سرمایه: P,
          سود: 0,
          'سرمایه‌گذاری': P,
          درصد: 0
        })
      } else {
        let value = P * Math.pow(1 + monthlyRate, i)
        let contributions = P
        
        if (monthly > 0) {
          for (let j = 1; j <= i; j++) {
            value += monthly * Math.pow(1 + monthlyRate, i - j + 1)
            contributions += monthly
          }
        }
        
        data.push({
          ماه: `${i} ماه`,
          سرمایه: Math.round(value),
          سود: Math.round(value - contributions),
          'سرمایه‌گذاری': Math.round(contributions),
          درصد: contributions > 0 ? ((value - contributions) / contributions * 100) : 0
        })
      }
    }
    
    return data
  }, [compound])

  // ============ توابع محاسباتی ============
  const calculateCompound = useCallback(() => {
    const P = compound.initial
    const r = compound.rate / 100
    const n = compound.compounds
    const t = compound.years
    const monthly = compound.monthlyContribution || 0
    
    let A = P * Math.pow((1 + r / n), n * t)
    let totalContributions = P
    
    if (monthly > 0) {
      const months = t * 12
      const monthlyRate = r / 12
      for (let i = 1; i <= months; i++) {
        A += monthly * Math.pow(1 + monthlyRate, months - i + 1)
        totalContributions += monthly
      }
    }
    
    const profit = A - totalContributions
    const profitPercent = totalContributions > 0 ? (profit / totalContributions) * 100 : 0
    
    const growthData = []
    let current = P
    const totalMonths2 = t * 12
    const monthlyRate2 = r / 12
    
    for (let i = 0; i <= totalMonths2; i += Math.max(1, Math.floor(totalMonths2 / 24))) {
      if (i === 0) {
        growthData.push({ month: 'شروع', value: P })
      } else {
        current = P * Math.pow(1 + monthlyRate2, i)
        if (compound.monthlyContribution > 0) {
          const months = i
          let withMonthly = P
          for (let j = 1; j <= months; j++) {
            withMonthly += compound.monthlyContribution * Math.pow(1 + monthlyRate2, months - j + 1)
          }
          current = withMonthly
        }
        growthData.push({ 
          month: `${i} ماه`, 
          value: Math.round(current),
          contribution: Math.round(P + (compound.monthlyContribution || 0) * i)
        })
      }
    }
    
    return { final: A, profit, profitPercent, growthData, totalContributions }
  }, [compound])

  const calculateRiskReward = useCallback(() => {
    const risk = Math.abs(riskReward.entry - riskReward.stopLoss)
    const reward = Math.abs(riskReward.takeProfit - riskReward.entry)
    const ratio = risk > 0 ? reward / risk : 0
    const maxLossPercent = (risk / riskReward.entry) * 100
    const maxProfitPercent = (reward / riskReward.entry) * 100
    return { risk, reward, ratio, maxLossPercent, maxProfitPercent }
  }, [riskReward])

  const calculatePositionSize = useCallback(() => {
    const riskAmount = positionSizeState.balance * (positionSizeState.riskPercent / 100)
    const stopDistance = Math.abs(positionSizeState.entry - positionSizeState.stopLoss)
    const baseSize = stopDistance > 0 ? riskAmount / stopDistance : 0
    const size = baseSize * positionSizeState.leverage
    const value = size * positionSizeState.entry
    const maxLoss = riskAmount * positionSizeState.leverage
    return { riskAmount, size, value, maxLoss, leverage: positionSizeState.leverage }
  }, [positionSizeState])

  const calculatePnL = useCallback(() => {
    const priceDiff = pnl.direction === 'long' 
      ? pnl.exit - pnl.entry 
      : pnl.entry - pnl.exit
    
    const feeAmount = (pnl.entry + pnl.exit) * pnl.quantity * (pnl.fee / 100)
    const leverageMultiplier = pnl.leverage || 1
    
    const profit = (priceDiff * pnl.quantity * leverageMultiplier) - feeAmount
    const profitPercent = pnl.entry > 0 ? (priceDiff / pnl.entry) * 100 * leverageMultiplier : 0
    
    return { profit, profitPercent, feeAmount, grossProfit: priceDiff * pnl.quantity * leverageMultiplier }
  }, [pnl])

  const calculateBreakEven = useCallback(() => {
    const feeAmount = breakEven.entry * (breakEven.fee / 100) * 2
    const adjustedFee = feeAmount / breakEven.leverage
    const breakEvenPrice = breakEven.direction === 'long'
      ? breakEven.entry + adjustedFee
      : breakEven.entry - adjustedFee
    
    const beZone = {
      min: breakEvenPrice * 0.98,
      max: breakEvenPrice * 1.02
    }
    
    return { breakEvenPrice, totalFees: feeAmount, beZone }
  }, [breakEven])

  const calculateFibonacci = useCallback(() => {
    const diff = fibonacci.high - fibonacci.low
    const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]
    const extendedLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.272, 1.618]
    
    const useLevels = fibonacci.type === 'retracement' ? levels : extendedLevels
    
    if (fibonacci.type === 'retracement') {
      return useLevels.map(level => ({
        level: (level * 100).toFixed(1),
        price: fibonacci.high - (diff * level),
        isKey: [0.382, 0.5, 0.618].includes(level)
      }))
    } else {
      return useLevels.map(level => ({
        level: (level * 100).toFixed(1),
        price: fibonacci.low + (diff * level),
        isKey: [0.382, 0.5, 0.618, 1.272, 1.618].includes(level)
      }))
    }
  }, [fibonacci])

  // ============ ذخیره نتیجه ============
  const saveResult = useCallback((toolName, result) => {
    const newEntry = {
      id: Date.now(),
      tool: toolName,
      result: typeof result === 'object' ? JSON.stringify(result) : result.toString(),
      timestamp: new Date().toLocaleString('fa-IR'),
      values: { ...compound, ...riskReward, ...positionSizeState, ...pnl, ...breakEven, ...fibonacci }
    }
    setHistory(prev => [newEntry, ...prev].slice(0, 20))
    success('✅ نتیجه با موفقیت ذخیره شد')
    
    sendNotification(
      '💾 نتیجه ذخیره شد',
      `نتیجه محاسبه ${toolName} ذخیره شد`,
      'general',
      null,
      null,
      null
    )
  }, [compound, riskReward, positionSizeState, pnl, breakEven, fibonacci, success, sendNotification])

  // ============ کپی کردن ============
  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text.toString())
      success('📋 متن کپی شد')
    } catch {
      success('📋 متن کپی شد')
    }
  }, [success])

  // ============ اشتراک‌گذاری ============
  const shareResult = useCallback((toolName, result) => {
    const text = `📊 نتیجه محاسبه ${toolName}:\n${result}`
    if (navigator.share) {
      navigator.share({ title: toolName, text }).catch(() => {})
    } else {
      copyToClipboard(text)
    }
  }, [copyToClipboard])

  // ============ ریست کردن ============
  const resetTool = useCallback((tool) => {
    switch(tool) {
      case 'compound':
        setCompound({ initial: 10000, rate: 20, years: 5, compounds: 12, monthlyContribution: 0 })
        break
      case 'riskReward':
        setRiskReward({ entry: 50000, stopLoss: 48000, takeProfit: 56000 })
        break
      case 'positionSize':
        setPositionSizeState({ balance: 10000, riskPercent: 2, entry: 50000, stopLoss: 48000, leverage: 1 })
        break
      case 'pnl':
        setPnl({ entry: 50000, exit: 55000, quantity: 0.5, direction: 'long', fee: 0.1, leverage: 1 })
        break
      case 'breakEven':
        setBreakEven({ entry: 50000, fee: 0.1, leverage: 1, direction: 'long' })
        break
      case 'fibonacci':
        setFibonacci({ high: 60000, low: 40000, type: 'retracement' })
        break
      default:
        break
    }
    success('🔄 مقادیر بازنشانی شدند')
  }, [success])

  // ============ خروجی گرفتن از تاریخچه ============
  const exportHistory = useCallback(() => {
    try {
      const data = history.map(h => ({
        ابزار: h.tool,
        نتیجه: h.result,
        زمان: h.timestamp
      }))
      const csv = ['ابزار,نتیجه,زمان', ...data.map(h => `${h.ابزار},"${h.نتیجه}",${h.زمان}`)].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `تاریخچه_ابزارها_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      success('📥 تاریخچه با موفقیت خروجی گرفته شد')
    } catch (err) {
      error('❌ خطا در خروجی گرفتن تاریخچه')
    }
  }, [history, success, error])

  // ============ داده‌های نمودار رشد ============
  const growthData = useMemo(() => {
    const result = calculateCompound()
    return result.growthData || []
  }, [calculateCompound])

  const stepData = getStepByStepData()

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in-up bg-grid-ultra min-h-screen" dir="rtl">
      
      {/* ============ هدر ============ */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gradient-ultra flex items-center gap-3">
            <Zap className="w-8 h-8 text-emerald-400" />
            ابزارهای تریدر
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-1">ماشین حساب‌های حرفه‌ای برای تحلیل و مدیریت معاملات</p>
        </div>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="text-slate-400 hover:text-white"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">تاریخچه</span>
              <span className="text-xs bg-slate-700/50 px-1.5 py-0.5 rounded-full">{history.length}</span>
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={exportHistory}
            disabled={history.length === 0}
            className="text-slate-400 hover:text-white"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">خروجی</span>
          </Button>
        </div>
      </div>

      {/* ============ انتخاب ابزار ============ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
        {TOOLS.map(tool => (
          <Button
            key={tool.id}
            variant={activeTool === tool.id ? 'default' : 'outline'}
            onClick={() => setActiveTool(tool.id)}
            className={`
              ${activeTool === tool.id 
                ? `btn-ultra btn-ultra-${tool.color} shadow-lg` 
                : 'btn-ultra btn-ultra-secondary'
              } 
              text-xs md:text-sm px-2 md:px-4 py-2 md:py-3 h-auto flex-col gap-1
              transition-all duration-300
            `}
            style={activeTool === tool.id ? { 
              boxShadow: `0 0 30px rgba(16, 185, 129, 0.15)`
            } : {}}
          >
            <tool.icon className={`w-4 h-4 md:w-5 md:h-5 ${activeTool === tool.id ? `text-${tool.color}-400` : ''}`} />
            <span className="text-[10px] md:text-xs text-center leading-tight">{tool.label}</span>
          </Button>
        ))}
      </div>

      {/* ============ توضیحات ابزار فعال ============ */}
      <div className="p-3 md:p-4 rounded-xl bg-slate-800/20 border border-slate-700/30 text-center">
        <p className="text-xs md:text-sm text-slate-400">
          {TOOLS.find(t => t.id === activeTool)?.description || ''}
        </p>
      </div>

      {/* ============ محتوای ابزارها ============ */}
      <div className="transition-all duration-300">
        
        {/* ===== سود مرکب ===== */}
        {activeTool === 'compound' && (
          <Card className="card-ultra border-emerald-500/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base md:text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  ماشین حساب سود مرکب
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => resetTool('compound')}
                    className="text-slate-400 hover:text-white"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ورودی‌ها */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="سرمایه اولیه ($)"
                      value={compound.initial}
                      onChange={(e) => setCompound({...compound, initial: parseFloat(e.target.value) || 0})}
                      icon={DollarSign}
                    />
                    <InputField
                      label="نرخ سود سالانه (%)"
                      value={compound.rate}
                      onChange={(e) => setCompound({...compound, rate: parseFloat(e.target.value) || 0})}
                      icon={TrendingUp}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="مدت زمان (سال)"
                      value={compound.years}
                      onChange={(e) => setCompound({...compound, years: parseFloat(e.target.value) || 0})}
                    />
                    <div className="space-y-1.5">
                      <Label className="label-ultra text-xs">تعداد ترکیب</Label>
                      <Select value={compound.compounds.toString()} onValueChange={(v) => setCompound({...compound, compounds: parseInt(v)})}>
                        <SelectTrigger className="input-ultra h-10 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                          <SelectItem value="1" className="text-white">سالانه</SelectItem>
                          <SelectItem value="4" className="text-white">سه‌ماهه</SelectItem>
                          <SelectItem value="12" className="text-white">ماهانه</SelectItem>
                          <SelectItem value="365" className="text-white">روزانه</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <InputField
                    label="واریز ماهانه (اختیاری)"
                    value={compound.monthlyContribution}
                    onChange={(e) => setCompound({...compound, monthlyContribution: parseFloat(e.target.value) || 0})}
                    icon={DollarSign}
                  />
                  
                  {/* انتخاب نمایش */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant={compoundView === 'chart' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCompoundView('chart')}
                      className={compoundView === 'chart' ? 'btn-ultra btn-ultra-emerald' : 'btn-ultra btn-ultra-secondary'}
                    >
                      <LineChart className="w-4 h-4" />
                      نمودار
                    </Button>
                    <Button
                      variant={compoundView === 'table' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCompoundView('table')}
                      className={compoundView === 'table' ? 'btn-ultra btn-ultra-emerald' : 'btn-ultra btn-ultra-secondary'}
                    >
                      <BarChart3 className="w-4 h-4" />
                      جدول
                    </Button>
                    <Button
                      variant={compoundView === 'both' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCompoundView('both')}
                      className={compoundView === 'both' ? 'btn-ultra btn-ultra-emerald' : 'btn-ultra btn-ultra-secondary'}
                    >
                      <Maximize2 className="w-4 h-4" />
                      هر دو
                    </Button>
                  </div>
                </div>

                {/* نتایج */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <ResultCard
                      title="مبلغ نهایی"
                      value={`$${formatNumber(calculateCompound().final.toFixed(0))}`}
                      color="emerald"
                      icon={Award}
                      onCopy={copyToClipboard}
                      onSave={() => saveResult('سود مرکب', calculateCompound())}
                    />
                    <ResultCard
                      title="سود کل"
                      value={`$${formatNumber(calculateCompound().profit.toFixed(0))}`}
                      color="amber"
                      icon={Star}
                    />
                  </div>
                  <ResultCard
                    title="درصد سود"
                    value={`${calculateCompound().profitPercent.toFixed(1)}%`}
                    color="purple"
                    subValue={`کل سرمایه‌گذاری: $${formatNumber(calculateCompound().totalContributions.toFixed(0))}`}
                  />

                  {/* نمودار و جدول قدم‌به‌قدم */}
                  {(compoundView === 'chart' || compoundView === 'both') && (
                    <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                      <p className="text-xs text-slate-400 mb-3">📈 روند رشد سرمایه (گام‌های سالانه)</p>
                      <ResponsiveContainer width="100%" height={150}>
                        <AreaChart data={stepData}>
                          <defs>
                            <linearGradient id="growthGradient3" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity={0.4}/>
                              <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="contributionGradient3" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                          <XAxis dataKey="سال" stroke="#64748b" tick={{ fontSize: 9 }} />
                          <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                            formatter={(value) => [`$${formatNumber(value)}`, 'ارزش']}
                          />
                          <Area type="monotone" dataKey="سرمایه" stroke="#10b981" fill="url(#growthGradient3)" />
                          <Area type="monotone" dataKey="سرمایه‌گذاری" stroke="#3b82f6" fill="url(#contributionGradient3)" strokeDasharray="5 5" />
                        </AreaChart>
                      </ResponsiveContainer>
                      <div className="flex items-center justify-center gap-4 mt-2 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-0.5 bg-emerald-400" />
                          <span>ارزش کل</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-0.5 bg-blue-400 border-t border-dashed border-blue-400" />
                          <span>سرمایه‌گذاری شده</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {(compoundView === 'table' || compoundView === 'both') && (
                    <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                      <StepTable data={stepData} title="گام‌های سالانه" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===== ریسک به ریوارد ===== */}
        {activeTool === 'riskReward' && (
          <Card className="card-ultra border-blue-500/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base md:text-lg font-bold flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  ماشین حساب ریسک به ریوارد
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => resetTool('riskReward')}
                  className="text-slate-400 hover:text-white"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <InputField
                    label="قیمت ورود"
                    value={riskReward.entry}
                    onChange={(e) => setRiskReward({...riskReward, entry: parseFloat(e.target.value) || 0})}
                    icon={DollarSign}
                  />
                  <InputField
                    label="حد ضرر (Stop Loss)"
                    value={riskReward.stopLoss}
                    onChange={(e) => setRiskReward({...riskReward, stopLoss: parseFloat(e.target.value) || 0})}
                    icon={AlertCircle}
                  />
                  <InputField
                    label="حد سود (Take Profit)"
                    value={riskReward.takeProfit}
                    onChange={(e) => setRiskReward({...riskReward, takeProfit: parseFloat(e.target.value) || 0})}
                    icon={Target}
                  />
                </div>

                <div className="space-y-4">
                  <ResultCard
                    title="نسبت ریسک به ریوارد"
                    value={`1:${calculateRiskReward().ratio.toFixed(2)}`}
                    color="blue"
                    icon={Target}
                    onCopy={copyToClipboard}
                    onSave={() => saveResult('ریسک به ریوارد', calculateRiskReward())}
                    onShare={() => shareResult('ریسک به ریوارد', `نسبت: 1:${calculateRiskReward().ratio.toFixed(2)}`)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <ResultCard
                      title="حداکثر ضرر"
                      value={`${calculateRiskReward().maxLossPercent.toFixed(1)}%`}
                      color="red"
                      subValue={`$${formatNumber(calculateRiskReward().risk)}`}
                    />
                    <ResultCard
                      title="حداکثر سود"
                      value={`${calculateRiskReward().maxProfitPercent.toFixed(1)}%`}
                      color="emerald"
                      subValue={`$${formatNumber(calculateRiskReward().reward)}`}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===== اندازه پوزیشن ===== */}
        {activeTool === 'positionSize' && (
          <Card className="card-ultra border-purple-500/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base md:text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  ماشین حساب اندازه پوزیشن
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => resetTool('positionSize')}
                  className="text-slate-400 hover:text-white"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="موجودی حساب ($)"
                      value={positionSizeState.balance}
                      onChange={(e) => setPositionSizeState({...positionSizeState, balance: parseFloat(e.target.value) || 0})}
                      icon={DollarSign}
                    />
                    <InputField
                      label="درصد ریسک (%)"
                      value={positionSizeState.riskPercent}
                      onChange={(e) => setPositionSizeState({...positionSizeState, riskPercent: parseFloat(e.target.value) || 0})}
                      icon={Activity}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="قیمت ورود"
                      value={positionSizeState.entry}
                      onChange={(e) => setPositionSizeState({...positionSizeState, entry: parseFloat(e.target.value) || 0})}
                      icon={TrendingUp}
                    />
                    <InputField
                      label="حد ضرر"
                      value={positionSizeState.stopLoss}
                      onChange={(e) => setPositionSizeState({...positionSizeState, stopLoss: parseFloat(e.target.value) || 0})}
                      icon={AlertCircle}
                    />
                  </div>
                  <InputField
                    label="لوریج"
                    value={positionSizeState.leverage}
                    onChange={(e) => setPositionSizeState({...positionSizeState, leverage: parseFloat(e.target.value) || 1})}
                    icon={Zap}
                  />
                </div>

                <div className="space-y-4">
                  <ResultCard
                    title="مقدار ریسک"
                    value={`$${formatNumber(calculatePositionSize().riskAmount.toFixed(2))}`}
                    color="red"
                    icon={AlertCircle}
                    onCopy={copyToClipboard}
                    onSave={() => saveResult('اندازه پوزیشن', calculatePositionSize())}
                  />
                  <ResultCard
                    title="اندازه پوزیشن"
                    value={formatNumber(calculatePositionSize().size.toFixed(4))}
                    color="purple"
                    icon={BarChart3}
                  />
                  <ResultCard
                    title="ارزش پوزیشن"
                    value={`$${formatNumber(calculatePositionSize().value.toFixed(2))}`}
                    color="emerald"
                    subValue={`حداکثر ضرر: $${formatNumber(calculatePositionSize().maxLoss.toFixed(2))}`}
                    icon={DollarSign}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===== سود/ضرر ===== */}
        {activeTool === 'pnl' && (
          <Card className="card-ultra border-amber-500/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base md:text-lg font-bold flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                  ماشین حساب سود/ضرر
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => resetTool('pnl')}
                  className="text-slate-400 hover:text-white"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="label-ultra text-xs">جهت معامله</Label>
                    <Select value={pnl.direction} onValueChange={(v) => setPnl({...pnl, direction: v})}>
                      <SelectTrigger className="input-ultra h-10"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                        <SelectItem value="long" className="text-white">📈 Long (خرید)</SelectItem>
                        <SelectItem value="short" className="text-white">📉 Short (فروش)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="قیمت ورود"
                      value={pnl.entry}
                      onChange={(e) => setPnl({...pnl, entry: parseFloat(e.target.value) || 0})}
                      icon={TrendingUp}
                    />
                    <InputField
                      label="قیمت خروج"
                      value={pnl.exit}
                      onChange={(e) => setPnl({...pnl, exit: parseFloat(e.target.value) || 0})}
                      icon={Target}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="حجم (تعداد)"
                      value={pnl.quantity}
                      onChange={(e) => setPnl({...pnl, quantity: parseFloat(e.target.value) || 0})}
                      step="0.01"
                      icon={BarChart3}
                    />
                    <InputField
                      label="لوریج"
                      value={pnl.leverage}
                      onChange={(e) => setPnl({...pnl, leverage: parseFloat(e.target.value) || 1})}
                      icon={Zap}
                    />
                  </div>
                  <InputField
                    label="کارمزد (%)"
                    value={pnl.fee}
                    onChange={(e) => setPnl({...pnl, fee: parseFloat(e.target.value) || 0})}
                    step="0.01"
                    icon={DollarSign}
                  />
                </div>

                <div className="space-y-4">
                  <ResultCard
                    title="سود/ضرر خالص"
                    value={`${calculatePnL().profit >= 0 ? '+' : ''}$${formatNumber(calculatePnL().profit.toFixed(2))}`}
                    color={calculatePnL().profit >= 0 ? 'emerald' : 'red'}
                    icon={calculatePnL().profit >= 0 ? TrendingUp : AlertCircle}
                    onCopy={copyToClipboard}
                    onSave={() => saveResult('سود/ضرر', calculatePnL())}
                    onShare={() => shareResult('سود/ضرر', `سود/ضرر: $${formatNumber(calculatePnL().profit.toFixed(2))}`)}
                  />
                  <ResultCard
                    title="درصد سود/ضرر"
                    value={`${calculatePnL().profitPercent >= 0 ? '+' : ''}${calculatePnL().profitPercent.toFixed(2)}%`}
                    color={calculatePnL().profitPercent >= 0 ? 'emerald' : 'red'}
                  />
                  <ResultCard
                    title="سود ناخالص"
                    value={`$${formatNumber(calculatePnL().grossProfit.toFixed(2))}`}
                    color="amber"
                    subValue={`کارمزد: $${formatNumber(calculatePnL().feeAmount.toFixed(2))}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===== نقطه سربه‌سر ===== */}
        {activeTool === 'breakEven' && (
          <Card className="card-ultra border-rose-500/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base md:text-lg font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-rose-400" />
                  ماشین حساب نقطه سربه‌سر
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => resetTool('breakEven')}
                  className="text-slate-400 hover:text-white"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="label-ultra text-xs">جهت معامله</Label>
                    <Select value={breakEven.direction} onValueChange={(v) => setBreakEven({...breakEven, direction: v})}>
                      <SelectTrigger className="input-ultra h-10"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                        <SelectItem value="long" className="text-white">📈 Long (خرید)</SelectItem>
                        <SelectItem value="short" className="text-white">📉 Short (فروش)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <InputField
                    label="قیمت ورود"
                    value={breakEven.entry}
                    onChange={(e) => setBreakEven({...breakEven, entry: parseFloat(e.target.value) || 0})}
                    icon={TrendingUp}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="کارمزد (%)"
                      value={breakEven.fee}
                      onChange={(e) => setBreakEven({...breakEven, fee: parseFloat(e.target.value) || 0})}
                      step="0.01"
                      icon={DollarSign}
                    />
                    <InputField
                      label="لوریج"
                      value={breakEven.leverage}
                      onChange={(e) => setBreakEven({...breakEven, leverage: parseFloat(e.target.value) || 1})}
                      icon={Zap}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <ResultCard
                    title="نقطه سربه‌سر"
                    value={formatNumber(calculateBreakEven().breakEvenPrice.toFixed(2))}
                    color="amber"
                    icon={Target}
                    onCopy={copyToClipboard}
                    onSave={() => saveResult('نقطه سربه‌سر', calculateBreakEven())}
                    onShare={() => shareResult('نقطه سربه‌سر', `سربه‌سر: ${formatNumber(calculateBreakEven().breakEvenPrice.toFixed(2))}`)}
                  />
                  <ResultCard
                    title="منطقه سربه‌سر"
                    value={`${formatNumber(calculateBreakEven().beZone.min.toFixed(2))} - ${formatNumber(calculateBreakEven().beZone.max.toFixed(2))}`}
                    color="rose"
                    subValue="محدوده ۲٪ بالا و پایین"
                  />
                  <ResultCard
                    title="کل کارمزدها"
                    value={formatNumber(calculateBreakEven().totalFees.toFixed(2))}
                    color="slate"
                    icon={DollarSign}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===== فیبوناچی ===== */}
        {activeTool === 'fibonacci' && (
          <Card className="card-ultra border-teal-500/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base md:text-lg font-bold flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-teal-400" />
                  ماشین حساب فیبوناچی
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => resetTool('fibonacci')}
                  className="text-slate-400 hover:text-white"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="label-ultra text-xs">نوع محاسبه</Label>
                    <Select value={fibonacci.type} onValueChange={(v) => setFibonacci({...fibonacci, type: v})}>
                      <SelectTrigger className="input-ultra h-10"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                        <SelectItem value="retracement" className="text-white">اصلاحی (Retracement)</SelectItem>
                        <SelectItem value="extension" className="text-white">گسترشی (Extension)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <InputField
                    label="قیمت سقف (High)"
                    value={fibonacci.high}
                    onChange={(e) => setFibonacci({...fibonacci, high: parseFloat(e.target.value) || 0})}
                    icon={TrendingUp}
                  />
                  <InputField
                    label="قیمت کف (Low)"
                    value={fibonacci.low}
                    onChange={(e) => setFibonacci({...fibonacci, low: parseFloat(e.target.value) || 0})}
                  />
                </div>

                <div>
                  <h3 className="text-slate-400 text-xs md:text-sm mb-3 font-medium">📊 سطوح فیبوناچی</h3>
                  <div className="space-y-1.5 max-h-[250px] overflow-y-auto custom-scrollbar-ultra">
                    {calculateFibonacci().map((fib, index) => (
                      <div 
                        key={index} 
                        className={`flex justify-between items-center p-2.5 rounded-xl border transition-all ${
                          fib.isKey 
                            ? 'bg-emerald-500/10 border-emerald-500/30' 
                            : 'bg-slate-800/30 border-slate-700/30'
                        }`}
                      >
                        <span className={`text-xs md:text-sm font-semibold ${fib.isKey ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {fib.level}%
                        </span>
                        <span className={`text-xs md:text-sm font-black font-mono ${fib.isKey ? 'text-white' : 'text-slate-300'}`}>
                          {formatNumber(fib.price.toFixed(2))}
                        </span>
                        {fib.isKey && (
                          <span className="text-[8px] md:text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                            کلیدی
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        const levels = calculateFibonacci()
                          .map(f => `${f.level}%: ${formatNumber(f.price.toFixed(2))}`)
                          .join('\n')
                        copyToClipboard(levels)
                      }}
                      className="text-slate-400 hover:text-white w-full border border-slate-700/50"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      کپی همه سطوح
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ============ تاریخچه محاسبات ============ */}
      {showHistory && history.length > 0 && (
        <Card className="card-ultra animate-fade-in-up">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base md:text-lg font-bold flex items-center gap-2">
                <History className="w-5 h-5 text-slate-400" />
                تاریخچه محاسبات
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setHistory([])}
                className="text-slate-400 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
                پاک کردن همه
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar-ultra">
              {history.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold text-xs md:text-sm">{item.tool}</span>
                    <span className="text-[10px] md:text-xs text-slate-500">{item.timestamp}</span>
                  </div>
                  <div className="text-xs md:text-sm text-slate-300 font-mono truncate max-w-[200px] md:max-w-[300px]">
                    {item.result}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}