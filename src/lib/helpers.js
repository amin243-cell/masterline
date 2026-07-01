import { toJalaali } from 'jalaali-js'

// ==================== تاریخ و زمان ====================

// گرفتن تاریخ امروز به فرمت شمسی
export function getPersianDate() {
  const today = new Date()
  const jDate = toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate())
  return `${jDate.jy}/${String(jDate.jm).padStart(2, '0')}/${String(jDate.jd).padStart(2, '0')}`
}

// تبدیل تاریخ میلادی به شمسی
export function toPersianDate(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const jDate = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())
  return `${jDate.jy}/${String(jDate.jm).padStart(2, '0')}/${String(jDate.jd).padStart(2, '0')}`
}

// فرمت کردن تاریخ شمسی (برای نمایش)
export function formatPersianDate(dateString) {
  if (!dateString) return '-'
  try {
    // اگر تاریخ به فرمت شمسی است
    if (dateString.includes('/')) {
      return dateString
    }
    // اگر تاریخ به فرمت میلادی است
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return toPersianDate(date)
  } catch (e) {
    return dateString
  }
}

// گرفتن زمان جاری
export function getCurrentTime() {
  return new Date().toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// گرفتن تاریخ و زمان کامل
export function getPersianDateTime() {
  return `${getPersianDate()} - ${getCurrentTime()}`
}

// ==================== اعداد و ارقام ====================

// فرمت کردن عدد با جداکننده هزارگان
export function formatNumber(num, options = {}) {
  if (num === undefined || num === null || isNaN(num)) return '۰'
  
  const { 
    locale = 'fa-IR', 
    minimumFractionDigits = 0, 
    maximumFractionDigits = 0,
    currency = false,
    currencySymbol = 'ریال'
  } = options

  const number = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num
  
  if (isNaN(number)) return '۰'

  const formatted = number.toLocaleString(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  })

  if (currency) {
    return `${formatted} ${currencySymbol}`
  }

  return formatted
}

// فرمت کردن اعداد با دو رقم اعشار (برای ارزها)
export function formatCurrency(num, symbol = 'ریال') {
  return formatNumber(num, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2,
    currency: true,
    currencySymbol: symbol
  })
}

// فرمت کردن درصد
export function formatPercentage(num) {
  if (num === undefined || num === null || isNaN(num)) return '۰%'
  const sign = num > 0 ? '+' : ''
  return `${sign}${num.toFixed(1)}%`
}

// تبدیل عدد فرمت شده به عدد خام
export function parseNumber(str) {
  if (!str) return 0
  if (typeof str === 'number') return str
  const cleaned = str.replace(/,/g, '').replace(/[^0-9.-]/g, '')
  return parseFloat(cleaned) || 0
}

// ==================== متن و رشته ====================

// کوتاه کردن متن
export function truncateText(text, maxLength = 50, suffix = '...') {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + suffix
}

// ==================== اعتبارسنجی ====================

// بررسی خالی بودن
export function isEmpty(value) {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

// بررسی ایمیل
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// بررسی شماره موبایل ایران
export function isValidPhone(phone) {
  const regex = /^09[0-9]{9}$/
  return regex.test(phone)
}

// ==================== رنگ و دسته‌بندی ====================

// دریافت رنگ براساس دسته
export function getCategoryColor(category) {
  const colors = {
    trading: 'emerald',
    bank: 'blue',
    crypto: 'orange',
    gold: 'yellow',
    silver: 'gray',
    car: 'purple',
    cash: 'green',
    investment: 'indigo',
    subscription: 'pink',
    debt: 'red',
    loan: 'red',
    goal: 'teal',
    reminder: 'cyan',
  }
  return colors[category] || 'slate'
}

// دریافت آیکون براساس دسته
export function getCategoryIcon(category) {
  const icons = {
    trading: '📈',
    bank: '🏦',
    crypto: '₿',
    gold: '🥇',
    silver: '🥈',
    car: '🚗',
    cash: '💵',
    investment: '📊',
    subscription: '🔄',
    debt: '💳',
    loan: '💰',
    goal: '🎯',
    reminder: '⏰',
  }
  return icons[category] || '📦'
}

// ==================== آمار و محاسبات ====================

// محاسبه درصد تغییر
export function calculatePercentageChange(current, previous) {
  if (!previous || previous === 0) return 0
  return ((current - previous) / previous) * 100
}

// جمع‌آوری آرایه
export function sumArray(arr) {
  if (!arr || !Array.isArray(arr)) return 0
  return arr.reduce((sum, item) => sum + (parseNumber(item) || 0), 0)
}

// میانگین آرایه
export function averageArray(arr) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return 0
  return sumArray(arr) / arr.length
}

// ==================== خروجی ====================
export default {
  getPersianDate,
  toPersianDate,
  formatPersianDate,
  getCurrentTime,
  getPersianDateTime,
  formatNumber,
  formatCurrency,
  formatPercentage,
  parseNumber,
  truncateText,
  isEmpty,
  isValidEmail,
  isValidPhone,
  getCategoryColor,
  getCategoryIcon,
  calculatePercentageChange,
  sumArray,
  averageArray,
}