import { AlertTriangle, Trash2, CheckCircle2, Info, XCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'

export default function ConfirmDialog({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'danger',
  confirmText = 'تأیید',
  cancelText = 'انصراف'
}) {
  const config = {
    danger: {
      icon: Trash2,
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      btnClass: 'btn-ultra btn-ultra-danger',
      border: 'rgba(239, 68, 68, 0.3)'
    },
    success: {
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      btnClass: 'btn-ultra btn-ultra-primary',
      border: 'rgba(16, 185, 129, 0.3)'
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      btnClass: 'btn-ultra',
      btnStyle: { background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: 'var(--shadow-glow-amber)' },
      border: 'rgba(245, 158, 11, 0.3)'
    },
    info: {
      icon: Info,
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      btnClass: 'btn-ultra',
      btnStyle: { background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: 'var(--shadow-glow-blue)' },
      border: 'rgba(59, 130, 246, 0.3)'
    }
  }

  const current = config[type] || config.danger
  const Icon = current.icon

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent 
        className="card-ultra text-white max-w-md animate-scale-in"
        style={{ borderColor: current.border }}
      >
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className={`w-14 h-14 rounded-2xl ${current.iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-7 h-7 ${current.iconColor}`} />
            </div>
            <DialogTitle className="text-right text-xl font-black">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-right text-slate-400 text-sm leading-relaxed">
            {message}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-3 mt-4">
          <Button 
            onClick={onClose} 
            className="btn-ultra btn-ultra-secondary flex-1 h-12"
          >
            {cancelText}
          </Button>
          <Button 
            onClick={onConfirm} 
            className={`${current.btnClass} flex-1 h-12`}
            style={current.btnStyle}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}