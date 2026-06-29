import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "../../lib/utils"

// ==================== استایل‌های دکمه ====================
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        // دکمه‌های اصلی
        default: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30",
        primary: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30",
        
        // دکمه‌های ثانویه
        secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700/50",
        outline: "border-2 border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-600",
        ghost: "text-slate-400 hover:bg-slate-800 hover:text-white hover:scale-[1.02]",
        
        // دکمه‌های خطرناک
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20 hover:shadow-red-500/30",
        danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-500 shadow-lg shadow-red-500/20 hover:shadow-red-500/30",
        
        // دکمه‌های موفقیت
        success: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/20",
        
        // دکمه‌های هشدار
        warning: "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20",
        
        // دکمه‌های اطلاعاتی
        info: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-400 hover:to-blue-500 shadow-lg shadow-blue-500/20",
        
        // دکمه‌های خاص
        link: "text-emerald-400 underline-offset-4 hover:underline hover:text-emerald-300",
        ultra: "bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-white hover:from-emerald-300 hover:via-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-[1.02]",
        glass: "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base",
        xl: "h-14 rounded-2xl px-8 text-lg",
        icon: "h-9 w-9 rounded-xl",
        iconSm: "h-7 w-7 rounded-lg",
        iconLg: "h-11 w-11 rounded-2xl",
      },
      fullWidth: {
        true: "w-full",
      },
      loading: {
        true: "relative !text-transparent !transition-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
      loading: false,
    },
  }
)

// ==================== کامپوننت اصلی Button ====================
const Button = React.forwardRef(({ 
  className, 
  variant, 
  size, 
  fullWidth,
  loading = false,
  asChild = false, 
  children,
  disabled,
  icon: Icon,
  iconPosition = 'left',
  ...props 
}, ref) => {
  const Comp = asChild ? Slot : "button"
  
  // استایل‌های لودینگ
  const loadingClassName = loading ? buttonVariants({ loading: true }) : ""
  
  // محتوای دکمه
  const content = (
    <>
      {/* اسپینر لودینگ */}
      {loading && (
        <Loader2 className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "h-5 w-5 animate-spin",
          variant === 'ghost' || variant === 'link' ? 'text-emerald-400' : 'text-white'
        )} />
      )}
      
      {/* آیکون سمت چپ */}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className={cn(
          "h-4 w-4 flex-shrink-0",
          size === 'sm' && "h-3 w-3",
          size === 'lg' && "h-5 w-5",
          size === 'xl' && "h-6 w-6",
        )} />
      )}
      
      {/* متن */}
      {children}
      
      {/* آیکون سمت راست */}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={cn(
          "h-4 w-4 flex-shrink-0",
          size === 'sm' && "h-3 w-3",
          size === 'lg' && "h-5 w-5",
          size === 'xl' && "h-6 w-6",
        )} />
      )}
    </>
  )

  return (
    <Comp
      className={cn(
        buttonVariants({ variant, size, fullWidth, loading, className }),
        loadingClassName,
        // استایل اضافی برای دکمه‌های با آیکون
        Icon && !children && "px-0",
        // استایل برای دکمه‌های غیرفعال
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {asChild ? children : content}
    </Comp>
  )
})
Button.displayName = "Button"

// ==================== Button Group (جدید) ====================
const ButtonGroup = React.forwardRef(({ 
  className, 
  children,
  orientation = 'horizontal',
  spacing = 'default',
  ...props 
}, ref) => {
  const orientations = {
    horizontal: 'flex-row',
    vertical: 'flex-col',
  }

  const spacings = {
    none: 'gap-0',
    sm: 'gap-1',
    default: 'gap-2',
    lg: 'gap-3',
    xl: 'gap-4',
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex",
        orientations[orientation] || orientations.horizontal,
        spacings[spacing] || spacings.default,
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child
        
        // برای دکمه‌های مجاور با فاصله ۰
        if (spacing === 'none' && orientation === 'horizontal') {
          return React.cloneElement(child, {
            className: cn(
              child.props.className,
              "rounded-none first:rounded-r-xl first:rounded-l-none last:rounded-l-xl last:rounded-r-none",
              index > 0 && index < React.Children.count(children) - 1 && "rounded-none",
              "border-l-0 first:border-l-2"
            ),
          })
        }
        
        return child
      })}
    </div>
  )
})
ButtonGroup.displayName = "ButtonGroup"

// ==================== Icon Button (جدید) ====================
const IconButton = React.forwardRef(({ 
  className,
  icon: Icon,
  label,
  variant = 'ghost',
  size = 'icon',
  ...props 
}, ref) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "relative group",
        className
      )}
      {...props}
    >
      <Icon className="h-4 w-4" />
      {label && (
        <span className="sr-only">{label}</span>
      )}
    </Button>
  )
})
IconButton.displayName = "IconButton"

// ==================== Loading Button (جدید) ====================
const LoadingButton = React.forwardRef(({ 
  className,
  loading = true,
  loadingText = 'در حال بارگذاری...',
  children,
  ...props 
}, ref) => {
  return (
    <Button
      ref={ref}
      loading={loading}
      className={className}
      {...props}
    >
      {loading ? loadingText : children}
    </Button>
  )
})
LoadingButton.displayName = "LoadingButton"

// ==================== صادرات ====================
export { 
  Button, 
  buttonVariants,
  ButtonGroup,
  IconButton,
  LoadingButton,
}