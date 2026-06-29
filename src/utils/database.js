import useStore from '../store/useStore'

// ==================== آمار دیتابیس ====================
export const getDatabaseStats = () => {
  const state = useStore.getState()
  
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
  
  // محاسبه حجم localStorage
  const storageSize = new Blob([JSON.stringify(localStorage)]).size
  
  // محاسبه حجم هر بخش
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
  
  // تاریخ آخرین تغییر (از localStorage)
  const lastModified = localStorage.getItem('masterline-storage-last-modified')
  const firstEntry = localStorage.getItem('masterline-storage-first-entry')
  
  // محاسبه میانگین حجم هر رکورد
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
  const state = useStore.getState()
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
      // بررسی فرمت تاریخ شمسی (ساده)
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
  
  const state = useStore.getState()
  const originalSize = getDatabaseStats().totalSize
  let removedCount = 0
  
  // حذف فعالیت‌های قدیمی
  let optimizedActivities = state.activities || []
  if (removeOldActivities && oldActivityMonths > 0) {
    const cutoffDate = new Date()
    cutoffDate.setMonth(cutoffDate.getMonth() - oldActivityMonths)
    
    optimizedActivities = state.activities.filter(activity => {
      // اگر تاریخ داشته باشد، بررسی می‌کنیم
      if (activity.date) {
        try {
          // تبدیل تاریخ شمسی به میلادی (ساده‌شده)
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
          // اگر تاریخ نامعتبر بود، نگه می‌داریم
          return true
        }
      }
      return true
    })
    
    removedCount = state.activities.length - optimizedActivities.length
  }
  
  // فشرده‌سازی: حذف فیلدهای خالی
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
  
  // ذخیره تاریخ بهینه‌سازی
  localStorage.setItem('masterline-last-optimized', new Date().toISOString())
  
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

// ==================== Backup با رمز ====================
export const createEncryptedBackup = async (password) => {
  const state = useStore.getState()
  const data = {
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
  
  const jsonString = JSON.stringify(data)
  
  if (password && password.length >= 8) {
    // رمزگذاری با Web Crypto API
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

// ==================== بازیابی Backup رمزگذاری شده ====================
export const restoreEncryptedBackup = async (encryptedData, password) => {
  try {
    let decrypted
    
    // بررسی اینکه آیا داده رمزگذاری شده است یا خیر
    try {
      decrypted = await decryptData(encryptedData, password)
    } catch (err) {
      // اگر رمزگشایی شکست خورد، ممکن است فایل رمزگذاری نشده باشد
      try {
        const parsed = JSON.parse(encryptedData)
        if (parsed.appName === 'Masterline') {
          return parsed.data
        }
      } catch (e) {
        // اگر هر دو حالت شکست خورد، خطا بده
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

// ==================== توابع رمزگذاری (بهبودیافته) ====================
const encryptData = async (text, password) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  
  // تولید کلید از رمز عبور
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
  
  // ترکیب salt + iv + encrypted
  const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
  result.set(salt, 0)
  result.set(iv, salt.length)
  result.set(new Uint8Array(encrypted), salt.length + iv.length)
  
  // تبدیل به base64
  return btoa(String.fromCharCode(...result))
}

const decryptData = async (base64Data, password) => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  
  // تبدیل از base64
  const binaryString = atob(base64Data)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  
  // استخراج salt, iv, encrypted
  const salt = bytes.slice(0, 16)
  const iv = bytes.slice(16, 28)
  const encrypted = bytes.slice(28)
  
  // تولید کلید
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

// ==================== توابع کمکی ====================
export const formatBytes = (bytes) => {
  if (bytes === 0 || !bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const calculateHealthScore = (issues, warnings) => {
  let score = 100
  score -= issues.length * 20
  score -= warnings.length * 5
  return Math.max(0, Math.min(100, score))
}

// ==================== تابع جدید: برچسب بخش‌ها ====================
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

// ==================== ثبت تاریخ تغییرات ====================
export const trackDatabaseChange = () => {
  const now = new Date().toISOString()
  localStorage.setItem('masterline-storage-last-modified', now)
  
  if (!localStorage.getItem('masterline-storage-first-entry')) {
    localStorage.setItem('masterline-storage-first-entry', now)
  }
}

// ==================== تابع جدید: ذخیره تنظیمات ====================
export const saveSettings = async (settings) => {
  try {
    // اگر در محیط Tauri هستیم
    if (window.__TAURI__) {
      const { writeTextFile, BaseDirectory } = window.__TAURI__.fs
      await writeTextFile('settings.json', JSON.stringify(settings), {
        dir: BaseDirectory.AppData,
      })
    } else {
      // در محیط مرورگر
      localStorage.setItem('masterline-settings', JSON.stringify(settings))
    }
    trackDatabaseChange()
    return true
  } catch (err) {
    console.error('خطا در ذخیره تنظیمات:', err)
    throw new Error('خطا در ذخیره تنظیمات')
  }
}

// ==================== تابع جدید: بارگذاری تنظیمات ====================
export const loadSettings = async () => {
  try {
    // اگر در محیط Tauri هستیم
    if (window.__TAURI__) {
      const { readTextFile, BaseDirectory } = window.__TAURI__.fs
      try {
        const data = await readTextFile('settings.json', {
          dir: BaseDirectory.AppData,
        })
        return JSON.parse(data)
      } catch {
        return null
      }
    } else {
      // در محیط مرورگر
      const data = localStorage.getItem('masterline-settings')
      return data ? JSON.parse(data) : null
    }
  } catch (err) {
    console.error('خطا در بارگذاری تنظیمات:', err)
    return null
  }
}

// ==================== تابع جدید: پشتیبان‌گیری خودکار ====================
export const autoBackup = async () => {
  try {
    const settings = await loadSettings()
    if (!settings || !settings.autoBackup) return null
    
    const password = settings.backupPassword || null
    const backup = await createEncryptedBackup(password)
    
    // ذخیره در فایل
    if (window.__TAURI__) {
      const { writeTextFile, BaseDirectory } = window.__TAURI__.fs
      const fileName = `backup_${new Date().toISOString().slice(0,10)}.json`
      await writeTextFile(`backups/${fileName}`, backup.data, {
        dir: BaseDirectory.Document,
      })
    }
    
    return backup
  } catch (err) {
    console.error('خطا در پشتیبان‌گیری خودکار:', err)
    return null
  }
}

// ==================== تابع جدید: تمیز کردن داده‌های قدیمی ====================
export const cleanOldData = async (daysToKeep = 365) => {
  const state = useStore.getState()
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
  
  let cleaned = { ...state }
  let removedCount = 0
  
  // پاک کردن فعالیت‌های قدیمی
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
  
  // پاک کردن یادآورهای گذشته
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