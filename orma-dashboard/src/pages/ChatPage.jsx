import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { chatWithMemories } from '../lib/api'
import LoadingIndicator from '../components/LoadingIndicator'

const SUGGESTIONS = [
  "What did I read yesterday?",
  "What videos did I watch today?",
  "What was that article about AI?",
  "Show me what I browsed this week",
]

function SourceCard({ source }) {
  return (
    <Link
      to={`/app/capture/${source.id || source._id}`}
      className="block rounded-lg border border-border overflow-hidden hover:border-accent/40 transition-colors"
    >
      {source.screenshot && (
        <img src={source.screenshot} alt={source.title} className="w-full h-20 object-cover object-top border-b border-border" />
      )}
      <div className="p-2.5">
        <p className="text-[12px] font-semibold text-ink truncate">{source.title}</p>
        <p className="text-[10.5px] text-ink-soft mt-0.5">{source.domain} · {source.category}</p>
        {source.capturedAt && (
          <p className="text-[10.5px] text-ink-soft mt-0.5">
            {new Date(source.capturedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </Link>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your Orma memory assistant. Ask me anything about what you've browsed — I'll answer using your captured screenshots and pages.\n\nTry asking: \"What did I read yesterday?\" or \"What was that article about AI?\"" }
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
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I couldn't connect to the backend. Make sure it's running on localhost:5000." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[80vh] max-w-3xl rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Bot size={18} className="text-accent" />
        <span className="font-display text-[15px] font-bold text-ink">Memory Chat</span>
        <span className="ml-auto text-[11.5px] text-ink-soft">Answers from your captured browsing</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="h-7 w-7 flex-shrink-0 flex items-center justify-center rounded-full bg-accent-soft">
                <Bot size={14} className="text-accent" />
              </div>
            )}
            <div className={`max-w-[85%] space-y-2`}>
              <div className={`rounded-xl px-4 py-3 text-[13.5px] leading-relaxed whitespace-pre-wrap ${
                m.role === 'user' ? 'bg-accent text-white rounded-br-sm' : 'bg-surface border border-border text-ink rounded-bl-sm'
              }`}>
                {m.text}
              </div>
              {m.sources?.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-ink-soft mb-1.5">Sources from your memory:</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {m.sources.map((s, si) => <SourceCard key={si} source={s} />)}
                  </div>
                </div>
              )}
            </div>
            {m.role === 'user' && (
              <div className="h-7 w-7 flex-shrink-0 flex items-center justify-center rounded-full bg-surface-alt">
                <User size={14} className="text-ink-soft" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="h-7 w-7 flex-shrink-0 flex items-center justify-center rounded-full bg-accent-soft">
              <Bot size={14} className="text-accent" />
            </div>
            <LoadingIndicator label="Searching your memory…" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion chips */}
      {messages.length === 1 && (
        <div className="px-4 pt-3 pb-1 flex flex-wrap gap-2 border-t border-border bg-surface">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => handleSend(s)}
              className="rounded-full border border-border bg-accent-soft px-3 py-1.5 text-[11.5px] font-semibold text-accent hover:bg-accent hover:text-white transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={e => { e.preventDefault(); handleSend() }}
        className="p-3 border-t border-border flex gap-2 bg-surface">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="What did I read/watch/browse…?"
          className="flex-1 rounded-lg border border-border bg-bg px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-ink-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        <button type="submit" disabled={loading || !input.trim()}
          className="rounded-lg bg-accent px-4 py-2.5 text-white hover:bg-accent-dark disabled:opacity-50">
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
