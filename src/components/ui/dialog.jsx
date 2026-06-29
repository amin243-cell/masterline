import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X, AlertTriangle, Info, CheckCircle, Shield } from "lucide-react"
import { cn } from "../../lib/utils"

// ==================== انواع دیالوگ ====================
const DIALOG_VARIANTS = {
  default: {
    icon: null,
    iconColor: '',
    headerClass: '',
    contentClass: '',
  },
  danger: {
    icon: AlertTriangle,
    iconColor: 'text-red-400',
    headerClass: 'border-red-500/30',
    contentClass: 'bg-red-500/5',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
    headerClass: 'border-amber-500/30',
    contentClass: 'bg-amber-500/5',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-emerald-400',
    headerClass: 'border-emerald-500/30',
    contentClass: 'bg-emerald-500/5',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-400',
    headerClass: 'border-blue-500/30',
    contentClass: 'bg-blue-500/5',
  },
  security: {
    icon: Shield,
    iconColor: 'text-purple-400',
    headerClass: 'border-purple-500/30',
    contentClass: 'bg-purple-500/5',
  },
}

// ==================== کامپوننت‌های اصلی ====================
const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

// ==================== Dialog Overlay (بهبودیافته) ====================
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

// ==================== Dialog Content (بهبودیافته) ====================
const DialogContent = React.forwardRef(({ 
  className, 
  children, 
  variant = 'default',
  size = 'default',
  showClose = true,
  onClose,
  ...props 
}, ref) => {
  // سایزهای مختلف
  const sizes = {
    sm: 'max-w-sm',
    default: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]',
  }

  const dialogVariant = DIALOG_VARIANTS[variant] || DIALOG_VARIANTS.default
  const sizeClass = sizes[size] || sizes.default

  // هندلر بستن
  const handleClose = () => {
    if (onClose) onClose()
  }

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        onPointerDownOutside={(e) => {
          if (props.disableOutsideClick) {
            e.preventDefault()
          }
        }}
        onInteractOutside={(e) => {
          if (props.disableOutsideClick) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          if (props.disableEscapeKey) {
            e.preventDefault()
          }
          if (onClose) onClose()
        }}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full",
          sizeClass,
          "max-h-[90vh] overflow-y-auto",
          "translate-x-[-50%] translate-y-[-50%]",
          "gap-4 border border-slate-700/50",
          "bg-gradient-to-br from-slate-900 to-slate-950",
          "p-6 shadow-2xl shadow-black/50",
          "duration-300",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "sm:rounded-3xl",
          dialogVariant.contentClass,
          className
        )}
        {...props}
      >
        {children}
        
        {/* دکمه بستن */}
        {showClose && (
          <DialogPrimitive.Close 
            onClick={handleClose}
            className={cn(
              "absolute left-4 top-4",
              "rounded-full p-1.5",
              "bg-slate-800/50 hover:bg-slate-700/50",
              "border border-slate-700/50 hover:border-slate-600/50",
              "text-slate-400 hover:text-white",
              "transition-all duration-200",
              "hover:scale-110 active:scale-95",
              "ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:pointer-events-none",
              "z-10"
            )}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">بستن</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

// ==================== Dialog Header (بهبودیافته) ====================
const DialogHeader = React.forwardRef(({ 
  className, 
  children,
  icon: Icon,
  iconClassName,
  variant = 'default',
  title,
  description,
  ...props 
}, ref) => {
  const dialogVariant = DIALOG_VARIANTS[variant] || DIALOG_VARIANTS.default
  const IconComponent = Icon || dialogVariant.icon
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-right",
        "pb-4 border-b border-slate-700/50",
        dialogVariant.headerClass,
        className
      )}
      {...props}
    >
      {/* آیکون در هدر (اختیاری) */}
      {IconComponent && (
        <div className="flex justify-center sm:justify-start mb-2">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center",
            "bg-slate-800/50 border border-slate-700/50",
            "shadow-lg"
          )}>
            <IconComponent className={cn(
              "w-6 h-6",
              dialogVariant.iconColor,
              iconClassName
            )} />
          </div>
        </div>
      )}
      
      {/* عنوان */}
      {title && (
        <DialogTitle className="text-white">
          {title}
        </DialogTitle>
      )}
      
      {/* توضیحات */}
      {description && (
        <DialogDescription className="text-slate-400">
          {description}
        </DialogDescription>
      )}
      
      {/* کودکان (برای استفاده دستی) */}
      {!title && !description && children}
    </div>
  )
})
DialogHeader.displayName = "DialogHeader"

// ==================== Dialog Footer (بهبودیافته) ====================
const DialogFooter = React.forwardRef(({ 
  className, 
  children,
  align = 'left',
  ...props 
}, ref) => {
  const alignments = {
    left: 'sm:justify-start',
    center: 'sm:justify-center',
    right: 'sm:justify-end',
    between: 'sm:justify-between',
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col-reverse sm:flex-row",
        "gap-3 pt-4 mt-4 border-t border-slate-700/50",
        alignments[align] || alignments.left,
        "sm:space-x-2 sm:space-x-reverse",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
DialogFooter.displayName = "DialogFooter"

// ==================== Dialog Title ====================
const DialogTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-xl font-bold leading-none tracking-tight text-white",
      "flex items-center gap-3",
      className
    )}
    {...props}
  >
    {children}
  </DialogPrimitive.Title>
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

// ==================== Dialog Description ====================
const DialogDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "text-sm text-slate-400 leading-relaxed",
      "mt-2",
      className
    )}
    {...props}
  >
    {children}
  </DialogPrimitive.Description>
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

// ==================== Dialog Body (جدید) ====================
const DialogBody = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex-1 py-2 space-y-4",
      "max-h-[60vh] overflow-y-auto",
      "custom-scrollbar-ultra",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
DialogBody.displayName = "DialogBody"

// ==================== Dialog Actions (جدید) ====================
const DialogActions = React.forwardRef(({ 
  className, 
  children,
  primary,
  secondary,
  onPrimary,
  onSecondary,
  primaryLabel,
  secondaryLabel,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col-reverse sm:flex-row",
        "gap-3 pt-4 mt-4 border-t border-slate-700/50",
        "sm:justify-end sm:space-x-2 sm:space-x-reverse",
        className
      )}
      {...props}
    >
      {/* دکمه ثانویه */}
      {(secondary || secondaryLabel) && (
        <button
          onClick={onSecondary}
          className={cn(
            "px-4 py-2 rounded-xl font-medium",
            "bg-slate-800/50 hover:bg-slate-700/50",
            "border border-slate-700/50",
            "text-slate-300 hover:text-white",
            "transition-all duration-200",
            "hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          {secondaryLabel || secondary}
        </button>
      )}
      
      {/* دکمه اصلی */}
      {(primary || primaryLabel) && (
        <button
          onClick={onPrimary}
          className={cn(
            "px-4 py-2 rounded-xl font-bold",
            "bg-gradient-to-r from-emerald-500 to-emerald-600",
            "hover:from-emerald-400 hover:to-emerald-500",
            "text-white",
            "shadow-lg shadow-emerald-500/20",
            "transition-all duration-200",
            "hover:scale-[1.02] active:scale-[0.98]",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {primaryLabel || primary}
        </button>
      )}
      
      {children}
    </div>
  )
})
DialogActions.displayName = "DialogActions"

// ==================== Dialog Section (جدید) ====================
const DialogSection = React.forwardRef(({ 
  className, 
  children,
  title,
  description,
  icon: Icon,
  variant = 'default',
  ...props 
}, ref) => {
  const variants = {
    default: 'bg-slate-800/30 border-slate-700/50',
    danger: 'bg-red-500/10 border-red-500/30',
    warning: 'bg-amber-500/10 border-amber-500/30',
    success: 'bg-emerald-500/10 border-emerald-500/30',
    info: 'bg-blue-500/10 border-blue-500/30',
  }

  return (
    <div
      ref={ref}
      className={cn(
        "p-4 rounded-xl border-2",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {(title || Icon) && (
        <div className="flex items-center gap-2 mb-2">
          {Icon && <Icon className="w-5 h-5 text-slate-400" />}
          {title && <h4 className="font-bold text-white text-sm">{title}</h4>}
        </div>
      )}
      {description && (
        <p className="text-sm text-slate-400 mb-2">{description}</p>
      )}
      {children}
    </div>
  )
})
DialogSection.displayName = "DialogSection"

// ==================== صادرات ====================
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogActions,
  DialogSection,
}