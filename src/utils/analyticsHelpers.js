// src/utils/analyticsHelpers.js
import { formatNumber } from '../lib/helpers'

/**
 * محاسبه درصد تغییر بین دو مقدار
 */
export const calculateChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * فرمت کردن درصد با علامت +/-
 */
export const formatPercentage = (value) => {
  const formatted = value.toFixed(1)
  return value >= 0 ? `+${formatted}%` : `${formatted}%`
}

/**
 * گرفتن رنگ بر اساس مقدار (مثبت = سبز، منفی = قرمز)
 */
export const getColorByValue = (value) => {
  if (value > 0) return '#10b981'
  if (value < 0) return '#ef4444'
  return '#94a3b8'
}

/**
 * گروه‌بندی داده‌ها بر اساس ماه
 */
export const groupByMonth = (data, dateField) => {
  const result = {}
  data.forEach(item => {
    const date = new Date(item[dateField])
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`
    if (!result[key]) result[key] = []
    result[key].push(item)
  })
  return result
}

/**
 * محاسبه میانگین متحرک
 */
export const calculateMovingAverage = (data, windowSize = 3) => {
  const result = []
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1)
    const slice = data.slice(start, i + 1)
    const avg = slice.reduce((sum, val) => sum + val, 0) / slice.length
    result.push(avg)
  }
  return result
}

/**
 * مرتب‌سازی داده‌های نمودار
 */
export const sortChartData = (data, sortBy = 'value', order = 'desc') => {
  return [...data].sort((a, b) => {
    const comparison = a[sortBy] - b[sortBy]
    return order === 'desc' ? -comparison : comparison
  })
}

/**
 * فیلتر داده‌ها بر اساس بازه زمانی
 */
export const filterByDateRange = (data, dateField, startDate, endDate) => {
  return data.filter(item => {
    const date = new Date(item[dateField])
    return date >= startDate && date <= endDate
  })
}

/**
 * تبدیل داده به فرمت CSV
 */
export const convertToCSV = (data, headers) => {
  if (!data || data.length === 0) return ''
  
  const rows = []
  if (headers) {
    rows.push(headers.join(','))
  }
  
  data.forEach(item => {
    const row = Object.values(item).map(value => 
      typeof value === 'string' ? `"${value}"` : value
    )
    rows.push(row.join(','))
  })
  
  return rows.join('\n')
}

/**
 * دانلود فایل CSV
 */
export const downloadCSV = (data, filename) => {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

/**
 * محاسبه آمار توصیفی
 */
export const descriptiveStats = (data) => {
  if (!data || data.length === 0) {
    return { min: 0, max: 0, sum: 0, avg: 0, median: 0 }
  }
  
  const sorted = [...data].sort((a, b) => a - b)
  const sum = data.reduce((s, v) => s + v, 0)
  const avg = sum / data.length
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)]
  
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    sum,
    avg,
    median,
    count: data.length,
  }
}

/**
 * محاسبه توزیع درصدی
 */
export const percentageDistribution = (data, total) => {
  if (total === 0) return data.map(item => ({ ...item, percent: 0 }))
  return data.map(item => ({
    ...item,
    percent: (item.value / total) * 100
  }))
}

/**
 * پیدا کردن روند (روند صعودی/نزولی)
 */
export const findTrend = (data) => {
  if (data.length < 2) return 'stable'
  
  let increasing = 0
  let decreasing = 0
  
  for (let i = 1; i < data.length; i++) {
    if (data[i] > data[i - 1]) increasing++
    else if (data[i] < data[i - 1]) decreasing++
  }
  
  if (increasing > decreasing) return 'up'
  if (decreasing > increasing) return 'down'
  return 'stable'
}

/**
 * تولید رنگ بر اساس شاخص
 */
export const getColorByIndex = (index, colors = [
  '#10b981', '#3b82f6', '#f59e0b', '#a855f7', 
  '#ef4444', '#06b6d4', '#ec4899', '#6366f1'
]) => {
  return colors[index % colors.length]
}