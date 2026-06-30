// src/pages/Notifications.jsx
import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { 
  Bell, BellOff, Check, CheckCheck, Trash2, X,
  Clock, AlertCircle, Filter, Search, ChevronDown,
  DollarSign, CreditCard, Target, Bell as BellIcon,
  Calendar, Settings, SlidersHorizontal, Plus,
  Zap, Repeat, CalendarPlus, MoreVertical, Eye,
  EyeOff, Archive, RefreshCw, ArrowRight
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card'
import { Button, ButtonGroup } from '../components/ui/button'
import { Input, InputGroup } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Switch, SwitchItem, SwitchGroup } from '../components/ui/switch'
import { useNotifications } from '../hooks/useNotifications'
import { useTranslation } from '../hooks/useTranslation'
import { useToast } from '../components/ui/toast'
import { formatRelativeTime, formatDate, cn } from '../utils/helpers'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogSection,
  DialogActions,
} from '../components/ui/dialog'

// ============ کامپوننت جستجو با دیبونس دستی ============
const SearchInput = ({ placeholder, onSearch, className, debounce = 300 }) => {
  const [value, setValue] = useState('')
  const timeoutRef = useRef(null)

  const handleChange = (e) => {
    const newValue = e.target.value
    setValue(newValue)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      onSearch(newValue)
    }, debounce)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="pr-10 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-emerald-500/50"
      />
    </div>
  )
}

// ============ کامپوننت تنظیمات یادآورها ============
const ReminderSettings = ({ settings, updateSettings, onClose }) => {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold text-lg">تنظیمات یادآورها</h3>
        <Button variant="ghost" size="sm" icon={X} onClick={onClose} />
      </div>

      <SwitchGroup>
        <SwitchItem
          checked={settings.loans?.enabled !== false}
          onCheckedChange={(v) => updateSettings({ loans: { ...settings.loans, enabled: v } })}
          label="یادآورهای وام"
          description={`${settings.loans?.beforeDays?.join('، ') || '3، 1، 0'} روز قبل از سررسید`}
          icon={DollarSign}
        />
        <SwitchItem
          checked={settings.subscriptions?.enabled !== false}
          onCheckedChange={(v) => updateSettings({ subscriptions: { ...settings.subscriptions, enabled: v } })}
          label="یادآورهای اشتراک"
          description={`${settings.subscriptions?.beforeDays?.join('، ') || '7، 3، 0'} روز قبل از تمدید`}
          icon={CreditCard}
        />
        <SwitchItem
          checked={settings.goals?.enabled !== false}
          onCheckedChange={(v) => updateSettings({ goals: { ...settings.goals, enabled: v } })}
          label="یادآورهای اهداف"
          description={`در ${settings.goals?.milestones?.join('٪، ') || '25، 50، 75، 100'}٪ پیشرفت`}
          icon={Target}
        />
        <SwitchItem
          checked={settings.general?.enabled !== false}
          onCheckedChange={(v) => updateSettings({ general: { ...settings.general, enabled: v } })}
          label="یادآورهای عمومی"
          description={`${settings.general?.beforeMinutes?.join('، ') || '60، 30، 0'} دقیقه قبل`}
          icon={BellIcon}
        />
      </SwitchGroup>

      {/* حالت مزاحمت نشوید */}
      <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <BellOff className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">حالت مزاحمت نشوید</p>
              <p className="text-xs text-slate-400">غیرفعال کردن همه اعلان‌ها در ساعات مشخص</p>
            </div>
          </div>
          <Switch 
            checked={settings.dnd_enabled || false}
            onCheckedChange={(v) => updateSettings({ dnd_enabled: v })}
            variant="purple"
          />
        </div>
        {(settings.dnd_enabled) && (
          <div className="mt-3 flex items-center gap-3">
            <Input
              type="time"
              value={settings.dnd_start || '23:00'}
              onChange={(e) => updateSettings({ dnd_start: e.target.value })}
              className="w-28"
            />
            <span className="text-slate-400">تا</span>
            <Input
              type="time"
              value={settings.dnd_end || '08:00'}
              onChange={(e) => updateSettings({ dnd_end: e.target.value })}
              className="w-28"
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ============ کامپوننت اصلی ============
export default function Notifications() {
  const { t } = useTranslation()
  const { success, error } = useToast()
  const location = useLocation()
  
  const {
    loading,
    notifications,
    unreadCount,
    settings,
    markAsRead,
    clearHistory,
    deleteNotification,
    updateSettings,
    fetchNotifications,
    sendNotification,
  } = useNotifications()

  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [selectedNotifications, setSelectedNotifications] = useState([])
  const [isSelectMode, setIsSelectMode] = useState(false)
  
  // ============ ریست کردن state هنگام خروج از صفحه ============
  useEffect(() => {
    return () => {
      setShowSettings(false);
      setIsSelectMode(false);
      setSelectedNotifications([]);
    };
  }, []);

  // ============ بستن تنظیمات هنگام تغییر مسیر ============
  useEffect(() => {
    setShowSettings(false);
    setIsSelectMode(false);
    setSelectedNotifications([]);
  }, [location.pathname]);

  // ============ بارگذاری مجدد اعلان‌ها هنگام mount ============
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // ============ ایجاد اعلان‌های تست ============
  const handleCreateTestData = useCallback(async () => {
    const testNotifications = [
      { title: 'قسط وام', body: 'قسط وام شما ۳ روز دیگر سررسید است', type: 'loan', relatedId: 1, relatedType: 'loan' },
      { title: 'تمدید اشتراک', body: 'اشتراک شما ۷ روز دیگر تمدید می‌شود', type: 'subscription', relatedId: 2, relatedType: 'subscription' },
      { title: 'پیشرفت هدف', body: '۵۰٪ از هدف شما محقق شد', type: 'goal', relatedId: 3, relatedType: 'goal' },
      { title: 'یادآور عمومی', body: 'زمان جلسه فردا ساعت ۱۰ صبح', type: 'general', relatedId: null, relatedType: null },
    ];
    
    try {
      for (const notif of testNotifications) {
        await sendNotification(notif.title, notif.body, notif.type, notif.relatedId, notif.relatedType, null);
      }
      success('۴ اعلان تست ایجاد شد');
      await fetchNotifications();
    } catch (err) {
      error('خطا در ایجاد اعلان‌های تست');
      console.error(err);
    }
  }, [sendNotification, fetchNotifications, success, error]);

  // فیلتر کردن اعلان‌ها
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications]

    if (filter !== 'all') {
      if (filter === 'unread') {
        filtered = filtered.filter(n => !n.is_read)
      } else {
        filtered = filtered.filter(n => n.notification_type === filter)
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(n => 
        n.title?.toLowerCase().includes(query) ||
        n.body?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [notifications, filter, searchQuery])

  // دسته‌بندی بر اساس تاریخ
  const groupedNotifications = useMemo(() => {
    const groups = {}
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    filteredNotifications.forEach(notif => {
      const date = new Date(notif.created_at)
      let group = 'older'
      
      if (date >= today) {
        group = 'today'
      } else if (date >= yesterday) {
        group = 'yesterday'
      } else {
        group = 'older'
      }

      if (!groups[group]) groups[group] = []
      groups[group].push(notif)
    })

    return groups
  }, [filteredNotifications])

  const groupLabels = {
    today: 'امروز',
    yesterday: 'دیروز',
    older: 'قدیمی‌تر',
  }

  const getTypeIcon = useCallback((type) => {
    switch (type) {
      case 'loan': return <DollarSign className="w-4 h-4 text-red-400" />
      case 'subscription': return <CreditCard className="w-4 h-4 text-blue-400" />
      case 'goal': return <Target className="w-4 h-4 text-emerald-400" />
      default: return <BellIcon className="w-4 h-4 text-yellow-400" />
    }
  }, [])

  const getTypeLabel = useCallback((type) => {
    switch (type) {
      case 'loan': return 'وام'
      case 'subscription': return 'اشتراک'
      case 'goal': return 'هدف'
      default: return 'عمومی'
    }
  }, [])

  const handleMarkAllRead = useCallback(async () => {
    try {
      const unreadNotifs = notifications.filter(n => !n.is_read)
      for (const notif of unreadNotifs) {
        await markAsRead(notif.id)
      }
      success('همه اعلان‌ها به عنوان خوانده‌شده علامت‌گذاری شدند')
    } catch (err) {
      error('خطا در علامت‌گذاری اعلان‌ها')
    }
  }, [notifications, markAsRead, success, error])

  const handleClearAll = useCallback(async () => {
    if (window.confirm('آیا از پاک‌سازی همه اعلان‌ها مطمئن هستید؟')) {
      try {
        await clearHistory()
        success('تاریخچه اعلان‌ها پاک شد')
      } catch (err) {
        error('خطا در پاک‌سازی اعلان‌ها')
      }
    }
  }, [clearHistory, success, error])

  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await markAsRead(id)
    } catch (err) {
      error('خطا در علامت‌گذاری اعلان')
    }
  }, [markAsRead, error])

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteNotification(id)
    } catch (err) {
      error('خطا در حذف اعلان')
    }
  }, [deleteNotification, error])

  const handleBulkDelete = useCallback(async () => {
    if (selectedNotifications.length === 0) return
    if (window.confirm(`آیا از حذف ${selectedNotifications.length} اعلان مطمئن هستید؟`)) {
      try {
        for (const id of selectedNotifications) {
          await deleteNotification(id)
        }
        setSelectedNotifications([])
        setIsSelectMode(false)
        success(`${selectedNotifications.length} اعلان حذف شدند`)
      } catch (err) {
        error('خطا در حذف اعلان‌ها')
      }
    }
  }, [selectedNotifications, deleteNotification, success, error])

  const handleBulkMarkRead = useCallback(async () => {
    try {
      for (const id of selectedNotifications) {
        await markAsRead(id)
      }
      setSelectedNotifications([])
      setIsSelectMode(false)
      success(`${selectedNotifications.length} اعلان به عنوان خوانده‌شده علامت‌گذاری شدند`)
    } catch (err) {
      error('خطا در علامت‌گذاری اعلان‌ها')
    }
  }, [selectedNotifications, markAsRead, success, error])

  const toggleSelect = useCallback((id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id))
    }
  }, [selectedNotifications, filteredNotifications])

  const filterOptions = useMemo(() => [
    { value: 'all', label: 'همه' },
    { value: 'unread', label: `خوانده‌نشده (${unreadCount})` },
    { value: 'loan', label: 'وام' },
    { value: 'subscription', label: 'اشتراک' },
    { value: 'goal', label: 'هدف' },
    { value: 'general', label: 'عمومی' },
  ], [unreadCount])

  return (
    <div className="p-8 space-y-6 bg-grid-ultra min-h-screen overflow-y-auto custom-scrollbar-ultra" dir="rtl">
      {/* ============ HEADER ============ */}
      <div className="animate-fade-in-up">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center animate-float">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gradient-ultra">اعلان‌ها و یادآورها</h1>
              <p className="text-base text-slate-400 mt-1">
                {loading ? 'در حال بارگذاری...' : (
                  unreadCount > 0 
                    ? `${unreadCount} اعلان خوانده‌نشده دارید`
                    : 'همه اعلان‌ها خوانده شده‌اند'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* دکمه تست */}
            <Button 
              variant="ghost" 
              size="sm"
              icon={Zap}
              onClick={handleCreateTestData}
              className="text-yellow-400 hover:text-yellow-300 border-yellow-500/30"
            >
              🧪 تست
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              icon={CheckCheck}
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || loading}
            >
              علامت‌گذاری همه
            </Button>
            <Button 
              variant="danger" 
              size="sm"
              icon={Trash2}
              onClick={handleClearAll}
              disabled={notifications.length === 0 || loading}
            >
              پاک‌سازی همه
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              icon={Settings}
              onClick={() => setShowSettings(!showSettings)}
            >
              تنظیمات
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={RefreshCw}
              onClick={fetchNotifications}
              disabled={loading}
              className={cn(loading && "animate-spin")}
            >
              بروزرسانی
            </Button>
          </div>
        </div>

        {/* فیلترها و جستجو */}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl p-1 border border-slate-700/50 overflow-x-auto">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                  filter === opt.value 
                    ? "bg-emerald-500/20 text-emerald-400" 
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <SearchInput
            placeholder="جستجو در اعلان‌ها..."
            onSearch={setSearchQuery}
            className="flex-1 min-w-[200px] max-w-sm"
            debounce={300}
          />

          {filteredNotifications.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              icon={isSelectMode ? EyeOff : Eye}
              onClick={() => {
                setIsSelectMode(!isSelectMode)
                setSelectedNotifications([])
              }}
            >
              {isSelectMode ? 'خروج از انتخاب' : 'انتخاب گروهی'}
            </Button>
          )}
        </div>
      </div>

      {/* ============ تنظیمات یادآورها ============ */}
      {showSettings && (
        <Card variant="ultra" className="animate-fade-in-up">
          <CardHeader 
            icon={SlidersHorizontal}
            title="تنظیمات یادآورها"
            description="مدیریت نحوه دریافت یادآورها"
            iconClassName="text-purple-400"
            action={
              <Button 
                variant="ghost" 
                size="sm" 
                icon={X} 
                onClick={() => setShowSettings(false)}
              />
            }
          />
          <CardContent>
            <ReminderSettings 
              settings={settings}
              updateSettings={updateSettings}
              onClose={() => setShowSettings(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* ============ انتخاب گروهی ============ */}
      {isSelectMode && selectedNotifications.length > 0 && (
        <Card variant="ultra" className="animate-fade-in-up border-emerald-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold">
                {selectedNotifications.length} اعلان انتخاب شده
              </span>
              <ButtonGroup spacing="sm">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  icon={CheckCheck}
                  onClick={handleBulkMarkRead}
                >
                  خوانده شد
                </Button>
                <Button 
                  size="sm" 
                  variant="danger" 
                  icon={Trash2}
                  onClick={handleBulkDelete}
                >
                  حذف
                </Button>
              </ButtonGroup>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============ لیست اعلان‌ها ============ */}
      {loading ? (
        <Card variant="glow" className="animate-fade-in-up">
          <CardContent className="p-12 text-center">
            <RefreshCw className="w-16 h-16 text-slate-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-bold text-white">در حال بارگذاری...</h3>
            <p className="text-slate-400 mt-2">لطفاً چند لحظه صبر کنید</p>
          </CardContent>
        </Card>
      ) : Object.keys(groupedNotifications).length === 0 ? (
        <Card variant="glow" className="animate-fade-in-up">
          <CardContent className="p-12 text-center">
            <BellOff className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white">هیچ اعلانی وجود ندارد</h3>
            <p className="text-slate-400 mt-2">برای تست، روی دکمه 🧪 تست کلیک کنید</p>
            <Button 
              variant="primary" 
              className="mt-4"
              icon={Zap}
              onClick={handleCreateTestData}
            >
              ایجاد اعلان تست
            </Button>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedNotifications).map(([group, notifications]) => (
          <div key={group} className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-400">{groupLabels[group]}</h2>
              {isSelectMode && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleSelectAll}
                >
                  {selectedNotifications.length === notifications.length 
                    ? 'لغو انتخاب همه' 
                    : 'انتخاب همه'}
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {notifications.map((notif) => (
                <Card 
                  key={notif.id} 
                  variant={notif.is_read ? 'default' : 'glow'}
                  className={cn(
                    "transition-all hover:border-emerald-500/30",
                    !notif.is_read && "border-emerald-500/30",
                    isSelectMode && "cursor-pointer",
                    selectedNotifications.includes(notif.id) && "border-emerald-500/50 bg-emerald-500/5"
                  )}
                  onClick={() => {
                    if (isSelectMode) {
                      toggleSelect(notif.id)
                    } else if (!notif.is_read) {
                      handleMarkAsRead(notif.id)
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* چک‌باکس */}
                      {isSelectMode && (
                        <div className="flex-shrink-0 mt-1">
                          <div className={cn(
                            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                            selectedNotifications.includes(notif.id)
                              ? "bg-emerald-500 border-emerald-500"
                              : "border-slate-600"
                          )}>
                            {selectedNotifications.includes(notif.id) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                      )}

                      {/* آیکون */}
                      <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center flex-shrink-0">
                        {getTypeIcon(notif.notification_type)}
                      </div>

                      {/* محتوا */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800/50 text-slate-400">
                            {getTypeLabel(notif.notification_type)}
                          </span>
                          {notif.related_id && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                              #{notif.related_id}
                            </span>
                          )}
                          {!notif.is_read && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                              جدید
                            </span>
                          )}
                        </div>
                        <h4 className={cn(
                          "font-bold text-white mt-1",
                          !notif.is_read && "text-emerald-400"
                        )}>
                          {notif.title}
                        </h4>
                        <p className="text-sm text-slate-400 mt-0.5">{notif.body}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatRelativeTime(notif.created_at)}
                          </span>
                          {notif.scheduled_for && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(notif.scheduled_for)}
                            </span>
                          )}
                          {notif.related_type && (
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {notif.related_type}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* اکشن‌ها */}
                      {!isSelectMode && (
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          {!notif.is_read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={Check}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarkAsRead(notif.id)
                              }}
                              className="h-8 w-8 p-0"
                            />
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={X}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(notif.id)
                            }}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}