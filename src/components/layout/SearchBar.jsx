import { Search, X } from 'lucide-react'
import { Input } from '../ui/input'

export default function SearchBar({ value, onChange, placeholder = 'جستجو...' }) {
  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pr-10"
      />
      {value && (
        <button 
          onClick={() => onChange({ target: { value: '' } })} 
          className="absolute left-3 top-3 text-slate-500 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}