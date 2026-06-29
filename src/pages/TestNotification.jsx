// src/pages/TestNotification.jsx
import { useState } from 'react'
import { sendNotification, isPermissionGranted, requestPermission } from '@tauri-apps/plugin-notification'
import { Button } from '../components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Bell, Shield, CheckCircle, XCircle } from 'lucide-react'

export default function TestNotification() {
  const [status, setStatus] = useState('idle')
  const [permission, setPermission] = useState(null)

  const checkPermission = async () => {
    const granted = await isPermissionGranted()
    setPermission(granted)
    return granted
  }

  const requestPermissionHandler = async () => {
    setStatus('requesting')
    try {
      const granted = await requestPermission()
      setPermission(granted)
      setStatus(granted ? 'granted' : 'denied')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  const sendTestNotification = async () => {
    setStatus('sending')
    try {
      // بررسی مجوز
      let granted = await isPermissionGranted()
      if (!granted) {
        granted = await requestPermission()
        setPermission(granted)
        if (!granted) {
          setStatus('denied')
          return
        }
      }

      // ارسال اعلان
      sendNotification({
        title: '🔔 تست اعلان',
        body: 'اگر این پیام را می‌بینید، اعلان Tauri کار می‌کند!',
        icon: null,
      })

      setStatus('sent')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-400" />
            تست اعلان Tauri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* وضعیت مجوز */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <p className="text-sm text-slate-400">وضعیت مجوز:</p>
            {permission === true && (
              <p className="text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> مجوز داده شده
              </p>
            )}
            {permission === false && (
              <p className="text-red-400 flex items-center gap-2">
                <XCircle className="w-4 h-4" /> مجوز داده نشده
              </p>
            )}
            {permission === null && (
              <p className="text-amber-400 flex items-center gap-2">
                <Shield className="w-4 h-4" /> هنوز بررسی نشده
              </p>
            )}
          </div>

          {/* دکمه‌ها */}
          <div className="flex flex-col gap-3">
            <Button 
              variant="secondary"
              onClick={checkPermission}
              icon={Shield}
            >
              بررسی مجوز
            </Button>

            <Button 
              variant="primary"
              onClick={requestPermissionHandler}
              icon={Bell}
              disabled={status === 'requesting'}
            >
              {status === 'requesting' ? 'درخواست...' : 'درخواست مجوز'}
            </Button>

            <Button 
              variant="success"
              onClick={sendTestNotification}
              icon={Bell}
              disabled={status === 'sending' || permission !== true}
            >
              {status === 'sending' ? 'در حال ارسال...' : 'ارسال اعلان تستی'}
            </Button>
          </div>

          {/* وضعیت */}
          {status === 'sent' && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <p className="text-emerald-400 text-sm">✅ اعلان با موفقیت ارسال شد!</p>
            </div>
          )}
          {status === 'error' && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <p className="text-red-400 text-sm">❌ خطا در ارسال اعلان</p>
            </div>
          )}
          {status === 'denied' && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <p className="text-amber-400 text-sm">⚠️ مجوز داده نشد. لطفاً مجوز را بدهید.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}