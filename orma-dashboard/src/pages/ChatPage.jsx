import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import ChatBubble from '../components/ChatBubble'
import LoadingIndicator from '../components/LoadingIndicator'
import { chatWithMemories } from '../lib/api'

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Ask me anything about what you've saved — I'll answer using only your own memories.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)

    const { answer, sources } = await chatWithMemories(text)
    setMessages((prev) => [...prev, { role: 'assistant', text: answer, sources }])
    setLoading(false)
  }

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col md:h-[calc(100vh-5rem)]">
      <div className="mb-4">
        <h1 className="font-display text-[22px] font-bold text-ink">Chat with your memory</h1>
        <p className="mt-1 text-[13.5px] text-ink-soft">
          Answers are grounded in the pages you've saved, with sources linked.
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-border bg-bg p-4">
        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role} text={m.text} sources={m.sources} />
        ))}
        {loading && <LoadingIndicator label="Reading your saved pages…" />}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="mt-4 flex items-center gap-2.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="what did I read about chunk overlap?"
          className="flex-1 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-ink-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent text-white hover:bg-accent-dark disabled:opacity-50"
        >
          <Send size={16} strokeWidth={2.2} />
        </button>
      </form>
    </div>
  )
}
