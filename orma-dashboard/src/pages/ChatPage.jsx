import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'
import { chatWithMemories } from '../lib/api'
import LoadingIndicator from '../components/LoadingIndicator'

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hello! I am your AI assistant. Ask me anything about your saved memories." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: 'user', text: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // AI call
      const { answer, sources } = await chatWithMemories(input)
      setMessages((prev) => [...prev, { role: 'assistant', text: answer, sources }])
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', text: "Sorry, I'm having trouble connecting to the AI." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[80vh] max-w-3xl mx-auto border rounded-xl bg-white shadow-sm">
      <div className="p-4 border-b font-bold text-lg">AI Memory Assistant</div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
            {m.role === 'assistant' && <Bot size={20} className="text-accent" />}
            <div className={`p-3 rounded-lg max-w-[80%] ${m.role === 'user' ? 'bg-accent text-white' : 'bg-surface border'}`}>
              {m.text}
            </div>
            {m.role === 'user' && <User size={20} className="text-gray-400" />}
          </div>
        ))}
        {loading && <LoadingIndicator label="AI is thinking..." />}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your memories..."
          className="flex-1 border rounded-lg p-2 focus:outline-none"
        />
        <button type="submit" className="bg-accent text-white p-2 rounded-lg hover:bg-accent-dark">
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}