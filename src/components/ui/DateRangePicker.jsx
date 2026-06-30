// src/components/ui/DateRangePicker.jsx
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { 
  Calendar, ChevronLeft, ChevronRight, X, Clock, 
  Zap, TrendingUp, Calendar as CalendarIcon,
  Filter, Check, ChevronDown
} from 'lucide-react'
import { cn } from '../../utils/helpers'
import { getPersianDate } from '../../lib/helpers'

// ============ تبدیل تاریخ میلادی به شمسی ============
const toPersianDate = (date) => {
  if (!date) return ''
  return date.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// ============ کامپوننت انتخابگر بازه زمانی ============
export const DateRangePicker = ({ 
  value, 
  onChange, 
  presets = [],
  className,
  placeholder = 'انتخاب بازه زمانی',
  size = 'default'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [startDate, setStartDate] = useState(value?.start || null)
  const [endDate, setEndDate] = useState(value?.end || null)
  const [isSelectingStart, setIsSelectingStart] = useState(true)
  const [hoverDate, setHoverDate] = useState(null)
  const [activeTab, setActiveTab] = useState('presets')
  const containerRef = useRef(null)

  // ============ بستن با کلیک خارج ============
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ============ همگام‌سازی با value ============
  useEffect(() => {
    if (value) {
      setStartDate(value.start || null)
      setEndDate(value.end || null)
    }
  }, [value])

  // ============ پریست‌های پیش‌فرض ============
  const defaultPresets = useMemo(() => [
    { 
      id: 'today', 
      label: 'امروز', 
      icon: Zap,
      value: { start: new Date(), end: new Date() },
      color: 'emerald'
    },
    { 
      id: 'week', 
      label: 'این هفته', 
      icon: TrendingUp,
      value: { start: getWeekStart(), end: new Date() },
      color: 'blue'
    },
    { 
      id: 'month', 
      label: 'این ماه', 
      icon: Calendar,
      value: { start: getMonthStart(), end: new Date() },
      color: 'purple'
    },
    { 
      id: 'quarter', 
      label: 'سه‌ماهه گذشته', 
      icon: Filter,
      value: { start: getQuarterStart(), end: new Date() },
      color: 'amber'
    },
    { 
      id: 'year', 
      label: 'امسال', 
      icon: CalendarIcon,
      value: { start: getYearStart(), end: new Date() },
      color: 'rose'
    },
    { 
      id: 'all', 
      label: 'همه زمان‌ها', 
      icon: Clock,
      value: { start: null, end: null },
      color: 'slate'
    },
  ], [])

  const allPresets = [...defaultPresets, ...presets]

  // ============ توابع کمکی ============
  function getWeekStart() {
    const date = new Date()
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(date.setDate(diff))
  }

  function getMonthStart() {
    const date = new Date()
    return new Date(date.getFullYear(), date.getMonth(), 1)
  }

  function getQuarterStart() {
    const date = new Date()
    const month = date.getMonth()
    const quarterStartMonth = Math.floor(month / 3) * 3
    return new Date(date.getFullYear(), quarterStartMonth, 1)
  }

  function getYearStart() {
    const date = new Date()
    return new Date(date.getFullYear(), 0, 1)
  }

  // ============ تشخیص پریست فعال ============
  const getActivePreset = useCallback(() => {
    if (!startDate && !endDate) return 'all'
    if (!startDate || !endDate) return null

    const startTime = startDate.getTime()
    const endTime = endDate.getTime()

    for (const preset of allPresets) {
      const pStart = preset.value.start
      const pEnd = preset.value.end
      if (!pStart && !pEnd) {
        if (!startDate && !endDate) return preset.id
        continue
      }
      if (!pStart || !pEnd) continue
      if (pStart.getTime() === startTime && pEnd.getTime() === endTime) {
        return preset.id
      }
    }
    return null
  }, [startDate, endDate, allPresets])

  // ============ انتخاب تاریخ ============
  const handleDateClick = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (date > today) return

    if (isSelectingStart) {
      setStartDate(date)
      setEndDate(null)
      setIsSelectingStart(false)
    } else {
      if (date >= startDate) {
        setEndDate(date)
        onChange({ start: startDate, end: date })
        setIsOpen(false)
        setIsSelectingStart(true)
      } else {
        setStartDate(date)
        setEndDate(null)
      }
    }
  }

  // ============ انتخاب پریست ============
  const handlePresetClick = (preset) => {
    const value = preset.value
    onChange(value)
    setIsOpen(false)
    setStartDate(value.start)
    setEndDate(value.end)
    setIsSelectingStart(true)
  }

  // ============ پاک کردن ============
  const handleClear = (e) => {
    e.stopPropagation()
    onChange({ start: null, end: null })
    setStartDate(null)
    setEndDate(null)
    setIsSelectingStart(true)
    setIsOpen(false)
  }

  // ============ تغییر ماه ============
  const changeMonth = (delta) => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + delta)
    setCurrentMonth(newMonth)
  }

  // ============ رفتن به امروز ============
  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  // ============ رندر تقویم ============
  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-9" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      date.setHours(0, 0, 0, 0)
      
      const isToday = date.getTime() === today.getTime()
      const isStart = startDate && date.getTime() === startDate.getTime()
      const isEnd = endDate && date.getTime() === endDate.getTime()
      const isInRange = startDate && endDate && date > startDate && date < endDate
      const isHover = hoverDate && date > startDate && date < hoverDate
      const isFuture = date > today

      days.push(
        <button
          key={day}
          onClick={() => !isFuture && handleDateClick(date)}
          onMouseEnter={() => setHoverDate(date)}
          onMouseLeave={() => setHoverDate(null)}
          disabled={isFuture}
          className={cn(
            "h-9 w-9 rounded-xl text-sm font-medium transition-all relative",
            "hover:bg-emerald-500/20 hover:text-white hover:scale-105",
            isToday && "border-2 border-emerald-500/30",
            isStart && "bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105",
            isEnd && "bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105",
            isInRange && "bg-emerald-500/20",
            isHover && "bg-emerald-500/10",
            isFuture && "opacity-20 cursor-not-allowed hover:bg-transparent hover:text-slate-400 hover:scale-100"
          )}
        >
          {day}
          {isToday && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
          )}
        </button>
      )
    }

    return days
  }

  // ============ فرمت نمایش ============
  const getDisplayText = () => {
    if (!value?.start && !value?.end) return placeholder
    if (!value?.end) return `از ${formatDate(value.start)}`
    if (!value?.start) return `تا ${formatDate(value.end)}`
    return `${formatDate(value.start)} - ${formatDate(value.end)}`
  }

  const formatDate = (date) => {
    if (!date) return ''
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const monthNames = [
    'دی', 'بهمن', 'اسفند', 'فروردین', 'اردیبهشت', 'خرداد',
    'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر'
  ]

  const activePreset = getActivePreset()
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    default: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base'
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* ===== دکمه بازکننده ===== */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-xl bg-slate-800/80 border border-slate-700/50",
          "text-white font-medium transition-all w-full",
          "hover:border-emerald-500/30 hover:bg-slate-700/80",
          isOpen && "border-emerald-500/50",
          sizeClasses[size]
        )}
      >
        <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span className="flex-1 text-right truncate">{getDisplayText()}</span>
        {value?.start && (
          <button
            onClick={handleClear}
            className="text-slate-400 hover:text-red-400 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* ===== پنل بازشونده ===== */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-[100] w-[720px] max-w-[95vw]">
          {/* پس‌زمینه مات با حاشیه */}
          <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
            
            {/* تب‌ها */}
            <div className="flex border-b border-slate-700/50">
              <button
                onClick={() => setActiveTab('presets')}
                className={cn(
                  "flex-1 px-4 py-3 text-sm font-medium transition-all",
                  activeTab === 'presets' 
                    ? "text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                )}
              >
                ⚡ بازه‌های سریع
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={cn(
                  "flex-1 px-4 py-3 text-sm font-medium transition-all",
                  activeTab === 'calendar' 
                    ? "text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                )}
              >
                📅 انتخاب با تقویم
              </button>
            </div>

            <div className="p-5">
              {/* ===== پریست‌ها ===== */}
              {activeTab === 'presets' && (
                <div className="grid grid-cols-2 gap-2">
                  {allPresets.map((preset) => {
                    const Icon = preset.icon || Zap
                    const isActive = activePreset === preset.id
                    const colorMap = {
                      emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                      blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
                      purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
                      amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                      rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
                      slate: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
                    }
                    
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handlePresetClick(preset)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
                          "hover:bg-slate-700/50",
                          isActive 
                            ? colorMap[preset.color] || 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : "border-slate-700/50 text-slate-300 hover:border-slate-600"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="flex-1 text-right font-medium">{preset.label}</span>
                        {isActive && <Check className="w-4 h-4 text-emerald-400" />}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* ===== تقویم ===== */}
              {activeTab === 'calendar' && (
                <div>
                  {/* هدر ماه */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeMonth(-1)}
                        className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                      <span className="text-white font-bold">
                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                      </span>
                      <button
                        onClick={() => changeMonth(1)}
                        className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                    <button
                      onClick={goToToday}
                      className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors px-3 py-1 rounded-lg bg-emerald-500/15"
                    >
                      امروز
                    </button>
                  </div>

                  {/* روزهای هفته */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((day, i) => (
                      <div key={i} className="h-9 flex items-center justify-center text-xs text-slate-500 font-bold">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* روزها */}
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendar()}
                  </div>

                  {/* راهنما */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/50 text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/40" />
                        <span>انتخاب شده</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded border-2 border-emerald-500/40" />
                        <span>امروز</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span>وضعیت:</span>
                      <span className="text-white font-medium">
                        {isSelectingStart ? 'انتخاب تاریخ شروع' : 'انتخاب تاریخ پایان'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DateRangePicker