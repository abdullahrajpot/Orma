import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, ExternalLink, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { chatWithMemories } from '../lib/api'
import LoadingIndicator from '../components/LoadingIndicator'

const SUGGESTIONS = [
  "How many API keys did I create yesterday?",
  "What did I read about MongoDB today?",
  "What was I doing when creating the bazar project?",
  "Show me what I browsed this week",
]

function formatTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// Full inline source card: screenshot on left, info on right
function SourceCard({ source, index }) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-surface overflow-hidden hover:border-accent/40 transition-colors">
      {/* Screenshot */}
      <Link to={`/app/capture/${source.id || source._id}`} className="flex-shrink-0">
        {source.screenshot ? (
          <img
            src={source.screenshot}
            alt={source.title}
            className="w-32 h-24 object-cover object-top border-r border-border"
          />
        ) : (
          <div className="w-32 h-24 bg-surface-alt border-r border-border flex items-center justify-center text-[10px] text-ink-soft">
            No preview
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 py-2.5 pr-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-accent uppercase tracking-wide">
              [{index + 1}] {source.category || 'General'}
            </span>
            <Link
              to={`/app/capture/${source.id || source._id}`}
              className="block font-display text-[13px] font-semibold text-ink truncate hover:text-accent mt-0.5"
            >
              {source.title}
            </Link>
          </div>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 text-ink-soft hover:text-accent mt-0.5"
          >
            <ExternalLink size={13} />
          </a>
        </div>

        <div className="flex items-center gap-1.5 mt-1">
          <Clock size={11} className="text-ink-soft flex-shrink-0" />
          <span className="text-[11px] text-ink-soft">{formatTime(source.capturedAt)}</span>
        </div>

        <span className="text-[11px] text-ink-soft">{source.domain}</span>

        {/* AI summary or visual description — prefer visual since it's richer */}
        {(source.visualDescription || source.summary) && (
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-soft line-clamp-3">
            {source.visualDescription || source.summary}
          </p>
        )}
      </div>
    </div>
  )
}

// Assistant message: analysis text + sources
function AssistantMessage({ message }) {
  return (
    <div className="flex gap-2.5 justify-start">
      <div className="h-7 w-7 flex-shrink-0 flex items-center justify-center rounded-full bg-accent-soft mt-0.5">
        <Bot size={14} className="text-accent" />
      </div>

      <div className="max-w-[90%] space-y-3">
        {/* Analysis text */}
        <div className="rounded-xl rounded-bl-sm border border-border bg-surface px-4 py-3">
          <p className="text-[13.5px] leading-relaxed text-ink whitespace-pre-wrap">
            {message.text}
          </p>
        </div>

        {/* Sources with screenshots */}
        {message.sources?.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft px-1">
              📎 Sources from your memory ({message.sources.length})
            </p>
            <div className="space-y-2">
              {message.sources.map((s, i) => (
                <SourceCard key={i} source={s} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! I'm your Orma memory assistant.\n\nAsk me anything about what you've browsed and I'll give you a detailed answer with screenshots as evidence — even days later.",
      sources: [],
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend(text) {
    const q = (text || input).trim()
    if (!q) return
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setInput('')
    setLoading(true)
    try {
      const { answer, sources } = await chatWithMemories(q)
      setMessages(prev => [...prev, { role: 'assistant', text: answer, sources: sources || [] }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "Sorry, I couldn't connect to the backend. Make sure it's running on localhost:5000.",
        sources: [],
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[85vh] max-w-3xl rounded-xl border border-border bg-surface shadow-sm overflow-hidden">

      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-2 flex-shrink-0">
        <Bot size={18} className="text-accent" />
        <span className="font-display text-[15px] font-bold text-ink">Memory Chat</span>
        <span className="ml-auto text-[11.5px] text-ink-soft">
          Analysis + screenshots from your browsing
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-bg">
        {messages.map((m, i) => (
          m.role === 'user' ? (
            <div key={i} className="flex gap-2.5 justify-end">
              <div className="max-w-[80%] rounded-xl rounded-br-sm bg-accent px-4 py-3 text-[13.5px] leading-relaxed text-white">
                {m.text}
              </div>
              <div className="h-7 w-7 flex-shrink-0 flex items-center justify-center rounded-full bg-surface-alt mt-0.5">
                <User size={14} className="text-ink-soft" />
              </div>
            </div>
          ) : (
            <AssistantMessage key={i} message={m} />
          )
        ))}

        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="h-7 w-7 flex-shrink-0 flex items-center justify-center rounded-full bg-accent-soft">
              <Bot size={14} className="text-accent" />
            </div>
            <LoadingIndicator label="Analyzing your memory…" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion chips — only on first message */}
      {messages.length === 1 && (
        <div className="px-4 pt-3 pb-2 flex flex-wrap gap-2 border-t border-border bg-surface flex-shrink-0">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => handleSend(s)}
              className="rounded-full border border-border bg-accent-soft px-3 py-1.5 text-[11.5px] font-semibold text-accent hover:bg-accent hover:text-white transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={e => { e.preventDefault(); handleSend() }}
        className="p-3 border-t border-border flex gap-2 bg-surface flex-shrink-0"
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about anything you've browsed…"
          className="flex-1 rounded-lg border border-border bg-bg px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-ink-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-lg bg-accent px-4 py-2.5 text-white hover:bg-accent-dark disabled:opacity-50 flex items-center"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
