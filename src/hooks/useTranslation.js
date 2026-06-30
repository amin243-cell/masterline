import { useMemo, useCallback } from 'react'
import useStore from '../store/useStore'
import { translations } from '../i18n/translations'

export function useTranslation() {
  // ==================== دریافت از استور ====================
  const settings = useStore((state) => state.settings)
  const updateSettings = useStore((state) => state.updateSettings)
  
  // استخراج language با مقدار پیش‌فرض
  const language = settings?.language || 'fa'

  // ==================== تابع ترجمه اصلی ====================
  const t = useCallback((key, params = {}) => {
    if (!key) return ''

    const keys = key.split('.')
    let value = translations[language]
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        value = undefined
        break
      }
    }

    // اگر ترجمه پیدا نشد، از فارسی استفاده کن
    if (value === undefined || value === null) {
      let fallbackValue = translations['fa']
      for (const k of keys) {
        if (fallbackValue && typeof fallbackValue === 'object') {
          fallbackValue = fallbackValue[k]
        } else {
          fallbackValue = undefined
          break
        }
      }
      value = fallbackValue || key
    }

    // اگر value یک شیء بود، کلید را برگردان (رفع خطای settings.backup)
    if (typeof value === 'object' && value !== null) {
      // اگر key "settings.backup" است، مقدار پیش‌فرض فارسی را برگردان
      if (key === 'settings.backup') {
        return 'پشتیبان‌گیری و بازیابی'
      }
      if (key === 'settings.backupSubtitle') {
        return 'مدیریت پشتیبان‌گیری و بازیابی اطلاعات'
      }
      // برای سایر keys، کلید را برگردان
      return key
    }

    // جایگزینی پارامترها
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      let result = value
      Object.keys(params).forEach(paramKey => {
        result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), params[paramKey])
      })
      return result
    }

    return typeof value === 'string' ? value : key
  }, [language])

  // ==================== تابع تغییر زبان ====================
  const changeLanguage = useCallback((newLanguage) => {
    if (translations[newLanguage]) {
      updateSettings({ language: newLanguage })
      return true
    }
    return false
  }, [updateSettings])

  // ==================== لیست زبان‌ها ====================
  const availableLanguages = useMemo(() => {
    return Object.keys(translations).map(code => ({
      code,
      name: translations[code]?._name || code,
      nativeName: translations[code]?._nativeName || code,
      dir: translations[code]?._dir || 'rtl',
    }))
  }, [])

  // ==================== اطلاعات زبان فعلی ====================
  const currentLanguage = useMemo(() => {
    return availableLanguages.find(lang => lang.code === language) || availableLanguages[0]
  }, [language, availableLanguages])

  // ==================== ترجمه با پشتیبانی از جمع ====================
  const tPlural = useCallback((key, count, params = {}) => {
    const translation = t(key, params)
    if (typeof translation !== 'string') return String(translation || key)

    const pluralKey = `${key}_plural`
    const pluralTranslation = t(pluralKey, params)
    
    if (pluralTranslation !== pluralKey && typeof pluralTranslation === 'string') {
      if (count > 1) {
        return pluralTranslation.replace('{{count}}', count)
      }
      return translation.replace('{{count}}', count)
    }

    return translation.replace('{{count}}', count)
  }, [t])

  // ==================== ترجمه با پشتیبانی از جنسیت ====================
  const tGender = useCallback((key, gender = 'male', params = {}) => {
    const maleKey = `${key}_male`
    const femaleKey = `${key}_female`
    
    if (gender === 'female' && t(femaleKey) !== femaleKey) {
      return t(femaleKey, params)
    }
    if (gender === 'male' && t(maleKey) !== maleKey) {
      return t(maleKey, params)
    }
    return t(key, params)
  }, [t])

  // ==================== ترجمه با پشتیبانی از HTML ====================
  const tHtml = useCallback((key, params = {}) => {
    const result = t(key, params)
    if (typeof result === 'string') {
      return { __html: result }
    }
    return { __html: '' }
  }, [t])

  // ==================== ترجمه تاریخ ====================
  const tDate = useCallback((date, format = 'short') => {
    if (!date) return ''
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) return ''
    
    const options = {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
      time: {
        hour: '2-digit',
        minute: '2-digit',
      },
    }
    
    const locale = language === 'fa' ? 'fa-IR' : 'en-US'
    return dateObj.toLocaleDateString(locale, options[format] || options.short)
  }, [language])

  // ==================== ترجمه اعداد ====================
  const tNumber = useCallback((number) => {
    if (number === undefined || number === null) return ''
    
    const num = typeof number === 'string' ? parseFloat(number) : number
    if (isNaN(num)) return String(number)
    
    if (language === 'fa') {
      const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
      return num.toLocaleString('fa-IR').replace(/\d/g, (d) => persianDigits[parseInt(d)])
    }
    
    return num.toLocaleString('en-US')
  }, [language])

  // ==================== ترجمه پول ====================
  const tCurrency = useCallback((amount, currency = 'IRR') => {
    const currencySymbols = {
      IRR: 'ریال',
      USD: '$',
      EUR: '€',
      GBP: '£',
      USDT: 'USDT',
    }
    
    const symbol = currencySymbols[currency] || currency
    const formatted = tNumber(amount)
    
    if (language === 'fa') {
      return `${formatted} ${symbol}`
    }
    return `${symbol}${formatted}`
  }, [tNumber, language])

  // ==================== زمان نسبی ====================
  const tRelativeTime = useCallback((date) => {
    if (!date) return ''
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) return ''
    
    const now = new Date()
    const diffMs = now.getTime() - dateObj.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)
    const diffWeek = Math.floor(diffDay / 7)
    const diffMonth = Math.floor(diffDay / 30)
    const diffYear = Math.floor(diffDay / 365)
    
    if (diffSec < 60) {
      return t('time.justNow')
    } else if (diffMin < 60) {
      return tPlural('time.minutesAgo', diffMin)
    } else if (diffHour < 24) {
      return tPlural('time.hoursAgo', diffHour)
    } else if (diffDay < 7) {
      return tPlural('time.daysAgo', diffDay)
    } else if (diffWeek < 4) {
      return tPlural('time.weeksAgo', diffWeek)
    } else if (diffMonth < 12) {
      return tPlural('time.monthsAgo', diffMonth)
    } else {
      return tPlural('time.yearsAgo', diffYear)
    }
  }, [t, tPlural])

  // ==================== خروجی ====================
  return {
    t,
    tPlural,
    tGender,
    tHtml,
    tDate,
    tNumber,
    tCurrency,
    tRelativeTime,
    
    language,
    changeLanguage,
    availableLanguages,
    currentLanguage,
    
    isRTL: currentLanguage?.dir === 'rtl',
    isLTR: currentLanguage?.dir !== 'rtl',
  }
}