import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { Check, X } from "lucide-react"
import { cn } from "../../lib/utils"

// ==================== کامپوننت اصلی Switch ====================
const Switch = React.forwardRef(({ 
  className, 
  size = "default", 
  variant = "default",
  label,
  description,
  icon: Icon,
  checked,
  onCheckedChange,
  disabled,
  ...props 
}, ref) => {
  // انواع مختلف استایل
  const variants = {
    default: {
      checked: "bg-emerald-500 border-emerald-500",
      unchecked: "bg-slate-700 border-slate-700",
    },
    primary: {
      checked: "bg-blue-500 border-blue-500",
      unchecked: "bg-slate-700 border-slate-700",
    },
    danger: {
      checked: "bg-red-500 border-red-500",
      unchecked: "bg-slate-700 border-slate-700",
    },
    warning: {
      checked: "bg-amber-500 border-amber-500",
      unchecked: "bg-slate-700 border-slate-700",
    },
    purple: {
      checked: "bg-purple-500 border-purple-500",
      unchecked: "bg-slate-700 border-slate-700",
    },
    glass: {
      checked: "bg-emerald-500/20 border-emerald-500/50 backdrop-blur-sm",
      unchecked: "bg-white/5 border-white/10 backdrop-blur-sm",
    },
  }

  // سایزهای مختلف
  const sizes = {
    sm: {
      root: "h-5 w-9",
      thumb: "h-3.5 w-3.5 data-[state=checked]:translate-x-[16px]",
      icon: "h-2.5 w-2.5",
    },
    default: {
      root: "h-6 w-11",
      thumb: "h-4.5 w-4.5 data-[state=checked]:translate-x-[20px]",
      icon: "h-3 w-3",
    },
    lg: {
      root: "h-8 w-14",
      thumb: "h-6 w-6 data-[state=checked]:translate-x-[24px]",
      icon: "h-4 w-4",
    },
  }

  const currentSize = sizes[size] || sizes.default
  const currentVariant = variants[variant] || variants.default

  // وضعیت checked
  const isChecked = checked || false

  return (
    <div className="flex items-center gap-3">
      {/* سوئیچ */}
      <SwitchPrimitive.Root
        ref={ref}
        checked={isChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          "relative inline-flex shrink-0 items-center rounded-full",
          "border-2 transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "cursor-pointer",
          // استایل‌های مختلف بر اساس وضعیت
          isChecked 
            ? currentVariant.checked 
            : currentVariant.unchecked,
          // سایه
          isChecked && "shadow-lg shadow-emerald-500/20",
          // سایز
          currentSize.root,
          className
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            "pointer-events-none block rounded-full",
            "bg-white shadow-lg",
            "transition-all duration-300",
            // سایز thumb
            currentSize.thumb,
            // افکت scale در حالت disabled
            disabled && "scale-90",
            // حالت checked/unchecked
            isChecked ? "translate-x-0" : "translate-x-0",
            // استایل اضافی برای حالت checked
            isChecked && "scale-105"
          )}
        >
          {/* آیکون داخل thumb */}
          {size !== 'sm' && (
            <div className="flex h-full w-full items-center justify-center">
              {isChecked ? (
                <Check className={cn(
                  "text-emerald-500",
                  currentSize.icon
                )} />
              ) : (
                <X className={cn(
                  "text-slate-400",
                  currentSize.icon
                )} />
              )}
            </div>
          )}
        </SwitchPrimitive.Thumb>
      </SwitchPrimitive.Root>

      {/* برچسب و توضیحات */}
      {(label || description || Icon) && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-slate-400" />}
            {label && (
              <label 
                className={cn(
                  "text-sm font-medium text-white cursor-pointer select-none",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !disabled && onCheckedChange?.(!isChecked)}
              >
                {label}
              </label>
            )}
          </div>
          {description && (
            <p className="text-xs text-slate-400">{description}</p>
          )}
        </div>
      )}
    </div>
  )
})
Switch.displayName = "Switch"

// ==================== Switch Group (جدید) ====================
const SwitchGroup = React.forwardRef(({ 
  className,
  children,
  label,
  description,
  orientation = 'vertical',
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "space-y-3",
        className
      )}
      {...props}
    >
      {(label || description) && (
        <div className="space-y-0.5">
          {label && (
            <h4 className="text-sm font-medium text-white">{label}</h4>
          )}
          {description && (
            <p className="text-xs text-slate-400">{description}</p>
          )}
        </div>
      )}
      <div className={cn(
        "flex",
        orientation === 'vertical' ? "flex-col space-y-2" : "flex-row flex-wrap gap-4"
      )}>
        {children}
      </div>
    </div>
  )
})
SwitchGroup.displayName = "SwitchGroup"

// ==================== Switch Item (جدید) ====================
const SwitchItem = React.forwardRef(({ 
  className,
  label,
  description,
  icon: Icon,
  checked,
  onCheckedChange,
  disabled,
  variant = "default",
  size = "default",
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between p-4",
        "rounded-xl border border-slate-700/50",
        "bg-slate-800/30",
        "transition-all duration-200",
        "hover:border-emerald-500/30 hover:bg-slate-800/50",
        checked && "border-emerald-500/30 bg-emerald-500/5",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center",
            "bg-slate-800/50 border border-slate-700/50",
            checked && "border-emerald-500/30"
          )}>
            <Icon className={cn(
              "h-4 w-4",
              checked ? "text-emerald-400" : "text-slate-400"
            )} />
          </div>
        )}
        <div>
          {label && (
            <p className={cn(
              "text-sm font-medium text-white",
              checked && "text-emerald-400"
            )}>
              {label}
            </p>
          )}
          {description && (
            <p className="text-xs text-slate-400">{description}</p>
          )}
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        variant={variant}
        size={size}
        disabled={disabled}
      />
    </div>
  )
})
SwitchItem.displayName = "SwitchItem"

// ==================== Switch Card (جدید) ====================
const SwitchCard = React.forwardRef(({ 
  className,
  title,
  description,
  icon: Icon,
  children,
  checked,
  onCheckedChange,
  disabled,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "p-5 rounded-2xl border-2 transition-all duration-200",
        "bg-slate-900/50 backdrop-blur-sm",
        checked 
          ? "border-emerald-500/50 bg-emerald-500/5 shadow-lg shadow-emerald-500/5" 
          : "border-slate-700/50 hover:border-slate-600/50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                checked ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-slate-800/50 border border-slate-700/50"
              )}>
                <Icon className={cn(
                  "h-5 w-5",
                  checked ? "text-emerald-400" : "text-slate-400"
                )} />
              </div>
            )}
            <div>
              {title && (
                <h4 className={cn(
                  "font-bold text-white",
                  checked && "text-emerald-400"
                )}>
                  {title}
                </h4>
              )}
              {description && (
                <p className="text-sm text-slate-400">{description}</p>
              )}
            </div>
          </div>
          {children && (
            <div className="mt-3 pl-2">
              {children}
            </div>
          )}
        </div>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          size="lg"
          disabled={disabled}
          className="flex-shrink-0 mt-1"
        />
      </div>
    </div>
  )
})
SwitchCard.displayName = "SwitchCard"

// ==================== صادرات ====================
export { 
  Switch, 
  SwitchGroup, 
  SwitchItem, 
  SwitchCard 
}