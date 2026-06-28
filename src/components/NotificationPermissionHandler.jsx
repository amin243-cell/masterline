import { useEffect, useState } from 'react'
import { Bell, BellOff, X, Settings as SettingsIcon } from 'lucide-react'
import { Button } from './ui/button'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

export default function NotificationPermissionHandler() {
  const navigate = useNavigate()
  const [showBanner, setShowBanner] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState('default')
  
  const settings = useStore((state) => state.settings)
  const updateSettings = useStore((state) => state.updateSettings)

  useEffect(() => {
    // بررسی وضعیت فعلی
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission)
      
      // اگه مجوز داده نشده و کاربر نوتیفیکیشن‌ها رو فعال کرده
      if (Notification.permission === 'default' && settings.notifications) {
        // درخواست مجوز بعد از ۲ ثانیه
        const timer = setTimeout(() => {
          requestPermission()
        }, 2000)
        return () => clearTimeout(timer)
      }
      
      // اگه مجوز رد شده، بنر نشون بده
      if (Notification.permission === 'denied' && settings.notifications) {
        setShowBanner(true)
      }
    }
  }, [settings.notifications])

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('مرورگر از نوتیفیکیشن پشتیبانی نمی‌کند')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setPermissionStatus(permission)
      
      if (permission === 'granted') {
        console.log('✅ مجوز نوتیفیکیشن داده شد')
        setShowBanner(false)
      } else if (permission === 'denied') {
        console.warn('⚠️ مجوز نوتیفیکیشن رد شد')
        setShowBanner(true)
      }
    } catch (error) {
      console.error('خطا در درخواست مجوز:', error)
    }
  }

  const handleGoToSettings = () => {
    navigate('/settings')
    setShowBanner(false)
  }

  // اگه مجوز داده شده یا کاربر نوتیفیکیشن‌ها رو غیرفعال کرده، چیزی نشون نده
  if (permissionStatus === 'granted' || !settings.notifications) {
    return null
  }

  // بنر هشدار
  if (showBanner && permissionStatus === 'denied') {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-in-up">
        <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 backdrop-blur-xl shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <BellOff className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold mb-1">نوتیفیکیشن‌ها غیرفعال هستند</h3>
              <p className="text-slate-300 text-sm mb-3">
                برای دریافت یادآوری‌ها و اعلان‌ها، لطفاً نوتیفیکیشن‌ها را در تنظیمات مرورگر فعال کنید.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleGoToSettings}
                  className="btn-ultra btn-ultra-primary"
                  size="sm"
                >
                  <SettingsIcon className="w-4 h-4" />
                  رفتن به تنظیمات
                </Button>
                <Button
                  onClick={() => setShowBanner(false)}
                  className="btn-ultra btn-ultra-ghost"
                  size="sm"
                >
                  بعداً
                </Button>
              </div>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // درخواست مجوز اولیه
  if (permissionStatus === 'default') {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-in-up">
        <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-blue-500/20 border-2 border-blue-500/40 backdrop-blur-xl shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-blue-400 animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold mb-1">فعال‌سازی نوتیفیکیشن‌ها</h3>
              <p className="text-slate-300 text-sm mb-3">
                آیا می‌خواهید یادآوری‌ها و اعلان‌های مهم را دریافت کنید؟
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={requestPermission}
                  className="btn-ultra btn-ultra-primary"
                  size="sm"
                >
                  <Bell className="w-4 h-4" />
                  فعال‌سازی
                </Button>
                <Button
                  onClick={() => {
                    updateSettings({ notifications: false })
                    setShowBanner(false)
                  }}
                  className="btn-ultra btn-ultra-ghost"
                  size="sm"
                >
                  فعلاً نه
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}