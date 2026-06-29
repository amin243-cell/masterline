import { useEffect, useState, useCallback } from 'react'
import { 
  CheckCircle2, XCircle, Info, X, AlertTriangle, 
  Bell, Shield, Zap, Clock, Download, Upload 
} from 'lucide-react'

// ==================== انواع Toast (بدون تکرار) ====================
const TOAST_TYPES = {
  success: {
    icon: CheckCircle2,
    className: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400',
    iconClassName: 'text-emerald-400',
    progressColor: 'bg-emerald-400',
  },
  error: {
    icon: XCircle,
    className: 'bg-red-500/20 border-red-500/50 text-red-400',
    iconClassName: 'text-red-400',
    progressColor: 'bg-red-400',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-amber-500/20 border-amber-500/50 text-amber-400',
    iconClassName: 'text-amber-400',
    progressColor: 'bg-amber-400',
  },
  info: {
    icon: Info,
    className: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
    iconClassName: 'text-blue-400',
    progressColor: 'bg-blue-400',
  },
  notification: {
    icon: Bell,
    className: 'bg-purple-500/20 border-purple-500/50 text-purple-400',
    iconClassName: 'text-purple-400',
    progressColor: 'bg-purple-400',
  },
  backup: {
    icon: Download,
    className: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400',
    iconClassName: 'text-cyan-400',
    progressColor: 'bg-cyan-400',
  },
  restore: {
    icon: Upload,
    className: 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400',
    iconClassName: 'text-indigo-400',
    progressColor: 'bg-indigo-400',
  },
  optimize: {
    icon: Zap,
    className: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
    iconClassName: 'text-yellow-400',
    progressColor: 'bg-yellow-400',
  },
}

// ==================== کامپوننت اصلی Toast ====================
export default function Toast({ 
  message, 
  type = 'success', 
  onClose, 
  duration = 3000,
  position = 'top-center',
  showProgress = true,
  action = null,
  actionLabel = '',
  onAction = null,
  closable = true,
}) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      if (onClose) onClose()
    }, 300)
  }, [onClose])

  useEffect(() => {
    if (duration === 0) return
    
    const startTime = Date.now()
    const interval = 50
    
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 1 - elapsed / duration)
      setProgress(remaining * 100)
      
      if (remaining <= 0) {
        clearInterval(timer)
        handleClose()
      }
    }, interval)
    
    return () => clearInterval(timer)
  }, [duration, handleClose])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && closable) {
        handleClose()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [closable, handleClose])

  const toastType = TOAST_TYPES[type] || TOAST_TYPES.info
  const Icon = toastType.icon

  const positions = {
    'top-left': 'top-6 left-6',
    'top-center': 'top-6 left-1/2 -translate-x-1/2',
    'top-right': 'top-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-6 right-6',
  }

  const positionClass = positions[position] || positions['top-center']

  return (
    <div 
      className={`
        fixed ${positionClass} z-[100] 
        transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
        max-w-md w-full
      `}
      role="alert"
      aria-live="polite"
    >
      <div className={`
        relative flex items-start gap-3 px-5 py-4 rounded-2xl 
        border backdrop-blur-xl shadow-2xl
        ${toastType.className}
        hover:shadow-3xl transition-shadow
      `}>
        <div className="flex-shrink-0 mt-0.5">
          <Icon className={`w-5 h-5 ${toastType.iconClassName}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm leading-relaxed break-words">
            {message}
          </p>
          
          {action && onAction && (
            <button
              onClick={() => {
                onAction()
                if (duration > 0) handleClose()
              }}
              className="mt-2 text-xs font-bold px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              {actionLabel || 'اقدام'}
            </button>
          )}
        </div>
        
        {closable && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 mt-0.5 text-slate-400 hover:text-white transition-colors"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {showProgress && duration > 0 && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-700/30 rounded-b-2xl overflow-hidden"
          >
            <div 
              className={`h-full ${toastType.progressColor} transition-all duration-100 ease-linear rounded-b-2xl`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== Toast Container ====================
export function ToastContainer({ toasts, onClose }) {
  if (!toasts || toasts.length === 0) return null

  const groupedToasts = toasts.reduce((acc, toast) => {
    const pos = toast.position || 'top-center'
    if (!acc[pos]) acc[pos] = []
    acc[pos].push(toast)
    return acc
  }, {})

  return (
    <>
      {Object.entries(groupedToasts).map(([position, items]) => (
        <div 
          key={position} 
          className="fixed z-[100] pointer-events-none"
          style={{
            top: position.includes('top') ? '1.5rem' : 'auto',
            bottom: position.includes('bottom') ? '1.5rem' : 'auto',
            left: position.includes('left') ? '1.5rem' : position.includes('center') ? '50%' : 'auto',
            right: position.includes('right') ? '1.5rem' : 'auto',
            transform: position.includes('center') && !position.includes('left') && !position.includes('right') 
              ? 'translateX(-50%)' 
              : 'none',
          }}
        >
          <div className="pointer-events-auto space-y-3">
            {items.map((toast, index) => (
              <Toast
                key={toast.id || index}
                {...toast}
                onClose={() => onClose(toast.id || index)}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

// ==================== هوک استفاده از Toast ====================
export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((options) => {
    const id = Date.now() + Math.random()
    const newToast = {
      id,
      ...options,
      onClose: () => removeToast(id),
    }
    
    setToasts(prev => [...prev, newToast])
    
    if (options.duration !== 0) {
      setTimeout(() => removeToast(id), options.duration || 3000)
    }
    
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  const success = useCallback((message, options = {}) => {
    return addToast({ message, type: 'success', ...options })
  }, [addToast])

  const error = useCallback((message, options = {}) => {
    return addToast({ message, type: 'error', ...options })
  }, [addToast])

  const warning = useCallback((message, options = {}) => {
    return addToast({ message, type: 'warning', ...options })
  }, [addToast])

  const info = useCallback((message, options = {}) => {
    return addToast({ message, type: 'info', ...options })
  }, [addToast])

  const notification = useCallback((message, options = {}) => {
    return addToast({ message, type: 'notification', ...options })
  }, [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    notification,
  }
}

// ==================== Toast Provider ====================
export function ToastProvider({ children }) {
  const { toasts, removeToast } = useToast()

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  )
}