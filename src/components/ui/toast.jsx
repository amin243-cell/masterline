import { useEffect } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const styles = {
    success: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400',
    error: 'bg-red-500/20 border-red-500/50 text-red-400',
    info: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
  }

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
  }

  const Icon = icons[type]

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-fade-in-up">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-xl shadow-2xl ${styles[type]}`}>
        <Icon className="w-5 h-5" />
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="mr-2 hover:opacity-70">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}