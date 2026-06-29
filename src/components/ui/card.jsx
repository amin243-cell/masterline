import * as React from "react"
import { cn } from "../../lib/utils"

// ==================== انواع کارت ====================
const CARD_VARIANTS = {
  default: {
    className: 'border-slate-800 bg-slate-900',
    headerClass: 'border-slate-800',
    footerClass: 'border-slate-800',
  },
  primary: {
    className: 'border-blue-500/30 bg-blue-950/20',
    headerClass: 'border-blue-500/30',
    footerClass: 'border-blue-500/30',
  },
  success: {
    className: 'border-emerald-500/30 bg-emerald-950/20',
    headerClass: 'border-emerald-500/30',
    footerClass: 'border-emerald-500/30',
  },
  warning: {
    className: 'border-amber-500/30 bg-amber-950/20',
    headerClass: 'border-amber-500/30',
    footerClass: 'border-amber-500/30',
  },
  danger: {
    className: 'border-red-500/30 bg-red-950/20',
    headerClass: 'border-red-500/30',
    footerClass: 'border-red-500/30',
  },
  gradient: {
    className: 'border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-950',
    headerClass: 'border-slate-700/50',
    footerClass: 'border-slate-700/50',
  },
  glow: {
    className: 'border-slate-700/50 bg-slate-900 shadow-xl shadow-emerald-500/5',
    headerClass: 'border-slate-700/50',
    footerClass: 'border-slate-700/50',
  },
  ultra: {
    className: 'border-2 border-slate-700 bg-slate-900/50 backdrop-blur-sm',
    headerClass: 'border-slate-700',
    footerClass: 'border-slate-700',
  },
}

// ==================== کامپوننت اصلی Card ====================
const Card = React.forwardRef(({ 
  className, 
  variant = 'default',
  hoverable = false,
  clickable = false,
  onClick,
  children,
  ...props 
}, ref) => {
  const cardVariant = CARD_VARIANTS[variant] || CARD_VARIANTS.default

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={cn(
        "rounded-2xl border text-white shadow-sm",
        "transition-all duration-200",
        cardVariant.className,
        hoverable && "hover:shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-500/30 hover:scale-[1.005]",
        clickable && "cursor-pointer hover:shadow-xl active:scale-[0.99]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
Card.displayName = "Card"

// ==================== Card Header ====================
const CardHeader = React.forwardRef(({ 
  className, 
  variant = 'default',
  icon: Icon,
  iconClassName,
  action: Action,
  children,
  title,
  description,
  ...props 
}, ref) => {
  const cardVariant = CARD_VARIANTS[variant] || CARD_VARIANTS.default

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-2 p-5 border-b",
        cardVariant.headerClass,
        className
      )}
      {...props}
    >
      {/* هدر با آیکون و اکشن */}
      {(Icon || Action || title) && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {Icon && (
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                "bg-slate-800/50 border border-slate-700/50"
              )}>
                <Icon className={cn("w-5 h-5 text-emerald-400", iconClassName)} />
              </div>
            )}
            {title && typeof title === 'string' ? (
              <CardTitle className="truncate">{title}</CardTitle>
            ) : (
              title
            )}
          </div>
          {Action && (
            <div className="flex-shrink-0">
              {Action}
            </div>
          )}
        </div>
      )}
      
      {/* توضیحات */}
      {description && typeof description === 'string' ? (
        <CardDescription>{description}</CardDescription>
      ) : (
        description
      )}
      
      {/* کودکان */}
      {!title && !description && children}
    </div>
  )
})
CardHeader.displayName = "CardHeader"

// ==================== Card Title ====================
const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-bold leading-none tracking-tight",
      "flex items-center gap-2 text-white",
      className
    )}
    {...props}
  >
    {children}
  </h3>
))
CardTitle.displayName = "CardTitle"

// ==================== Card Description ====================
const CardDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-slate-400 leading-relaxed",
      className
    )}
    {...props}
  >
    {children}
  </p>
))
CardDescription.displayName = "CardDescription"

// ==================== Card Content (بهبودیافته) ====================
const CardContent = React.forwardRef(({ 
  className, 
  children,
  noPadding = false,
  ...props 
}, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "p-5",
      noPadding && "p-0",
      className
    )} 
    {...props} 
  >
    {children}
  </div>
))
CardContent.displayName = "CardContent"

// ==================== Card Footer (بهبودیافته) ====================
const CardFooter = React.forwardRef(({ 
  className, 
  variant = 'default',
  align = 'left',
  children,
  ...props 
}, ref) => {
  const cardVariant = CARD_VARIANTS[variant] || CARD_VARIANTS.default
  
  const alignments = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center p-5 pt-4 border-t gap-3",
        cardVariant.footerClass,
        alignments[align] || alignments.left,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
CardFooter.displayName = "CardFooter"

// ==================== Card Grid (جدید) ====================
const CardGrid = React.forwardRef(({ 
  className, 
  children,
  cols = 1,
  gap = 4,
  ...props 
}, ref) => {
  const colsMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
  }

  const gaps = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
  }

  return (
    <div
      ref={ref}
      className={cn(
        "grid",
        colsMap[cols] || colsMap[1],
        gaps[gap] || gaps[4],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
CardGrid.displayName = "CardGrid"

// ==================== Card Stat (جدید) ====================
const CardStat = React.forwardRef(({ 
  className,
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  variant = 'default',
  ...props 
}, ref) => {
  const variants = {
    default: 'bg-slate-800/30 border-slate-700/50',
    primary: 'bg-blue-500/10 border-blue-500/30',
    success: 'bg-emerald-500/10 border-emerald-500/30',
    warning: 'bg-amber-500/10 border-amber-500/30',
    danger: 'bg-red-500/10 border-red-500/30',
  }

  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-slate-400',
  }

  const trendArrows = {
    up: '↑',
    down: '↓',
    neutral: '→',
  }

  const trendColor = trendColors[trend] || trendColors.neutral
  const trendArrow = trendArrows[trend] || trendArrows.neutral

  return (
    <div
      ref={ref}
      className={cn(
        "p-4 rounded-xl border-2",
        variants[variant] || variants.default,
        "transition-all duration-200 hover:scale-[1.02]",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-9 h-9 rounded-lg bg-slate-800/50 flex items-center justify-center">
              <Icon className="w-4 h-4 text-emerald-400" />
            </div>
          )}
          <div>
            <p className="text-xs text-slate-400 font-medium">{label}</p>
            <p className="text-xl font-black text-white">{value}</p>
          </div>
        </div>
        {trend && (
          <div className={cn(
            "text-sm font-bold",
            trendColor
          )}>
            <span className="text-base">{trendArrow}</span> {trendLabel}
          </div>
        )}
      </div>
    </div>
  )
})
CardStat.displayName = "CardStat"

// ==================== Card List (جدید) ====================
const CardList = React.forwardRef(({ 
  className,
  children,
  items = [],
  renderItem,
  emptyMessage = 'هیچ موردی یافت نشد',
  ...props 
}, ref) => {
  const hasItems = items.length > 0

  return (
    <div
      ref={ref}
      className={cn(
        "divide-y divide-slate-800/50",
        className
      )}
      {...props}
    >
      {hasItems ? (
        items.map((item, index) => (
          <div key={index} className="py-3 first:pt-0 last:pb-0">
            {renderItem ? renderItem(item, index) : children}
          </div>
        ))
      ) : (
        <div className="py-6 text-center text-sm text-slate-400">
          {emptyMessage}
        </div>
      )}
    </div>
  )
})
CardList.displayName = "CardList"

// ==================== صادرات ====================
export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardGrid,
  CardStat,
  CardList,
}