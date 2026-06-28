export default function PageLayout({ title, subtitle, children, actions }) {
  return (
    <div className="p-6 space-y-6 animate-fade-in" dir="rtl">
      {/* هدر صفحه */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {/* محتوای صفحه */}
      {children}
    </div>
  )
}