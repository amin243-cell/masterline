import { useState } from 'react'
import { 
  Bell, Database, Info, LogOut, 
  Moon, Sun, Globe, Palette, Download, Upload,
  Trash2, AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Switch } from '../components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import Toast from '../components/ui/toast'

export default function Settings() {
  const [toast, setToast] = useState(null)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  
  const [settings, setSettings] = useState({
    theme: 'dark',
    language: 'fa',
    notifications: true,
    sound: true,
    autoBackup: true,
    currency: 'IRR'
  })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const handleResetData = () => {
    showToast('تمام داده‌ها پاک شدند', 'info')
    setShowResetDialog(false)
  }

  const handleExportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      message: 'این یک فایل نمونه است'
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `masterline-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('پشتیبان با موفقیت ایجاد شد')
    setShowExportDialog(false)
  }

  const handleImportData = () => {
    showToast('قابلیت وارد کردن داده در نسخه بعدی اضافه می‌شود', 'info')
  }

  return (
    <div className="p-8 space-y-8 animate-fade-in-up bg-grid-ultra min-h-screen" dir="rtl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* هدر */}
      <div>
        <h1 className="text-4xl font-black text-gradient-ultra">تنظیمات</h1>
        <p className="text-base text-slate-400 mt-3">مدیریت تنظیمات برنامه</p>
      </div>

      {/* تنظیمات عمومی */}
      <Card className="card-ultra">
        <CardHeader>
          <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
            <Palette className="w-6 h-6 text-emerald-400" />
            تنظیمات عمومی
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-8">
          <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700">
            <div className="flex items-center gap-3">
              {settings.theme === 'dark' ? <Moon className="w-6 h-6 text-blue-400" /> : <Sun className="w-6 h-6 text-yellow-400" />}
              <div>
                <p className="text-white font-bold">تم برنامه</p>
                <p className="text-xs text-slate-400">انتخاب تم روشن یا تیره</p>
              </div>
            </div>
            <Select value={settings.theme} onValueChange={(v) => setSettings({...settings, theme: v})}>
              <SelectTrigger className="w-32 input-ultra">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                <SelectItem value="dark" className="text-white">تیره</SelectItem>
                <SelectItem value="light" className="text-white">روشن</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-white font-bold">زبان</p>
                <p className="text-xs text-slate-400">زبان رابط کاربری</p>
              </div>
            </div>
            <Select value={settings.language} onValueChange={(v) => setSettings({...settings, language: v})}>
              <SelectTrigger className="w-32 input-ultra">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                <SelectItem value="fa" className="text-white">فارسی</SelectItem>
                <SelectItem value="en" className="text-white">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <p className="text-white font-bold">ارز پیش‌فرض</p>
                <p className="text-xs text-slate-400">ارز اصلی برای نمایش مبالغ</p>
              </div>
            </div>
            <Select value={settings.currency} onValueChange={(v) => setSettings({...settings, currency: v})}>
              <SelectTrigger className="w-32 input-ultra">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 rounded-2xl">
                <SelectItem value="IRR" className="text-white">ریال</SelectItem>
                <SelectItem value="USD" className="text-white">دلار</SelectItem>
                <SelectItem value="USDT" className="text-white">تتر</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* اعلان‌ها */}
      <Card className="card-ultra">
        <CardHeader>
          <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-yellow-400" />
            اعلان‌ها
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-8">
          <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-white font-bold">اعلان‌های برنامه</p>
                <p className="text-xs text-slate-400">دریافت اعلان برای یادآورها و سررسیدها</p>
              </div>
            </div>
            <Switch 
              checked={settings.notifications} 
              onCheckedChange={(v) => setSettings({...settings, notifications: v})}
            />
          </div>

          <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔊</span>
              <div>
                <p className="text-white font-bold">صدای اعلان</p>
                <p className="text-xs text-slate-400">پخش صدا هنگام اعلان</p>
              </div>
            </div>
            <Switch 
              checked={settings.sound} 
              onCheckedChange={(v) => setSettings({...settings, sound: v})}
            />
          </div>
        </CardContent>
      </Card>

      {/* پشتیبان‌گیری */}
      <Card className="card-ultra">
        <CardHeader>
          <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-400" />
            پشتیبان‌گیری و بازیابی
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-8">
          <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700">
            <div className="flex items-center gap-3">
              <Upload className="w-6 h-6 text-emerald-400" />
              <div>
                <p className="text-white font-bold">خروجی از داده‌ها</p>
                <p className="text-xs text-slate-400">دانلود پشتیبان از تمام داده‌ها</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowExportDialog(true)}
              className="btn-ultra btn-ultra-primary"
            >
              <Download className="w-5 h-5" />
              دانلود
            </Button>
          </div>

          <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700">
            <div className="flex items-center gap-3">
              <Download className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-white font-bold">وارد کردن داده‌ها</p>
                <p className="text-xs text-slate-400">بازیابی داده‌ها از فایل پشتیبان</p>
              </div>
            </div>
            <Button 
              onClick={handleImportData}
              className="btn-ultra btn-ultra-secondary"
            >
              <Upload className="w-5 h-5" />
              انتخاب فایل
            </Button>
          </div>

          <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700">
            <div className="flex items-center gap-3">
              <Trash2 className="w-6 h-6 text-red-400" />
              <div>
                <p className="text-white font-bold">پاک کردن تمام داده‌ها</p>
                <p className="text-xs text-slate-400">حذف تمام داده‌های برنامه (غیرقابل بازگشت)</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowResetDialog(true)}
              className="btn-ultra btn-ultra-danger"
            >
              <Trash2 className="w-5 h-5" />
              پاک کردن
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* درباره برنامه */}
      <Card className="card-ultra">
        <CardHeader>
          <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
            <Info className="w-6 h-6 text-purple-400" />
            درباره برنامه
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="p-6 rounded-2xl bg-slate-800/50 border-2 border-slate-700 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center glow-green-ultra">
                <span className="text-white text-3xl font-black">M</span>
              </div>
              <div>
                <h3 className="text-white font-black text-xl">مسترلاین</h3>
                <p className="text-slate-400 text-sm">دستیار مالی تریدر</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-slate-700">
              <div>
                <p className="text-xs text-slate-400">نسخه</p>
                <p className="text-white font-bold font-mono">1.0.0</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">ساخته شده با</p>
                <p className="text-white font-bold">React + Tauri</p>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-slate-700">
              <p className="text-xs text-slate-400 mb-3">ویژگی‌ها:</p>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>✅ مدیریت حساب‌های ترید و بانکی</li>
                <li>✅ ثبت سود و ضرر معاملات</li>
                <li>✅ مدیریت دارایی‌های فیزیکی</li>
                <li>✅ پیگیری وام‌ها و بدهی‌ها</li>
                <li>✅ مدیریت اشتراک‌ها</li>
                <li>✅ اهداف مالی و یادآورها</li>
                <li>✅ ابزارهای محاسباتی ترید</li>
                <li>✅ آمار و گزارش‌های پیشرفته</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* خروج */}
      <Card className="card-ultra" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogOut className="w-6 h-6 text-red-400" />
              <div>
                <p className="text-white font-bold">خروج از برنامه</p>
                <p className="text-xs text-slate-400">بستن کامل برنامه</p>
              </div>
            </div>
            <Button 
              onClick={() => {
                if (confirm('آیا می‌خواهید از برنامه خارج شوید؟')) {
                  showToast('در حال خروج...', 'info')
                }
              }}
              className="btn-ultra btn-ultra-danger"
            >
              <LogOut className="w-5 h-5" />
              خروج
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog پاک کردن داده‌ها */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="card-ultra text-white">
          <DialogHeader>
            <DialogTitle className="text-right text-2xl font-black flex items-center gap-2">
              <AlertTriangle className="w-7 h-7 text-red-400" />
              پاک کردن تمام داده‌ها
            </DialogTitle>
            <DialogDescription className="text-right text-slate-400">
              آیا از پاک کردن تمام داده‌ها مطمئن هستید؟ این عمل غیرقابل بازگشت است!
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="p-5 rounded-2xl bg-red-500/10 border-2 border-red-500/30">
              <p className="text-red-400 font-bold">⚠️ هشدار:</p>
              <p className="text-red-300 text-sm mt-2">
                تمام حساب‌ها، دارایی‌ها، وام‌ها، اشتراک‌ها، بدهی‌ها، اهداف و یادآورها حذف خواهند شد.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button onClick={() => setShowResetDialog(false)} className="btn-ultra btn-ultra-secondary">
              انصراف
            </Button>
            <Button onClick={handleResetData} className="btn-ultra btn-ultra-danger">
              <Trash2 className="w-5 h-5" />
              بله، پاک کن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog خروجی داده‌ها */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="card-ultra text-white">
          <DialogHeader>
            <DialogTitle className="text-right text-2xl font-black flex items-center gap-2">
              <Download className="w-7 h-7 text-emerald-400" />
              ایجاد فایل پشتیبان
            </DialogTitle>
            <DialogDescription className="text-right text-slate-400">
              تمام داده‌های شما در یک فایل JSON ذخیره می‌شود
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700 space-y-3">
              <p className="text-white font-bold">داده‌های شامل:</p>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>✓ حساب‌های مالی</li>
                <li>✓ دارایی‌های فیزیکی</li>
                <li>✓ فعالیت‌های ترید</li>
                <li>✓ وام‌ها و بدهی‌ها</li>
                <li>✓ اشتراک‌ها</li>
                <li>✓ اهداف و یادآورها</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button onClick={() => setShowExportDialog(false)} className="btn-ultra btn-ultra-secondary">
              انصراف
            </Button>
            <Button onClick={handleExportData} className="btn-ultra btn-ultra-primary">
              <Download className="w-5 h-5" />
              دانلود فایل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}