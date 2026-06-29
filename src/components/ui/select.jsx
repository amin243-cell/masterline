"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon, X } from "lucide-react"
import { cn } from "../../lib/utils"

// ==================== کامپوننت اصلی Select ====================
const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

// ==================== Select Trigger (بهبودیافته) ====================
const SelectTrigger = React.forwardRef(({ 
  className, 
  size = "default", 
  variant = "default",
  children, 
  error,
  ...props 
}, ref) => {
  // انواع مختلف استایل
  const variants = {
    default: "border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50 text-white",
    outline: "border-2 border-slate-700 bg-transparent hover:bg-slate-800/50 text-white",
    ghost: "border-transparent bg-transparent hover:bg-slate-800/50 text-white",
    glass: "border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white",
  }

  const sizes = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-8 px-3 text-xs rounded-lg",
    lg: "h-12 px-6 text-base rounded-2xl",
  }

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-full items-center justify-between gap-1.5",
        "rounded-xl border transition-all duration-200",
        "outline-none select-none",
        "focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[placeholder]:text-slate-400",
        // استایل‌های متن
        "text-sm whitespace-nowrap",
        // آیکون‌ها
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // استایل‌های خطا
        error && "border-red-500/50 ring-2 ring-red-500/20 focus-visible:border-red-500/50 focus-visible:ring-red-500/30",
        // استایل‌های مختلف
        variants[variant] || variants.default,
        sizes[size] || sizes.default,
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className={cn(
          "pointer-events-none size-4 text-slate-400 transition-transform duration-200",
          "data-[state=open]:rotate-180"
        )} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

// ==================== Select Content (بهبودیافته) ====================
const SelectContent = React.forwardRef(({ 
  className, 
  children, 
  position = "item-aligned",
  align = "center",
  sideOffset = 4,
  ...props 
}, ref) => {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        data-slot="select-content"
        position={position}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "relative z-50 min-w-36 max-h-(--radix-select-content-available-height)",
          "overflow-x-hidden overflow-y-auto",
          "rounded-2xl border border-slate-700/50",
          "bg-gradient-to-br from-slate-900 to-slate-950",
          "text-white",
          "shadow-2xl shadow-black/50",
          "p-1.5",
          "duration-200",
          "data-[align-trigger=true]:animate-none",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          "data-[side=top]:slide-in-from-bottom-2",
          "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
          "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          position === "popper" && 
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          data-position={position}
          className={cn(
            "p-1",
            position === "popper" && 
              "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})
SelectContent.displayName = SelectPrimitive.Content.displayName

// ==================== Select Label (بهبودیافته) ====================
const SelectLabel = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      "px-2.5 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider",
      className
    )}
    {...props}
  >
    {children}
  </SelectPrimitive.Label>
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

// ==================== Select Item (بهبودیافته) ====================
const SelectItem = React.forwardRef(({ 
  className, 
  children, 
  variant = "default",
  ...props 
}, ref) => {
  // انواع آیتم‌ها
  const variants = {
    default: "hover:bg-slate-800/50 focus:bg-slate-800/50",
    danger: "text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 data-[highlighted]:text-red-300",
    success: "text-emerald-400 hover:bg-emerald-500/10 focus:bg-emerald-500/10 data-[highlighted]:text-emerald-300",
  }

  return (
    <SelectPrimitive.Item
      ref={ref}
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-2",
        "rounded-xl py-2.5 px-3 text-sm",
        "outline-none select-none",
        "transition-all duration-150",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "data-[highlighted]:scale-[1.01]",
        // استایل‌های مختلف
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute right-3 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4 text-emerald-400" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText className="flex-1 pr-6">
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
})
SelectItem.displayName = SelectPrimitive.Item.displayName

// ==================== Select Separator ====================
const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("pointer-events-none -mx-1 my-1.5 h-px bg-slate-700/50", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

// ==================== Select Scroll Buttons ====================
const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1.5 text-slate-400 hover:text-white",
      "[&_svg:not([class*='size-'])]:size-4",
      className
    )}
    {...props}
  >
    <ChevronUpIcon />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1.5 text-slate-400 hover:text-white",
      "[&_svg:not([class*='size-'])]:size-4",
      className
    )}
    {...props}
  >
    <ChevronDownIcon />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

// ==================== Select Clear (جدید) ====================
const SelectClear = React.forwardRef(({ 
  className,
  onClear,
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClear}
      className={cn(
        "absolute right-10 top-1/2 -translate-y-1/2",
        "text-slate-400 hover:text-white",
        "transition-colors duration-200",
        "p-0.5 rounded-lg hover:bg-slate-700/50",
        className
      )}
      {...props}
    >
      <X className="size-3.5" />
    </button>
  )
})
SelectClear.displayName = "SelectClear"

// ==================== Select with Search (جدید) ====================
const SelectSearch = React.forwardRef(({
  className,
  placeholder = "جستجو...",
  value,
  onChange,
  ...props
}, ref) => {
  return (
    <div className="relative px-2 py-1.5 border-b border-slate-700/50">
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full px-3 py-1.5 text-sm",
          "rounded-lg border border-slate-700/50",
          "bg-slate-800/50 text-white",
          "placeholder:text-slate-400",
          "focus:outline-none focus:border-emerald-500/50",
          "transition-colors duration-200",
          className
        )}
        {...props}
      />
    </div>
  )
})
SelectSearch.displayName = "SelectSearch"

// ==================== صادرات ====================
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectClear,
  SelectSearch,
}