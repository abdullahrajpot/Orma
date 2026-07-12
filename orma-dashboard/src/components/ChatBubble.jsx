import { Link } from 'react-router-dom'

export default function ChatBubble({ role, text, sources = [] }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[85%] rounded-xl px-4 py-3 text-[13.5px] leading-relaxed',
          isUser
            ? 'bg-accent text-white'
            : 'border border-border bg-surface text-ink',
        ].join(' ')}
      >
        <p>{text}</p>
        {sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {sources.map((s) => (
              <Link
                key={s.id}
                to={`/app/memory/${s.id}`}
                className="rounded-full border border-border bg-accent-soft px-2.5 py-0.5 text-[10.5px] font-semibold text-accent hover:bg-accent hover:text-white"
              >
                {s.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
