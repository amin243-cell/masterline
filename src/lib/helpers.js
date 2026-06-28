import { toJalaali } from 'jalaali-js'

// گرفتن تاریخ امروز به فرمت شمسی
export function getPersianDate() {
  const today = new Date()
  const jDate = toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate())
  return `${jDate.jy}/${String(jDate.jm).padStart(2, '0')}/${String(jDate.jd).padStart(2, '0')}`
}

// فرمت کردن عدد با جداکننده هزارگان
export function formatNumber(num) {
  if (!num) return ''
  return num.toLocaleString('en-US')
}

// تبدیل عدد فرمت شده به عدد خام
export function parseNumber(str) {
  if (!str) return 0
  return parseFloat(str.replace(/,/g, ''))
}