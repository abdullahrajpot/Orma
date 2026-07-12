import { useState } from 'react'

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={[
        'relative h-6 w-11 flex-shrink-0 rounded-full transition-colors',
        checked ? 'bg-accent' : 'bg-border',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        ].join(' ')}
      />
    </button>
  )
}

export default function SettingsPage() {
  const [autoSummary, setAutoSummary] = useState(true)
  const [autoGroup, setAutoGroup] = useState(true)
  const [emailDigest, setEmailDigest] = useState(false)

  const rows = [
    { label: 'Auto-summarize saved pages', desc: 'Generate a summary the moment a page is saved.', value: autoSummary, set: setAutoSummary },
    { label: 'Auto-group into workspaces', desc: 'File related pages into the same project automatically.', value: autoGroup, set: setAutoGroup },
    { label: 'Weekly email digest', desc: 'A short recap of what you saved and revisited this week.', value: emailDigest, set: setEmailDigest },
  ]

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-[22px] font-bold text-ink">Settings</h1>

      <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-surface">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-[13.5px] font-medium text-ink">{row.label}</p>
              <p className="mt-0.5 text-[12px] text-ink-soft">{row.desc}</p>
            </div>
            <Toggle checked={row.value} onChange={row.set} />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-[13.5px] font-semibold text-red-700">Delete account</p>
        <p className="mt-1 text-[12px] text-red-600/80">
          Permanently removes your saved memories. This can't be undone.
        </p>
        <button className="mt-3 rounded-lg border border-red-300 px-4 py-2 text-[12.5px] font-semibold text-red-700 hover:bg-red-100">
          Delete my account
        </button>
      </div>
    </div>
  )
}
