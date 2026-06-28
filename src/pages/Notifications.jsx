import { useState } from 'react'
import { 
  Bell, BellOff, CheckCircle, XCircle, Trash2, 
  Settings as SettingsIcon, Volume2, VolumeX,
  Clock, Calendar, Target, CreditCard, Sparkles,
  Shield, Moon, Sun, TestTube
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Switch } from '../components/ui/switch'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import Toast from '../components/ui/toast'
import { useNotifications } from '../hooks/useNotifications'

export default function Notifications() {
  const {
    notificationHistory,
    notificationSettings,
    unreadCount,
    loading,
    error,
    sendNotification,
    markAsRead,
    markAllRead,
    clearHistory,
    deleteNotification,
    testNotification,
    updateSettings,
  } = useNotifications()
  
  const [toast, setToast] = useState(null)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [testTitle, setTestTitle] = useState('')
  const [testBody, setTestBody] = useState('')
  const [showTestDialog, setShowTestDialog] = useState(false)
  
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }
  
  const handleSendTest = async () => {
    try {
      await sendNotification(testTitle || 'تست نوتیفیکیشن', testBody || 'این یک نوتیفیکیشن تستی است')
      showToast('نوتیفیکیشن ارسال شد')
      setShowTestDialog(false)
      setTestTitle('')
      setTestBody('')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }
  
  const handleClearHistory = () => {
    clearHistory()
    showToast('تاریخچه پاک شد')
    setShowClearDialog(false)
  }
  
  const getCategoryIcon = (type) => {
    switch (type) {
      case 'loan': return <CreditCard className="w-4 h-4" />
      case 'subscription': return <Calendar className="w-4 h-4" />
      case 'goal': return <Target className="w-4 h-4" />
      case 'reminder': return <Clock className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }
  
  const getCategoryColor = (type) => {
    switch (type) {
      case 'loan': return 'bg-red-500/15 text-red-400 border-red-500/40'
      case 'subscription': return 'bg-blue-500/15 text-blue-400 border-blue-500/40'
      case 'goal': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
      case 'reminder': return 'bg-amber-500/15 text-amber-400 border-amber-500/40'
      default: return 'bg-slate-500/15 text-slate-400 border-slate-500/40'
    }
  }
  
  const getCategoryName = (type) => {
    switch (type) {
      case 'loan': return 'وام'
      case 'subscription': return 'اشتراک'
      case 'goal': return 'هدف'
      case 'reminder': return 'یادآور'
      default: return 'عمومی'
    }
  }
  
  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      
      if (diffMins < 1) return 'همین الان'
      if (diffMins < 60) return `${diffMins} دقیقه پیش`
      if (diffHours < 24) return `${diffHours} ساعت پیش`
      if (diffDays < 7) return `${diffDays} روز پیش`
      
      return date.toLocaleString('fa-IR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return new Date(timestamp).toLocaleString('fa-IR')
    }
  }
  
  return (
    <div className="p-8 space-y-8 bg-grid-ultra min-h-screen overflow-y-auto custom-scrollbar-ultra" dir="rtl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* هدر */}
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center glow-amber-ultra animate-float">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gradient-ultra">نوتیفیکیشن‌ها</h1>
              <p className="text-base text-slate-400 mt-1">
                مدیریت اعلان‌ها و یادآوری‌ها
                {unreadCount > 0 && (
                  <Badge className="mr-2 bg-red-500/20 text-red-400 border-red-500/40">
                    {unreadCount} خوانده نشده
                  </Badge>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setShowTestDialog(true)}
              className="btn-ultra btn-ultra-secondary"
            >
              <TestTube className="w-5 h-5" />
              تست نوتیفیکیشن
            </Button>
            {unreadCount > 0 && (
              <Button
                onClick={markAllRead}
                className="btn-ultra btn-ultra-primary"
              >
                <CheckCircle className="w-5 h-5" />
                علامت‌گذاری همه به عنوان خوانده شده
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* تنظیمات نوتیفیکیشن */}
      <Card className="card-ultra animate-fade-in-up delay-100">
        <CardHeader>
          <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-purple-400" />
            تنظیمات نوتیفیکیشن
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          {/* وام‌ها */}
          <div className="p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-red-500/15 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-white font-bold">وام‌ها و بدهی‌ها</p>
                  <p className="text-xs text-slate-400">یادآوری سررسید قسط‌ها</p>
                </div>
              </div>
              <Switch
                checked={notificationSettings.loans.enabled}
                onCheckedChange={(v) => updateSettings({
                  loans: { ...notificationSettings.loans, enabled: v }
                })}
              />
            </div>
            {notificationSettings.loans.enabled && (
              <div className="flex gap-2 flex-wrap">
                {notificationSettings.loans.beforeDays.map((day, i) => (
                  <Badge key={i} className="bg-red-500/15 text-red-400 border-red-500/40">
                    {day === 0 ? 'روز سررسید' : `${day} روز قبل`}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* اشتراک‌ها */}
          <div className="p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-bold">اشتراک‌ها</p>
                  <p className="text-xs text-slate-400">یادآوری تمدید اشتراک‌ها</p>
                </div>
              </div>
              <Switch
                checked={notificationSettings.subscriptions.enabled}
                onCheckedChange={(v) => updateSettings({
                  subscriptions: { ...notificationSettings.subscriptions, enabled: v }
                })}
              />
            </div>
            {notificationSettings.subscriptions.enabled && (
              <div className="flex gap-2 flex-wrap">
                {notificationSettings.subscriptions.beforeDays.map((day, i) => (
                  <Badge key={i} className="bg-blue-500/15 text-blue-400 border-blue-500/40">
                    {day === 0 ? 'روز تمدید' : `${day} روز قبل`}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* اهداف */}
          <div className="p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <Target className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-bold">اهداف مالی</p>
                  <p className="text-xs text-slate-400">اطلاع از پیشرفت اهداف</p>
                </div>
              </div>
              <Switch
                checked={notificationSettings.goals.enabled}
                onCheckedChange={(v) => updateSettings({
                  goals: { ...notificationSettings.goals, enabled: v }
                })}
              />
            </div>
            {notificationSettings.goals.enabled && (
              <div className="flex gap-2 flex-wrap">
                {notificationSettings.goals.milestones.map((milestone, i) => (
                  <Badge key={i} className="bg-emerald-500/15 text-emerald-400 border-emerald-500/40">
                    {milestone}%
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* یادآورها */}
          <div className="p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-bold">یادآورها</p>
                  <p className="text-xs text-slate-400">یادآوری رویدادها</p>
                </div>
              </div>
              <Switch
                checked={notificationSettings.reminders.enabled}
                onCheckedChange={(v) => updateSettings({
                  reminders: { ...notificationSettings.reminders, enabled: v }
                })}
              />
            </div>
          </div>
          
          {/* Do Not Disturb */}
          <div className="p-5 rounded-2xl bg-slate-800/50 border-2 border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-purple-500/15 flex items-center justify-center">
                  {notificationSettings.doNotDisturb.enabled ? (
                    <Moon className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-purple-400" />
                  )}
                </div>
                <div>
                  <p className="text-white font-bold">حالت سکوت</p>
                  <p className="text-xs text-slate-400">عدم ارسال نوتیفیکیشن در ساعات خاص</p>
                </div>
              </div>
              <Switch
                checked={notificationSettings.doNotDisturb.enabled}
                onCheckedChange={(v) => updateSettings({
                  doNotDisturb: { ...notificationSettings.doNotDisturb, enabled: v }
                })}
              />
            </div>
            {notificationSettings.doNotDisturb.enabled && (
              <div className="mt-4 flex gap-4 items-center">
                <div className="flex-1">
                  <p className="text-xs text-slate-400 mb-2">از ساعت</p>
                  <Input
                    type="time"
                    value={notificationSettings.doNotDisturb.start}
                    onChange={(e) => updateSettings({
                      doNotDisturb: { ...notificationSettings.doNotDisturb, start: e.target.value }
                    })}
                    className="input-ultra"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-400 mb-2">تا ساعت</p>
                  <Input
                    type="time"
                    value={notificationSettings.doNotDisturb.end}
                    onChange={(e) => updateSettings({
                      doNotDisturb: { ...notificationSettings.doNotDisturb, end: e.target.value }
                    })}
                    className="input-ultra"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* تاریخچه نوتیفیکیشن‌ها */}
      <Card className="card-ultra animate-fade-in-up delay-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <Bell className="w-6 h-6 text-amber-400" />
              تاریخچه نوتیفیکیشن‌ها
            </CardTitle>
            {notificationHistory.length > 0 && (
              <Button
                onClick={() => setShowClearDialog(true)}
                variant="ghost"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-5 h-5 ml-2" />
                پاک‌سازی تاریخچه
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {notificationHistory.length === 0 ? (
            <div className="empty-state-ultra py-12">
              <BellOff className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">هنوز نوتیفیکیشنی دریافت نکرده‌اید</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notificationHistory.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-5 rounded-2xl border-2 transition-all ${
                    notif.read 
                      ? 'bg-slate-800/30 border-slate-700/50' 
                      : 'bg-slate-800/50 border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCategoryColor(notif.type)}`}>
                      {getCategoryIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-white font-bold mb-1">{notif.title}</h3>
                          <p className="text-slate-400 text-sm">{notif.body}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(notif.timestamp)}
                            </span>
                            <Badge className={`${getCategoryColor(notif.type)} text-xs`}>
                              {getCategoryName(notif.type)}
                            </Badge>
                            {!notif.read && (
                              <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/40 text-xs">
                                جدید
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!notif.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notif.id)}
                              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notif.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog تست نوتیفیکیشن */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="card-ultra text-white">
          <DialogHeader>
            <DialogTitle className="text-right text-2xl font-black flex items-center gap-2">
              <TestTube className="w-7 h-7 text-amber-400" />
              تست نوتیفیکیشن
            </DialogTitle>
            <DialogDescription className="text-right text-slate-400">
              یک نوتیفیکیشن تستی ارسال کنید
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <p className="text-sm text-slate-400 mb-2">عنوان</p>
              <Input
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="عنوان نوتیفیکیشن..."
                className="input-ultra"
              />
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-2">متن</p>
              <Input
                value={testBody}
                onChange={(e) => setTestBody(e.target.value)}
                placeholder="متن نوتیفیکیشن..."
                className="input-ultra"
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button onClick={() => setShowTestDialog(false)} className="btn-ultra btn-ultra-secondary">
              انصراف
            </Button>
            <Button onClick={handleSendTest} className="btn-ultra btn-ultra-primary">
              <Bell className="w-5 h-5" />
              ارسال تست
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog پاک‌سازی */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent className="card-ultra text-white">
          <DialogHeader>
            <DialogTitle className="text-right text-2xl font-black flex items-center gap-2">
              <Trash2 className="w-7 h-7 text-red-400" />
              پاک‌سازی تاریخچه
            </DialogTitle>
            <DialogDescription className="text-right text-slate-400">
              آیا مطمئن هستید که می‌خواهید تمام تاریخچه را پاک کنید؟
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2">
            <Button onClick={() => setShowClearDialog(false)} className="btn-ultra btn-ultra-secondary">
              انصراف
            </Button>
            <Button onClick={handleClearHistory} className="btn-ultra btn-ultra-danger">
              <Trash2 className="w-5 h-5" />
              پاک‌سازی
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}