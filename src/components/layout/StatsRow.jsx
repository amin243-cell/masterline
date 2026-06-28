export default function StatsRow({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.iconBg}`}>
              {stat.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 truncate">{stat.label}</p>
              <p className={`text-lg font-bold font-mono truncate ${stat.valueClass || 'text-white'}`}>
                {stat.value}
                {stat.unit && <span className="text-xs text-slate-400 mr-1">{stat.unit}</span>}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}