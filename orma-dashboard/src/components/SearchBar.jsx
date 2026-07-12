import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = "Ask about anything you've read…" }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3.5 py-2.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
      <Search size={16} strokeWidth={2} className="flex-shrink-0 text-ink-soft" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[13.5px] text-ink placeholder:text-ink-soft focus:outline-none"
      />
    </div>
  )
}
