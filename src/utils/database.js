// ==================== توابع کمکی ====================
export const formatBytes = (bytes) => {
  if (bytes === 0 || !bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ==================== دریافت داده از localStorage ====================
const getDataFromStorage = () => {
  try {
    const stored = localStorage.getItem('masterline-storage')
    if (!stored) return null
    return JSON.parse(stored)
  } catch {
    return null
  }
}

// ==================== آمار دیتابیس ====================
export const getDatabaseStats = () => {
  const data = getDataFromStorage()
  const state = data?.state || {}
  
  const sections = {
    accounts: state.accounts || [],
    assets: state.assets || [],
    activities: state.activities || [],
    loans: state.loans || [],
    subscriptions: state.subscriptions || [],
    debts: state.debts || [],
    goals: state.goals || [],
    reminders: state.reminders || [],
  }
  
  const storageSize = new Blob([JSON.stringify(localStorage)]).size
  
  const sectionSizes = {}
  let totalRecords = 0
  
  Object.keys(sections).forEach(key => {
    const items = sections[key] || []
    const size = new Blob([JSON.stringify(items)]).size
    sectionSizes[key] = {
      count: items.length,
      size: size,
      sizeFormatted: formatBytes(size),
    }
    totalRecords += items.length
  })
  
  const lastModified = localStorage.getItem('masterline-storage-last-modified')
  const firstEntry = localStorage.getItem('masterline-storage-first-entry')
  
  let averageRecordSize = '0 B'
  if (totalRecords > 0) {
    const avgBytes = storageSize / totalRecords
    averageRecordSize = formatBytes(avgBytes)
  }
  
  return {
    totalSize: storageSize,
    totalSizeFormatted: formatBytes(storageSize),
    totalRecords,
    sections: sectionSizes,
    lastModified: lastModified ? new Date(lastModified) : null,
    firstEntry: firstEntry ? new Date(firstEntry) : new Date(),
    storageUsage: Math.min((storageSize / (5 * 1024 * 1024) * 100), 100),
    averageRecordSize,
  }
}

// ==================== بررسی سلامت دیتابیس ====================
export const checkDatabaseHealth = () => {
  const data = getDataFromStorage()
  const state = data?.state || {}
  const issues = []
  const warnings = []
  let lastOptimized = localStorage.getItem('masterline-last-optimized')
  
  // بررسی داده‌های تکراری
  const checkDuplicates = (items, name) => {
    if (!items || items.length === 0) return
    const ids = items.map(item => item.id)
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
    if (duplicates.length > 0) {
      issues.push(`داده تکراری یافت شد: ${duplicates.length} مورد در ${name}`)
    }
  }
  
  // بررسی رکوردهای خالی
  const checkEmptyRecords = (items, name) => {
    if (!items || items.length === 0) return
    const empty = items.filter(item => !item.name && !item.title && !item.label)
    if (empty.length > 0) {
      warnings.push(`${empty.length} رکورد بدون نام در ${name}`)
    }
  }
  
  // بررسی تاریخ‌های نامعتبر
  const checkInvalidDates = (items, name, dateField = 'date') => {
    if (!items || items.length === 0) return
    const invalid = items.filter(item => {
      if (!item[dateField]) return false
      const str = String(item[dateField])
      const parts = str.split(/[/-]/)
      return parts.length !== 3 || parts.some(p => isNaN(parseInt(p)))
    })
    if (invalid.length > 0) {
      warnings.push(`${invalid.length} تاریخ نامعتبر در ${name}`)
    }
  }
  
  // بررسی اعداد منفی در موجودی
  const checkNegativeBalances = (items, name, field = 'balance') => {
    if (!items || items.length === 0) return
    const negative = items.filter(item => parseFloat(item[field]) < 0)
    if (negative.length > 0) {
      warnings.push(`${negative.length} موجودی منفی در ${name}`)
    }
  }
  
  // اجرای بررسی‌ها
  checkDuplicates(state.accounts, 'حساب‌ها')
  checkDuplicates(state.assets, 'دارایی‌ها')
  checkDuplicates(state.activities, 'فعالیت‌ها')
  checkDuplicates(state.loans, 'وام‌ها')
  
  checkEmptyRecords(state.accounts, 'حساب‌ها')
  checkEmptyRecords(state.assets, 'دارایی‌ها')
  checkEmptyRecords(state.loans, 'وام‌ها')
  
  checkInvalidDates(state.activities, 'فعالیت‌ها')
  checkInvalidDates(state.loans, 'وام‌ها', 'startDate')
  checkInvalidDates(state.goals, 'اهداف', 'deadline')
  checkInvalidDates(state.reminders, 'یادآورها', 'reminderDate')
  
  checkNegativeBalances(state.accounts, 'حساب‌ها')
  checkNegativeBalances(state.loans, 'وام‌ها', 'amount')
  
  // بررسی حجم
  const stats = getDatabaseStats()
  if (parseFloat(stats.storageUsage) > 80) {
    warnings.push(`حجم دیتابیس ${stats.storageUsage.toFixed(1)}% است (بیش از ۸۰٪)`)
  }
  
  // بررسی آخرین بهینه‌سازی
  if (lastOptimized) {
    const lastOptDate = new Date(lastOptimized)
    const daysSinceOptimize = Math.floor((Date.now() - lastOptDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceOptimize > 30) {
      warnings.push(`آخرین بهینه‌سازی ${daysSinceOptimize} روز پیش انجام شده است`)
    }
  } else {
    warnings.push('هیچ‌گاه بهینه‌سازی انجام نشده است')
  }
  
  const calculateHealthScore = (issues, warnings) => {
    let score = 100
    score -= issues.length * 20
    score -= warnings.length * 5
    return Math.max(0, Math.min(100, score))
  }
  
  return {
    healthy: issues.length === 0,
    issues,
    warnings,
    score: calculateHealthScore(issues, warnings),
    lastOptimized: lastOptimized ? new Date(lastOptimized) : null,
  }
}

// ==================== بهینه‌سازی دیتابیس ====================
export const optimizeDatabase = (options = {}) => {
  const {
    removeOldActivities = true,
    oldActivityMonths = 24,
    compressData = true,
  } = options
  
  const data = getDataFromStorage()
  const state = data?.state || {}
  const originalSize = getDatabaseStats().totalSize
  let removedCount = 0
  
  // حذف فعالیت‌های قدیمی
  let optimizedActivities = state.activities || []
  if (removeOldActivities && oldActivityMonths > 0) {
    const cutoffDate = new Date()
    cutoffDate.setMonth(cutoffDate.getMonth() - oldActivityMonths)
    
    optimizedActivities = state.activities.filter(activity => {
      if (activity.date) {
        try {
          const parts = activity.date.split('/')
          if (parts.length === 3) {
            const persianDate = new Date(
              parseInt(parts[0]),
              parseInt(parts[1]) - 1,
              parseInt(parts[2])
            )
            return persianDate > cutoffDate
          }
        } catch (e) {
          return true
        }
      }
      return true
    })
    
    removedCount = state.activities.length - optimizedActivities.length
  }
  
  // فشرده‌سازی
  let optimized = { ...state }
  if (compressData) {
    const cleanEmptyFields = (items) => {
      if (!items) return []
      return items.map(item => {
        const cleaned = {}
        Object.keys(item).forEach(key => {
          const value = item[key]
          if (value !== '' && value !== null && value !== undefined && value !== 'null') {
            cleaned[key] = value
          }
        })
        return cleaned
      })
    }
    
    optimized.accounts = cleanEmptyFields(state.accounts)
    optimized.assets = cleanEmptyFields(state.assets)
    optimized.activities = cleanEmptyFields(optimizedActivities)
    optimized.loans = cleanEmptyFields(state.loans)
    optimized.debts = cleanEmptyFields(state.debts)
    optimized.subscriptions = cleanEmptyFields(state.subscriptions)
    optimized.goals = cleanEmptyFields(state.goals)
    optimized.reminders = cleanEmptyFields(state.reminders)
  } else {
    optimized.activities = optimizedActivities
  }
  
  localStorage.setItem('masterline-last-optimized', new Date().toISOString())
  
  // ذخیره داده‌های بهینه‌سازی شده
  try {
    const existing = JSON.parse(localStorage.getItem('masterline-storage') || '{}')
    existing.state = optimized
    localStorage.setItem('masterline-storage', JSON.stringify(existing))
  } catch (e) {
    console.error('Error saving optimized data:', e)
  }
  
  const newSize = new Blob([JSON.stringify(optimized)]).size
  
  return {
    optimized,
    removedCount,
    sizeBefore: originalSize,
    sizeAfter: newSize,
    sizeReduction: formatBytes(originalSize - newSize),
    sizeReductionPercent: ((originalSize - newSize) / originalSize * 100).toFixed(1),
  }
}

// ==================== Backup ====================
export const createEncryptedBackup = async (password) => {
  const data = getDataFromStorage()
  const state = data?.state || {}
  
  const exportData = {
    version: '2.0.0',
    exportDate: new Date().toISOString(),
    appName: 'Masterline',
    data: {
      accounts: state.accounts || [],
      assets: state.assets || [],
      activities: state.activities || [],
      loans: state.loans || [],
      subscriptions: state.subscriptions || [],
      debts: state.debts || [],
      goals: state.goals || [],
      reminders: state.reminders || [],
      summary: state.summary || {},
      settings: state.settings || {},
    },
  }
  
  const jsonString = JSON.stringify(exportData)
  
  if (password && password.length >= 8) {
    try {
      const encrypted = await encryptData(jsonString, password)
      return {
        data: encrypted,
        encrypted: true,
        size: new Blob([encrypted]).size,
        sizeFormatted: formatBytes(new Blob([encrypted]).size),
      }
    } catch (err) {
      throw new Error('خطا در رمزگذاری: ' + err.message)
    }
  }
  
  return {
    data: jsonString,
    encrypted: false,
    size: new Blob([jsonString]).size,
    sizeFormatted: formatBytes(new Blob([jsonString]).size),
  }
}

// ==================== بازیابی Backup ====================
export const restoreEncryptedBackup = async (encryptedData, password) => {
  try {
    let decrypted
    
    try {
      decrypted = await decryptData(encryptedData, password)
    } catch (err) {
      try {
        const parsed = JSON.parse(encryptedData)
        if (parsed.appName === 'Masterline') {
          return parsed.data
        }
      } catch (e) {
        throw new Error('فایل نامعتبر است یا رمز عبور اشتباه است')
      }
      throw new Error('رمز عبور اشتباه است')
    }
    
    const parsed = JSON.parse(decrypted)
    
    if (!parsed.data || parsed.appName !== 'Masterline') {
      throw new Error('فایل نامعتبر است')
    }
    
    return parsed.data
  } catch (err) {
    if (err.message.includes('رمز عبور')) {
      throw err
    }
    throw new Error('خطا در بازیابی فایل: ' + err.message)
  }
}

// ==================== توابع رمزگذاری ====================
const encryptData = async (text, password) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )
  
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  )
  
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    data
  )
  
  const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
  result.set(salt, 0)
  result.set(iv, salt.length)
  result.set(new Uint8Array(encrypted), salt.length + iv.length)
  
  return btoa(String.fromCharCode(...result))
}

const decryptData = async (base64Data, password) => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  
  const binaryString = atob(base64Data)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  
  const salt = bytes.slice(0, 16)
  const iv = bytes.slice(16, 28)
  const encrypted = bytes.slice(28)
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  )
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encrypted
  )
  
  return decoder.decode(decrypted)
}

// ==================== توابع کمکی دیگر ====================
export const getSectionLabel = (key) => {
  const labels = {
    accounts: 'حساب‌ها',
    assets: 'دارایی‌ها',
    activities: 'فعالیت‌ها',
    loans: 'وام‌ها',
    subscriptions: 'اشتراک‌ها',
    debts: 'بدهی‌ها',
    goals: 'اهداف',
    reminders: 'یادآورها',
  }
  return labels[key] || key
}

export const trackDatabaseChange = () => {
  const now = new Date().toISOString()
  localStorage.setItem('masterline-storage-last-modified', now)
  
  if (!localStorage.getItem('masterline-storage-first-entry')) {
    localStorage.setItem('masterline-storage-first-entry', now)
  }
}

export const cleanOldData = async (daysToKeep = 365) => {
  const data = getDataFromStorage()
  const state = data?.state || {}
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
  
  let cleaned = { ...state }
  let removedCount = 0
  
  if (state.activities) {
    cleaned.activities = state.activities.filter(activity => {
      if (!activity.date) return true
      try {
        const parts = activity.date.split('/')
        if (parts.length === 3) {
          const activityDate = new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2])
          )
          return activityDate > cutoffDate
        }
      } catch (e) {}
      return true
    })
    removedCount += state.activities.length - cleaned.activities.length
  }
  
  if (state.reminders) {
    cleaned.reminders = state.reminders.filter(reminder => {
      if (!reminder.reminderDate) return true
      try {
        const parts = reminder.reminderDate.split('/')
        if (parts.length === 3) {
          const reminderDate = new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2])
          )
          return reminderDate > cutoffDate
        }
      } catch (e) {}
      return true
    })
    removedCount += state.reminders.length - cleaned.reminders.length
  }
  
  return {
    cleaned,
    removedCount,
    daysToKeep,
  }
}