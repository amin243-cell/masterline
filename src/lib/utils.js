import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// ==================== کلاس‌های CSS ====================

// ترکیب کلاس‌های Tailwind
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// ==================== کپی و کلیپ‌بورد ====================

// کپی کردن متن در کلیپ‌بورد
export async function copyToClipboard(text) {
  if (!text) return false
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    // Fallback برای مرورگرهای قدیمی
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const result = document.execCommand('copy')
    document.body.removeChild(textarea)
    return result
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

// ==================== فایل و دانلود ====================

// دانلود فایل
export function downloadFile(content, filename, type = 'text/json') {
  try {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    return true
  } catch (err) {
    console.error('Failed to download:', err)
    return false
  }
}

// تبدیل فایل به Base64
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

// ==================== ذخیره‌سازی ====================

// ذخیره در localStorage با پشتیبانی از JSON
export function setStorage(key, value) {
  try {
    const serialized = JSON.stringify(value)
    localStorage.setItem(key, serialized)
    return true
  } catch (err) {
    console.error('Failed to save to localStorage:', err)
    return false
  }
}

// دریافت از localStorage
export function getStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key)
    if (item === null) return defaultValue
    return JSON.parse(item)
  } catch (err) {
    console.error('Failed to read from localStorage:', err)
    return defaultValue
  }
}

// حذف از localStorage
export function removeStorage(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch (err) {
    console.error('Failed to remove from localStorage:', err)
    return false
  }
}

// ==================== زمان و تاخیر ====================

// تاخیر (برای تست و انیمیشن)
export function delay(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// تاخیر با شرط
export function waitFor(condition, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const check = () => {
      if (condition()) {
        resolve()
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'))
      } else {
        setTimeout(check, 100)
      }
    }
    check()
  })
}

// ==================== رویدادها ====================

// متوقف کردن propagation رویداد
export function stopPropagation(e) {
  if (e) {
    e.stopPropagation()
    e.preventDefault()
  }
}

// ==================== رنگ‌ها ====================

// تولید رنگ تصادفی
export function randomColor() {
  const colors = [
    '#10b981', '#34d399', '#6ee7b7',
    '#3b82f6', '#60a5fa', '#93c5fd',
    '#f59e0b', '#fbbf24', '#fcd34d',
    '#ef4444', '#f87171', '#fca5a5',
    '#8b5cf6', '#a78bfa', '#c4b5fd',
    '#ec4899', '#f472b6', '#f9a8d4',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// ==================== اشیاء و آرایه‌ها ====================

// مرتب‌سازی آرایه
export function sortArray(arr, key, order = 'asc') {
  if (!arr || !Array.isArray(arr)) return []
  return [...arr].sort((a, b) => {
    const valA = a[key] ?? 0
    const valB = b[key] ?? 0
    if (order === 'asc') return valA > valB ? 1 : -1
    return valA < valB ? 1 : -1
  })
}

// فیلتر آرایه براساس جستجو
export function filterArray(arr, searchTerm, keys) {
  if (!arr || !Array.isArray(arr) || !searchTerm) return arr
  const term = searchTerm.toLowerCase()
  return arr.filter(item => {
    return keys.some(key => {
      const value = item[key]?.toString().toLowerCase() || ''
      return value.includes(term)
    })
  })
}

// گروه‌بندی آرایه
export function groupBy(arr, key) {
  if (!arr || !Array.isArray(arr)) return {}
  return arr.reduce((groups, item) => {
    const groupKey = item[key] ?? 'undefined'
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
    return groups
  }, {})
}

// ==================== خروجی ====================
export default {
  cn,
  copyToClipboard,
  downloadFile,
  fileToBase64,
  setStorage,
  getStorage,
  removeStorage,
  delay,
  waitFor,
  stopPropagation,
  randomColor,
  sortArray,
  filterArray,
  groupBy,
}