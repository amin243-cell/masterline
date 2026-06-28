import { Edit3, Trash2 } from 'lucide-react'
import { formatNumber } from '../../lib/helpers'

const categoryConfig = {
  gold: { label: 'طلا', color: 'yellow', emoji: '🥇' },
  silver: { label: 'نقره', color: 'slate', emoji: '🥈' },
  car: { label: 'خودرو', color: 'blue', emoji: '🚗' },
  cash: { label: 'پول نقد', color: 'green', emoji: '💵' },
  realEstate: { label: 'ملک', color: 'purple', emoji: '🏠' },
  other: { label: 'سایر', color: 'gray', emoji: '📦' },
}

export default function AssetCard({ asset, onEdit, onDelete }) {
  const config = categoryConfig[asset.category] || categoryConfig.other
  const profit = (asset.currentPrice - asset.buyPrice) * asset.amount
  const profitPercent = ((asset.currentPrice - asset.buyPrice) / asset.buyPrice * 100).toFixed(1)
  const isProfit = profit >= 0

  return (
    <div className="p-5 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30 hover:border-emerald-500/30 transition-all duration-300 group">
      {/* هدر کارت */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{config.emoji}</div>
          <div>
            <h4 className="text-white font-semibold">{asset.name}</h4>
            <span className="text-xs text-slate-400">{config.label} • {asset.amount} {asset.unit}</span>
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(asset)}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition-all"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(asset.id)}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* اطلاعات قیمت */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">قیمت خرید:</span>
          <span className="text-slate-300 font-mono">{formatNumber(asset.buyPrice * asset.amount)} ریال</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">ارزش فعلی:</span>
          <span className="text-white font-bold font-mono">{formatNumber(asset.currentPrice * asset.amount)} ریال</span>
        </div>
        <div className="h-px bg-slate-700/50 my-2" />
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">سود/ضرر:</span>
          <div className="text-left">
            <p className={`font-bold font-mono ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
              {isProfit ? '+' : ''}{formatNumber(profit)} ریال
            </p>
            <p className={`text-xs ${isProfit ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
              {isProfit ? '+' : ''}{profitPercent}%
            </p>
          </div>
        </div>
      </div>

      {/* تاریخ خرید و یادداشت */}
      {(asset.buyDate || asset.note) && (
        <div className="mt-3 pt-3 border-t border-slate-700/30 space-y-1">
          {asset.buyDate && (
            <p className="text-xs text-slate-500">📅 تاریخ خرید: {asset.buyDate}</p>
          )}
          {asset.note && (
            <p className="text-xs text-slate-500 truncate">📝 {asset.note}</p>
          )}
        </div>
      )}
    </div>
  )
}