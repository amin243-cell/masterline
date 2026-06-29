import * as React from "react"
import { cn } from "../../lib/utils"
import { Eye, EyeOff, Search, X, AlertCircle, CheckCircle } from "lucide-react"

const Input = React.forwardRef(({ 
  className, 
  type = "text",
  variant = "default",
  size = "default",
  error,
  success,
  icon: Icon,
  iconPosition = "left",
  clearable = false,
  onClear,
  loading = false,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)
  const inputRef = React.useRef(null)

  React.useImperativeHandle(ref, () => inputRef.current)

  const variants = {
    default: "border-slate-700 bg-slate-800/50 hover:border-slate-600 focus:border-emerald-500/50",
    outline: "border-2 border-slate-700 bg-transparent hover:border-slate-600 focus:border-emerald-500/50",
    ghost: "border-transparent bg-slate-800/30 hover:bg-slate-800/50 focus:bg-slate-800/50",
    glass: "border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 focus:border-emerald-500/30",
    filled: "border-transparent bg-slate-800 hover:bg-slate-700 focus:bg-slate-700 focus:border-emerald-500/30",
  }

  const sizes = {
    sm: "h-8 px-3 py-1.5 text-xs rounded-lg",
    default: "h-10 px-4 py-2 text-sm rounded-xl",
    lg: "h-12 px-5 py-3 text-base rounded-2xl",
  }

  const statusStyles = error 
    ? "border-red-500/50 ring-2 ring-red-500/20 focus:border-red-500/50 focus:ring-red-500/30" 
    : success 
      ? "border-emerald-500/50 ring-2 ring-emerald-500/20 focus:border-emerald-500/50 focus:ring-emerald-500/30" 
      : ""

  const hasIcon = Icon || (type === 'search') || clearable || (type === 'password')
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  const handleClear = () => {
    if (onClear) {
      onClear()
    } else if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.focus()
      const event = new Event('input', { bubbles: true })
      inputRef.current.dispatchEvent(event)
    }
  }

  const RightIcon = isPassword ? (showPassword ? EyeOff : Eye) : (type === 'search' ? Search : null)

  // تبدیل error و success به boolean برای استفاده در کلاس‌ها
  const hasError = !!error
  const hasSuccess = !!success

  return (
    <div className="relative w-full">
      {Icon && iconPosition === 'left' && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon className={cn(
            "h-4 w-4",
            hasError ? "text-red-400" : hasSuccess ? "text-emerald-400" : "text-slate-400",
            isFocused && !hasError && !hasSuccess && "text-emerald-400"
          )} />
        </div>
      )}

      <input
        ref={inputRef}
        type={inputType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "w-full",
          "rounded-xl border transition-all duration-200",
          "text-white placeholder:text-slate-500",
          "focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variants[variant] || variants.default,
          sizes[size] || sizes.default,
          statusStyles,
          hasIcon && "pl-10",
          (RightIcon || clearable || (type === 'search') || (iconPosition === 'right' && Icon)) && "pr-10",
          loading && "opacity-50 cursor-wait",
          className
        )}
        {...props}
      />

      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
        </div>
      )}

      {RightIcon && !loading && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2",
            "text-slate-400 hover:text-white",
            "transition-colors duration-200",
            "focus:outline-none"
          )}
          tabIndex={-1}
        >
          <RightIcon className="h-4 w-4" />
        </button>
      )}

      {clearable && !loading && props.value && props.value.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2",
            "text-slate-400 hover:text-white",
            "transition-colors duration-200",
            "focus:outline-none",
            RightIcon && "right-9"
          )}
          tabIndex={-1}
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {!loading && (hasError || hasSuccess) && !RightIcon && !clearable && (
        <div className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2",
          "pointer-events-none"
        )}>
          {hasError ? (
            <AlertCircle className="h-4 w-4 text-red-400" />
          ) : (
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          )}
        </div>
      )}

      {/* نمایش خطا - فقط اگر از نوع string باشد */}
      {hasError && typeof error === 'string' && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {/* نمایش موفقیت - فقط اگر از نوع string باشد */}
      {hasSuccess && typeof success === 'string' && (
        <p className="mt-1.5 text-xs text-emerald-400 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          {success}
        </p>
      )}
    </div>
  )
})
Input.displayName = "Input"

const InputGroup = React.forwardRef(({ 
  className,
  children,
  label,
  description,
  error,
  required,
  ...props 
}, ref) => {
  // تبدیل error به string برای نمایش
  const errorMessage = typeof error === 'string' ? error : null

  return (
    <div ref={ref} className={cn("space-y-1.5", className)} {...props}>
      {label && (
        <label className="flex items-center gap-1 text-sm font-medium text-white">
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>
      )}
      {children}
      {description && !errorMessage && (
        <p className="text-xs text-slate-400">{description}</p>
      )}
      {errorMessage && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {errorMessage}
        </p>
      )}
    </div>
  )
})
InputGroup.displayName = "InputGroup"

const InputField = React.forwardRef(({ 
  className,
  label,
  description,
  error,
  success,
  required,
  ...props 
}, ref) => {
  return (
    <InputGroup
      label={label}
      description={description}
      error={error}
      required={required}
      className={className}
    >
      <Input
        ref={ref}
        error={error}
        success={success}
        {...props}
      />
    </InputGroup>
  )
})
InputField.displayName = "InputField"

const SearchInput = React.forwardRef(({ 
  className,
  onSearch,
  debounce = 300,
  ...props 
}, ref) => {
  const [value, setValue] = React.useState('')
  const timeoutRef = React.useRef(null)

  const handleChange = (e) => {
    const newValue = e.target.value
    setValue(newValue)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (onSearch) {
        onSearch(newValue)
      }
    }, debounce)
  }

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <Input
      ref={ref}
      type="search"
      value={value}
      onChange={handleChange}
      icon={Search}
      clearable
      onClear={() => {
        setValue('')
        if (onSearch) onSearch('')
      }}
      className={className}
      {...props}
    />
  )
})
SearchInput.displayName = "SearchInput"

const PasswordInput = React.forwardRef(({ 
  className,
  ...props 
}, ref) => {
  return (
    <Input
      ref={ref}
      type="password"
      className={className}
      {...props}
    />
  )
})
PasswordInput.displayName = "PasswordInput"

export { 
  Input, 
  InputGroup, 
  InputField,
  SearchInput,
  PasswordInput,
}