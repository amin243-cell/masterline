import { CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'

export default function AlertDialog({ 
  open, 
  onClose, 
  title, 
  message, 
  type = 'info'
}) {
  const config = {
    success: {
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      border: 'rgba(16, 185, 129, 0.3)'
    },
    error: {
      icon: XCircle,
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      border: 'rgba(239, 68, 68, 0.3)'
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      border: 'rgba(245, 158, 11, 0.3)'
    },
    info: {
      icon: Info,
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      border: 'rgba(59, 130, 246, 0.3)'
    }
  }

  const current = config[type] || config.info
  const Icon = current.icon

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
        
        <DialogFooter className="mt-4">
          <Button 
            onClick={onClose} 
            className="btn-ultra btn-ultra-secondary w-full h-12"
          >
            متوجه شدم
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}