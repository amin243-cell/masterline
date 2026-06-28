import { Inbox, Plus } from 'lucide-react'
import { Button } from '../ui/button'

export default function EmptyState({ 
  icon: Icon = Inbox,
  title, 
  description, 
  actionText, 
  onAction,
  searchActive = false 
}) {
  if (searchActive) {
    return (
      <div className="empty-state-ultra py-16">
        <div className="w-20 h-20 rounded-3xl bg-slate-800/50 flex items-center justify-center mx-auto mb-5">
          <Icon className="w-10 h-10 text-slate-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-400 mb-2">موردی یافت نشد</h3>
        <p className="text-sm text-slate-500">عبارت جستجو را تغییر دهید</p>
      </div>
    )
  }

  return (
    <div className="empty-state-ultra py-16">
      <div className="w-20 h-20 rounded-3xl bg-slate-800/50 flex items-center justify-center mx-auto mb-5">
        <Icon className="w-10 h-10 text-slate-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-400 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-6">{description}</p>
      {actionText && onAction && (
        <Button 
          onClick={onAction}
          className="btn-ultra btn-ultra-primary"
        >
          <Plus className="w-5 h-5" />
          {actionText}
        </Button>
      )}
    </div>
  )
}