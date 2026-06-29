// src/utils/helpers.js

// فرمت زمان نسبی (مثلاً "۲ دقیقه پیش")
export const formatRelativeTime = (timestamp) => {
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 60) return 'همین الان'
  if (diffMin < 60) return `${diffMin} دقیقه پیش`
  if (diffHour < 24) return `${diffHour} ساعت پیش`
  if (diffDay < 7) return `${diffDay} روز پیش`
  if (diffWeek < 4) return `${diffWeek} هفته پیش`
  if (diffMonth < 12) return `${diffMonth} ماه پیش`
  return `${diffYear} سال پیش`
}

// فرمت تاریخ
export const formatDate = (date, format = 'YYYY/MM/DD') => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
}

// کلاس‌های شرطی
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

// کپی متن در کلیپ‌بورد
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// تولید ID یکتا
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// بررسی خالی بودن شیء
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0
}

// گروه‌بندی آرایه بر اساس کلید
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key]
    if (!result[groupKey]) result[groupKey] = []
    result[groupKey].push(item)
    return result
  }, {})
}

// مرتب‌سازی آرایه بر اساس تاریخ
export const sortByDate = (array, field = 'timestamp', order = 'desc') => {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[field])
    const dateB = new Date(b[field])
    return order === 'desc' ? dateB - dateA : dateA - dateB
  })
}

// محدود کردن متن
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}