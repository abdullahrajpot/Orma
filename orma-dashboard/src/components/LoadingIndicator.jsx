export default function LoadingIndicator({ label = 'Working on it…' }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-alt px-4 py-3">
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
      </span>
      <span className="text-[13px] font-medium text-ink-soft">{label}</span>
    </div>
  )
}
