export default function EmptyState({ message, searchActive }) {
  return (
    <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
      {searchActive ? 'موردی یافت نشد' : message}
    </div>
  )
}