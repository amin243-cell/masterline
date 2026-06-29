// src/pages/Notifications.jsx
import { useState, useCallback, useMemo, useEffect } from 'react'
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
import { Input, InputGroup, SearchInput } from '../components/ui/input'
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
          checked={settings.loans.enabled}
          onCheckedChange={(v) => updateSettings({ loans: { ...settings.loans, enabled: v } })}
          label="یادآورهای وام"
          description={`${settings.loans.beforeDays.join('، ')} روز قبل از سررسید`}
          icon={DollarSign}
        />
        <SwitchItem
          checked={settings.subscriptions.enabled}
          onCheckedChange={(v) => updateSettings({ subscriptions: { ...settings.subscriptions, enabled: v } })}
          label="یادآورهای اشتراک"
          description={`${settings.subscriptions.beforeDays.join('، ')} روز قبل از تمدید`}
          icon={CreditCard}
        />
        <SwitchItem
          checked={settings.goals.enabled}
          onCheckedChange={(v) => updateSettings({ goals: { ...settings.goals, enabled: v } })}
          label="یادآورهای اهداف"
          description={`در ${settings.goals.milestones.join('٪، ')}٪ پیشرفت`}
          icon={Target}
        />
        <SwitchItem
          checked={settings.reminders.enabled}
          onCheckedChange={(v) => updateSettings({ reminders: { ...settings.reminders, enabled: v } })}
          label="یادآورهای عمومی"
          description={`${settings.reminders.beforeMinutes.join('، ')} دقیقه قبل`}
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
            checked={settings.doNotDisturb.enabled}
            onCheckedChange={(v) => updateSettings({ doNotDisturb: { ...settings.doNotDisturb, enabled: v } })}
            variant="purple"
          />
        </div>
        {settings.doNotDisturb.enabled && (
          <div className="mt-3 flex items-center gap-3">
            <Input
              type="time"
              value={settings.doNotDisturb.start}
              onChange={(e) => updateSettings({ doNotDisturb: { ...settings.doNotDisturb, start: e.target.value } })}
              className="w-28"
            />
            <span className="text-slate-400">تا</span>
            <Input
              type="time"
              value={settings.doNotDisturb.end}
              onChange={(e) => updateSettings({ doNotDisturb: { ...settings.doNotDisturb, end: e.target.value } })}
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
  
  const {
    notificationHistory,
    unreadCount,
    markAsRead,
    markAllRead,
    clearHistory,
    deleteNotification,
    notificationSettings,
    updateSettings,
  } = useNotifications()

  const [filter, setFilter] = useState('all') // all, unread, loan, subscription, goal, general
  const [searchQuery, setSearchQuery] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedNotifications, setSelectedNotifications] = useState([])
  const [isSelectMode, setIsSelectMode] = useState(false)
  
  // ============ Stateهای ایجاد یادآور ============
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    type: 'general',
    date: '',
    time: '',
    priority: 'medium',
    repeat: 'none',
  })

  // فیلتر کردن اعلان‌ها
  const filteredNotifications = useMemo(() => {
    let filtered = [...notificationHistory]

    if (filter !== 'all') {
      if (filter === 'unread') {
        filtered = filtered.filter(n => !n.read)
      } else {
        filtered = filtered.filter(n => n.type === filter)
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
  }, [notificationHistory, filter, searchQuery])

  // دسته‌بندی بر اساس تاریخ
  const groupedNotifications = useMemo(() => {
    const groups = {}
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    filteredNotifications.forEach(notif => {
      const date = new Date(notif.timestamp)
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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'loan': return <DollarSign className="w-4 h-4 text-red-400" />
      case 'subscription': return <CreditCard className="w-4 h-4 text-blue-400" />
      case 'goal': return <Target className="w-4 h-4 text-emerald-400" />
      default: return <BellIcon className="w-4 h-4 text-yellow-400" />
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'loan': return 'وام'
      case 'subscription': return 'اشتراک'
      case 'goal': return 'هدف'
      default: return 'عمومی'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10'
      case 'medium': return 'text-yellow-400 bg-yellow-500/10'
      default: return 'text-blue-400 bg-blue-500/10'
    }
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'بالا'
      case 'medium': return 'متوسط'
      default: return 'پایین'
    }
  }

  const getRepeatLabel = (repeat) => {
    switch (repeat) {
      case 'daily': return 'روزانه'
      case 'weekly': return 'هفتگی'
      case 'monthly': return 'ماهانه'
      default: return 'بدون تکرار'
    }
  }

  const handleMarkAllRead = () => {
    markAllRead()
    success('همه اعلان‌ها به عنوان خوانده‌شده علامت‌گذاری شدند')
  }

  const handleClearAll = () => {
    if (confirm('آیا از پاک‌سازی همه اعلان‌ها مطمئن هستید؟')) {
      clearHistory()
      success('تاریخچه اعلان‌ها پاک شد')
    }
  }

  const handleMarkAsRead = (id) => {
    markAsRead(id)
  }

  const handleDelete = (id) => {
    deleteNotification(id)
  }

  const handleBulkDelete = () => {
    if (selectedNotifications.length === 0) return
    if (confirm(`آیا از حذف ${selectedNotifications.length} اعلان مطمئن هستید؟`)) {
      selectedNotifications.forEach(id => deleteNotification(id))
      setSelectedNotifications([])
      setIsSelectMode(false)
      success(`${selectedNotifications.length} اعلان حذف شدند`)
    }
  }

  const handleBulkMarkRead = () => {
    selectedNotifications.forEach(id => markAsRead(id))
    setSelectedNotifications([])
    setIsSelectMode(false)
    success(`${selectedNotifications.length} اعلان به عنوان خوانده‌شده علامت‌گذاری شدند`)
  }

  const toggleSelect = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id))
    }
  }

  const filterOptions = [
    { value: 'all', label: 'همه' },
    { value: 'unread', label: `خوانده‌نشده (${unreadCount})` },
    { value: 'loan', label: 'وام' },
    { value: 'subscription', label: 'اشتراک' },
    { value: 'goal', label: 'هدف' },
    { value: 'general', label: 'عمومی' },
  ]

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
                {unreadCount > 0 
                  ? `${unreadCount} اعلان خوانده‌نشده دارید`
                  : 'همه اعلان‌ها خوانده شده‌اند'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button 
              variant="primary" 
              size="sm"
              icon={Plus}
              onClick={() => setShowCreateDialog(true)}
            >
              یادآور جدید
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              icon={CheckCheck}
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
            >
              علامت‌گذاری همه
            </Button>
            <Button 
              variant="danger" 
              size="sm"
              icon={Trash2}
              onClick={handleClearAll}
              disabled={notificationHistory.length === 0}
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
            <SwitchGroup>
              <SwitchItem
                checked={notificationSettings.loans.enabled}
                onCheckedChange={(v) => updateSettings({ loans: { ...notificationSettings.loans, enabled: v } })}
                label="یادآورهای وام"
                description={`${notificationSettings.loans.beforeDays.join('، ')} روز قبل از سررسید`}
                icon={DollarSign}
              />
              <SwitchItem
                checked={notificationSettings.subscriptions.enabled}
                onCheckedChange={(v) => updateSettings({ subscriptions: { ...notificationSettings.subscriptions, enabled: v } })}
                label="یادآورهای اشتراک"
                description={`${notificationSettings.subscriptions.beforeDays.join('، ')} روز قبل از تمدید`}
                icon={CreditCard}
              />
              <SwitchItem
                checked={notificationSettings.goals.enabled}
                onCheckedChange={(v) => updateSettings({ goals: { ...notificationSettings.goals, enabled: v } })}
                label="یادآورهای اهداف"
                description={`در ${notificationSettings.goals.milestones.join('٪، ')}٪ پیشرفت`}
                icon={Target}
              />
              <SwitchItem
                checked={notificationSettings.reminders.enabled}
                onCheckedChange={(v) => updateSettings({ reminders: { ...notificationSettings.reminders, enabled: v } })}
                label="یادآورهای عمومی"
                description={`${notificationSettings.reminders.beforeMinutes.join('، ')} دقیقه قبل`}
                icon={BellIcon}
              />
            </SwitchGroup>

            {/* حالت مزاحمت نشوید */}
            <div className="mt-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
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
                  checked={notificationSettings.doNotDisturb.enabled}
                  onCheckedChange={(v) => updateSettings({ doNotDisturb: { ...notificationSettings.doNotDisturb, enabled: v } })}
                  variant="purple"
                />
              </div>
              {notificationSettings.doNotDisturb.enabled && (
                <div className="mt-3 flex items-center gap-3">
                  <Input
                    type="time"
                    value={notificationSettings.doNotDisturb.start}
                    onChange={(e) => updateSettings({ doNotDisturb: { ...notificationSettings.doNotDisturb, start: e.target.value } })}
                    className="w-28"
                  />
                  <span className="text-slate-400">تا</span>
                  <Input
                    type="time"
                    value={notificationSettings.doNotDisturb.end}
                    onChange={(e) => updateSettings({ doNotDisturb: { ...notificationSettings.doNotDisturb, end: e.target.value } })}
                    className="w-28"
                  />
                </div>
              )}
            </div>
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
      {Object.keys(groupedNotifications).length === 0 ? (
        <Card variant="glow" className="animate-fade-in-up">
          <CardContent className="p-12 text-center">
            <BellOff className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white">هیچ اعلانی وجود ندارد</h3>
            <p className="text-slate-400 mt-2">اعلان‌های جدید در اینجا نمایش داده می‌شوند</p>
            <Button 
              variant="primary" 
              className="mt-4"
              icon={Plus}
              onClick={() => setShowCreateDialog(true)}
            >
              ایجاد یادآور جدید
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
                  variant={notif.read ? 'default' : 'glow'}
                  className={cn(
                    "transition-all hover:border-emerald-500/30",
                    !notif.read && "border-emerald-500/30",
                    isSelectMode && "cursor-pointer",
                    selectedNotifications.includes(notif.id) && "border-emerald-500/50 bg-emerald-500/5"
                  )}
                  onClick={() => {
                    if (isSelectMode) {
                      toggleSelect(notif.id)
                    } else if (!notif.read) {
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
                        {getTypeIcon(notif.type)}
                      </div>

                      {/* محتوا */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800/50 text-slate-400">
                            {getTypeLabel(notif.type)}
                          </span>
                          {notif.priority && (
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full",
                              getPriorityColor(notif.priority)
                            )}>
                              {getPriorityLabel(notif.priority)}
                            </span>
                          )}
                          {!notif.read && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                              جدید
                            </span>
                          )}
                        </div>
                        <h4 className={cn(
                          "font-bold text-white mt-1",
                          !notif.read && "text-emerald-400"
                        )}>
                          {notif.title}
                        </h4>
                        <p className="text-sm text-slate-400 mt-0.5">{notif.body}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatRelativeTime(notif.timestamp)}
                          </span>
                          {notif.repeat && notif.repeat !== 'none' && (
                            <span className="flex items-center gap-1">
                              <Repeat className="w-3 h-3" />
                              {getRepeatLabel(notif.repeat)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* اکشن‌ها */}
                      {!isSelectMode && (
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          {!notif.read && (
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

      {/* ============ DIALOG ایجاد یادآور ============ */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent variant="default" size="md">
          <DialogHeader 
            icon={CalendarPlus}
            title="ایجاد یادآور جدید"
            description="یک یادآور جدید برای خود تنظیم کنید"
            iconClassName="text-emerald-400"
          />
          <DialogBody>
            <div className="space-y-4">
              <InputGroup 
                label="عنوان"
                required
              >
                <Input
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  placeholder="عنوان یادآور را وارد کنید"
                />
              </InputGroup>

              <InputGroup label="توضیحات">
                <Input
                  value={newReminder.description}
                  onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                  placeholder="توضیحات (اختیاری)"
                />
              </InputGroup>

              <div className="grid grid-cols-2 gap-3">
                <InputGroup label="تاریخ">
                  <Input
                    type="date"
                    value={newReminder.date}
                    onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                  />
                </InputGroup>

                <InputGroup label="زمان">
                  <Input
                    type="time"
                    value={newReminder.time}
                    onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                  />
                </InputGroup>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InputGroup label="نوع">
                  <Select 
                    value={newReminder.type} 
                    onValueChange={(v) => setNewReminder({ ...newReminder, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="loan">وام</SelectItem>
                      <SelectItem value="subscription">اشتراک</SelectItem>
                      <SelectItem value="goal">هدف</SelectItem>
                      <SelectItem value="general">عمومی</SelectItem>
                    </SelectContent>
                  </Select>
                </InputGroup>

                <InputGroup label="اولویت">
                  <Select 
                    value={newReminder.priority} 
                    onValueChange={(v) => setNewReminder({ ...newReminder, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">بالا</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="low">پایین</SelectItem>
                    </SelectContent>
                  </Select>
                </InputGroup>
              </div>

              <InputGroup label="تکرار">
                <Select 
                  value={newReminder.repeat} 
                  onValueChange={(v) => setNewReminder({ ...newReminder, repeat: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون تکرار</SelectItem>
                    <SelectItem value="daily">روزانه</SelectItem>
                    <SelectItem value="weekly">هفتگی</SelectItem>
                    <SelectItem value="monthly">ماهانه</SelectItem>
                  </SelectContent>
                </Select>
              </InputGroup>
            </div>
          </DialogBody>
          <DialogActions
            secondaryLabel="انصراف"
            onSecondary={() => {
              setShowCreateDialog(false)
              setNewReminder({
                title: '',
                description: '',
                type: 'general',
                date: '',
                time: '',
                priority: 'medium',
                repeat: 'none',
              })
            }}
            primaryLabel="ایجاد یادآور"
            onPrimary={() => {
              if (!newReminder.title) {
                error('لطفاً عنوان یادآور را وارد کنید')
                return
              }
              success('یادآور با موفقیت ایجاد شد')
              setShowCreateDialog(false)
              setNewReminder({
                title: '',
                description: '',
                type: 'general',
                date: '',
                time: '',
                priority: 'medium',
                repeat: 'none',
              })
            }}
            primaryDisabled={!newReminder.title}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}