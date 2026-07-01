import React from 'react'
import { 
  Plus, 
  TrendingUp, 
  Wallet, 
  Target, 
  Bell, 
  RefreshCw,
} from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

const actions = [
  { 
    id: 'add-transaction', 
    label: 'تراکنش جدید', 
    icon: TrendingUp, 
    variant: 'default',
  },
  { 
    id: 'add-account', 
    label: 'حساب جدید', 
    icon: Wallet, 
    variant: 'outline',
  },
  { 
    id: 'add-goal', 
    label: 'هدف جدید', 
    icon: Target, 
    variant: 'outline',
  },
  { 
    id: 'add-reminder', 
    label: 'یادآور جدید', 
    icon: Bell, 
    variant: 'outline',
  },
]

export function QuickActions({ 
  className, 
  onAction, 
  onRefresh,
  loading = false,
  lastUpdate,
}) {
  const handleAction = (actionId) => {
    if (onAction) {
      onAction(actionId)
    }
  }

  return (
    <div className={cn(
      "flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-slate-800 bg-slate-900/30",
      className
    )}>
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant}
            size="sm"
            onClick={() => handleAction(action.id)}
            className={cn(
              "font-medium",
              action.variant === 'default' ? "bg-emerald-600 hover:bg-emerald-700" : ""
            )}
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500">
        {lastUpdate && (
          <span>آخرین بروزرسانی: {lastUpdate}</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="p-2 h-auto"
        >
          <RefreshCw className={cn(
            "w-4 h-4",
            loading && "animate-spin"
          )} />
        </Button>
      </div>
    </div>
  )
}

export default QuickActions