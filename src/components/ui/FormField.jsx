import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function FormField({ 
  label, 
  error, 
  success, 
  children,
  required = false 
}) {
  return (
    <div className="space-y-2">
      <label className="label-ultra flex items-center gap-1">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs animate-fade-in">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && !error && (
        <div className="flex items-center gap-2 text-emerald-400 text-xs animate-fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
    </div>
  )
}