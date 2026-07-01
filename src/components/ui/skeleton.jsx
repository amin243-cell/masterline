import { cn } from "../../lib/utils"

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-slate-800/50",
        className
      )}
      {...props}
    />
  )
}

export function SkeletonCard({ className, ...props }) {
  return (
    <div className={cn("p-6 rounded-2xl border border-slate-800 bg-slate-900/50", className)} {...props}>
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-2 w-full" />
    </div>
  )
}

export function SkeletonChart({ className, ...props }) {
  return (
    <div className={cn("p-6 rounded-2xl border border-slate-800 bg-slate-900/50", className)} {...props}>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-12" />
          ))}
        </div>
      </div>
      <Skeleton className="h-[300px] w-full" />
    </div>
  )
}

export function SkeletonAccountList({ count = 5, className, ...props }) {
  return (
    <div className={cn("p-6 rounded-2xl border border-slate-800 bg-slate-900/50", className)} {...props}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}