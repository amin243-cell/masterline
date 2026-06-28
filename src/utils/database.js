import useStore from '../store/useStore'

// ==================== آمار دیتابیس ====================
export const getDatabaseStats = () => {
  const state = useStore.getState()
  
  const sections = {
    accounts: state.accounts,
    assets: state.assets,
    activities: state.activities,
    loans: state.loans,
    subscriptions: state.subscriptions,
    debts: state.debts,
    goals: state.goals,
    reminders: state.reminders,
  }
  
  // محاسبه حجم localStorage
  const storageSize = new Blob([JSON.stringify(localStorage)]).size
  
  // محاسبه حجم هر بخش
  const sectionSizes = {}
  let totalRecords = 0
  
  Object.keys(sections).forEach(key => {
    const size = new Blob([JSON.stringify(sections[key])]).size
    sectionSizes[key] = {
      count: sections[key].length,
      size: size,
      sizeFormatted: formatBytes(size),
    }
    totalRecords += sections[key].length
  })
  
  // تاریخ آخرین تغییر (از localStorage)
  const lastModified = localStorage.getItem('masterline-storage-last-modified')
  const firstEntry = localStorage.getItem('masterline-storage-first-entry')
  
  return {
    totalSize: storageSize,
    totalSizeFormatted: formatBytes(storageSize),
    totalRecords,
    sections: sectionSizes,
    lastModified: lastModified ? new Date(lastModified) : null,
    firstEntry: firstEntry ? new Date(firstEntry) : new Date(),
    storageUsage: (storageSize / (5 * 1024 * 1024) * 100).toFixed(2), // localStorage ~5MB
  }
}

// ==================== بررسی سلامت دیتابیس ====================
export const checkDatabaseHealth = () => {
  const state = useStore.getState()
  const issues = []
  const warnings = []
  
  // بررسی داده‌های تکراری
  const checkDuplicates = (items, field = 'id') => {
    const ids = items.map(item => item[field])
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
    if (duplicates.length > 0) {
      issues.push(`داده تکراری یافت شد: ${duplicates.length} مورد`)
    }
  }
  
  // بررسی رکوردهای خالی
  const checkEmptyRecords = (items, name) => {
    const empty = items.filter(item => !item.name && !item.title)
    if (empty.length > 0) {
      warnings.push(`${empty.length} رکورد بدون نام در ${name}`)
    }
  }
  
  // بررسی تاریخ‌های نامعتبر
  const checkInvalidDates = (items, name, dateField = 'date') => {
    const invalid = items.filter(item => {
      if (!item[dateField]) return false
      const parts = item[dateField].split('/')
      return parts.length !== 3
    })
    if (invalid.length > 0) {
      warnings.push(`${invalid.length} تاریخ نامعتبر در ${name}`)
    }
  }
  
  // اجرای بررسی‌ها
  checkDuplicates(state.accounts, 'حساب‌ها')
  checkDuplicates(state.assets, 'دارایی‌ها')
  checkDuplicates(state.activities, 'فعالیت‌ها')
  
  checkEmptyRecords(state.accounts, 'حساب‌ها')
  checkEmptyRecords(state.assets, 'دارایی‌ها')
  
  checkInvalidDates(state.activities, 'فعالیت‌ها')
  checkInvalidDates(state.loans, 'وام‌ها', 'startDate')
  checkInvalidDates(state.goals, 'اهداف', 'deadline')
  
  // بررسی حجم
  const stats = getDatabaseStats()
  if (parseFloat(stats.storageUsage) > 80) {
    warnings.push(`حجم دیتابیس ${stats.storageUsage}% است (بیش از ۸۰٪)`)
  }
  
  return {
    healthy: issues.length === 0,
    issues,
    warnings,
    score: calculateHealthScore(issues, warnings),
  }
}

// ==================== بهینه‌سازی دیتابیس ====================
export const optimizeDatabase = (options = {}) => {
  const {
    removeOldActivities = false,
    oldActivityMonths = 24,
    compressData = true,
  } = options
  
  const state = useStore.getState()
  let optimized = { ...state }
  let removedCount = 0
  
  // حذف فعالیت‌های قدیمی
  if (removeOldActivities && oldActivityMonths > 0) {
    const cutoffDate = new Date()
    cutoffDate.setMonth(cutoffDate.getMonth() - oldActivityMonths)
    
    // تبدیل تاریخ شمسی به میلادی برای مقایسه (ساده‌شده)
    optimized.activities = state.activities.filter(activity => {
      // اینجا می‌تونیم تاریخ شمسی رو تبدیل کنیم
      // برای الان فقط نگه می‌داریم
      return true
    })
    
    removedCount = state.activities.length - optimized.activities.length
  }
  
  // فشرده‌سازی: حذف فیلدهای خالی
  if (compressData) {
    const cleanEmptyFields = (items) => {
      return items.map(item => {
        const cleaned = {}
        Object.keys(item).forEach(key => {
          if (item[key] !== '' && item[key] !== null && item[key] !== undefined) {
            cleaned[key] = item[key]
          }
        })
        return cleaned
      })
    }
    
    optimized.accounts = cleanEmptyFields(state.accounts)
    optimized.assets = cleanEmptyFields(state.assets)
    optimized.loans = cleanEmptyFields(state.loans)
    optimized.debts = cleanEmptyFields(state.debts)
    optimized.goals = cleanEmptyFields(state.goals)
    optimized.reminders = cleanEmptyFields(state.reminders)
  }
  
  return {
    optimized,
    removedCount,
    sizeBefore: getDatabaseStats().totalSize,
  }
}

// ==================== Backup با رمز ====================
export const createEncryptedBackup = async (password) => {
  const state = useStore.getState()
  const data = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    appName: 'Masterline',
    data: {
      accounts: state.accounts,
      assets: state.assets,
      activities: state.activities,
      loans: state.loans,
      subscriptions: state.subscriptions,
      debts: state.debts,
      goals: state.goals,
      reminders: state.reminders,
      summary: state.summary,
      settings: state.settings,
    },
  }
  
  const jsonString = JSON.stringify(data)
  
  if (password) {
    // رمزگذاری با Web Crypto API
    const encrypted = await encryptData(jsonString, password)
    return {
      data: encrypted,
      encrypted: true,
      size: new Blob([encrypted]).size,
    }
  }
  
  return {
    data: jsonString,
    encrypted: false,
    size: new Blob([jsonString]).size,
  }
}

// ==================== بازیابی Backup رمزگذاری شده ====================
export const restoreEncryptedBackup = async (encryptedData, password) => {
  try {
    const decrypted = await decryptData(encryptedData, password)
    const parsed = JSON.parse(decrypted)
    
    if (!parsed.data || parsed.appName !== 'Masterline') {
      throw new Error('فایل نامعتبر است')
    }
    
    return parsed.data
  } catch (err) {
    throw new Error('رمز عبور اشتباه است یا فایل خراب است')
  }
}

// ==================== توابع رمزگذاری ====================
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
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const calculateHealthScore = (issues, warnings) => {
  let score = 100
  score -= issues.length * 20
  score -= warnings.length * 5
  return Math.max(0, score)
}

// ==================== ثبت تاریخ تغییرات ====================
export const trackDatabaseChange = () => {
  const now = new Date().toISOString()
  localStorage.setItem('masterline-storage-last-modified', now)
  
  if (!localStorage.getItem('masterline-storage-first-entry')) {
    localStorage.setItem('masterline-storage-first-entry', now)
  }
}