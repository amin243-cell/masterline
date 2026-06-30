import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import useStore from '../store/useStore';
import { 
  sendDesktopNotification, 
  checkNotificationPermission,
  requestNotificationPermission,
  sendTestNotification 
} from '../utils/notifications';

export const useNotifications = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isDndActive, setIsDndActive] = useState(false);
  
  const { 
    notifications, 
    setNotifications, 
    settings, 
    setNotificationSettings,
    unreadCount,
    setUnreadCount
  } = useStore();

  // ==================== بررسی مجوز اعلان ====================
  const checkPermission = useCallback(async () => {
    try {
      const granted = await checkNotificationPermission();
      setPermissionGranted(granted);
      return granted;
    } catch (err) {
      console.error('Error checking permission:', err);
      return false;
    }
  }, []);

  // ==================== درخواست مجوز اعلان ====================
  const requestPermission = useCallback(async () => {
    try {
      const granted = await requestNotificationPermission();
      setPermissionGranted(granted);
      return granted;
    } catch (err) {
      console.error('Error requesting permission:', err);
      return false;
    }
  }, []);

  // ==================== بررسی حالت Do Not Disturb ====================
  const checkDndStatus = useCallback(() => {
    const dndEnabled = settings?.dnd_enabled || false;
    if (!dndEnabled) {
      setIsDndActive(false);
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = settings?.dnd_start?.split(':').map(Number) || [23, 0];
    const endTime = settings?.dnd_end?.split(':').map(Number) || [8, 0];
    
    const startMinutes = startTime[0] * 60 + startTime[1];
    const endMinutes = endTime[0] * 60 + endTime[1];
    
    let isDnd = false;
    if (startMinutes < endMinutes) {
      isDnd = currentTime >= startMinutes && currentTime < endMinutes;
    } else {
      isDnd = currentTime >= startMinutes || currentTime < endMinutes;
    }
    
    setIsDndActive(isDnd);
    return isDnd;
  }, [settings]);

  // ==================== دریافت لیست اعلان‌ها از دیتابیس ====================
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await invoke('get_notifications');
      setNotifications(data);
      const unread = data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [setNotifications, setUnreadCount]);

  // ==================== دریافت تنظیمات از دیتابیس ====================
  const fetchSettings = useCallback(async () => {
    try {
      const data = await invoke('get_settings');
      setNotificationSettings(data);
      // بررسی DND بعد از دریافت تنظیمات
      checkDndStatus();
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  }, [setNotificationSettings, checkDndStatus]);

  // ==================== ارسال اعلان جدید ====================
  const sendNotification = useCallback(async (title, body, type, relatedId = null, relatedType = null, scheduledFor = null) => {
    try {
      // ۱. ذخیره در دیتابیس
      const id = await invoke('add_notification', {
        title,
        body,
        notificationType: type,
        relatedId,
        relatedType,
        scheduledFor
      });

      // ۲. ایجاد شیء اعلان
      const newNotif = {
        id,
        title,
        body,
        notification_type: type,
        related_id: relatedId,
        related_type: relatedType,
        is_read: false,
        scheduled_for: scheduledFor,
        created_at: new Date().toISOString()
      };

      // ۳. اضافه کردن به لیست محلی
      setNotifications([newNotif, ...notifications]);
      setUnreadCount(unreadCount + 1);

      // ۴. بررسی DND قبل از ارسال اعلان سیستمی
      const isDnd = checkDndStatus();
      if (isDnd) {
        console.log('Notification not sent due to DND mode');
        return id;
      }

      // ۵. بررسی مجوز
      let hasPermission = permissionGranted;
      if (!hasPermission) {
        hasPermission = await requestPermission();
      }

      // ۶. ارسال اعلان سیستمی
      if (hasPermission && settings?.notifications !== false) {
        await sendDesktopNotification({
          title: title || 'یادآوری',
          body: body || '',
          sound: settings?.sound ? 'notification.wav' : null,
          notificationId: `notif-${id}`,
        });
      }

      return id;
    } catch (err) {
      console.error('Error sending notification:', err);
      throw err;
    }
  }, [notifications, setNotifications, unreadCount, setUnreadCount, permissionGranted, requestPermission, settings, checkDndStatus]);

  // ==================== علامت‌گذاری به عنوان خوانده شده ====================
  const markAsRead = useCallback(async (id) => {
    try {
      await invoke('mark_notification_as_read', { id });
      const updated = notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      );
      setNotifications(updated);
      setUnreadCount(updated.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Error marking as read:', err);
      throw err;
    }
  }, [notifications, setNotifications, setUnreadCount]);

  // ==================== علامت‌گذاری همه به عنوان خوانده شده ====================
  const markAllRead = useCallback(async () => {
    try {
      const unreadNotifs = notifications.filter(n => !n.is_read);
      for (const notif of unreadNotifs) {
        await invoke('mark_notification_as_read', { id: notif.id });
      }
      const updated = notifications.map(n => ({ ...n, is_read: true }));
      setNotifications(updated);
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
      throw err;
    }
  }, [notifications, setNotifications, setUnreadCount]);

  // ==================== حذف اعلان ====================
  const deleteNotification = useCallback(async (id) => {
    try {
      await invoke('delete_notification', { id });
      const filtered = notifications.filter(n => n.id !== id);
      setNotifications(filtered);
      setUnreadCount(filtered.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  }, [notifications, setNotifications, setUnreadCount]);

  // ==================== پاک کردن همه ====================
  const clearHistory = useCallback(async () => {
    try {
      await invoke('clear_all_notifications');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Error clearing notifications:', err);
      throw err;
    }
  }, [setNotifications, setUnreadCount]);

  // ==================== به‌روزرسانی تنظیمات ====================
  const updateSettings = useCallback(async (newSettings) => {
    try {
      // تبدیل ساختار تنظیمات به فرمت موردنظر دیتابیس
      const dbSettings = {
        loan_days: newSettings.loans?.beforeDays?.join(',') || '3,1,0',
        subscription_days: newSettings.subscriptions?.beforeDays?.join(',') || '7,3,0',
        goal_percent: newSettings.goals?.milestones?.join(',') || '25,50,75,100',
        general_minutes: newSettings.general?.beforeMinutes?.join(',') || '60,30,0',
        dnd_enabled: newSettings.dnd_enabled || false,
        dnd_start: newSettings.dnd_start || '23:00',
        dnd_end: newSettings.dnd_end || '08:00',
      };
      
      await invoke('update_settings', { settings: dbSettings });
      setNotificationSettings(dbSettings);
      
      // بررسی مجدد DND بعد از تغییر تنظیمات
      checkDndStatus();
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  }, [setNotificationSettings, checkDndStatus]);

  // ==================== تست اعلان ====================
  const testNotification = useCallback(async () => {
    try {
      return await sendTestNotification();
    } catch (err) {
      console.error('Error testing notification:', err);
      return false;
    }
  }, []);

  // ==================== بارگذاری اولیه ====================
  useEffect(() => {
    const init = async () => {
      await checkPermission();
      await fetchNotifications();
      await fetchSettings();
      
      // چک کردن DND هر دقیقه
      const dndInterval = setInterval(checkDndStatus, 60000);
      
      return () => clearInterval(dndInterval);
    };
    
    init();
  }, []);

  return {
    loading,
    error,
    notifications,
    settings,
    unreadCount,
    permissionGranted,
    isDndActive,
    fetchNotifications,
    fetchSettings,
    sendNotification,
    markAsRead,
    markAllRead,
    deleteNotification,
    clearHistory,
    updateSettings,
    checkPermission,
    requestPermission,
    testNotification,
  };
};