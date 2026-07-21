import { Link } from 'react-router-dom'
import { Search, MessageSquare, Camera, Brain, ArrowRight, Check, Zap, Shield, Clock } from 'lucide-react'

// ── Live capture demo ────────────────────────────────────────────────────────
function CaptureDemo() {
  return (
    <div className="relative w-full max-w-[420px]">
      {/* Glow behind the card */}
      <div className="absolute inset-0 rounded-3xl bg-accent/20 blur-3xl scale-90 -z-10" />

      {/* Browser mockup */}
      <div className="glass rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <span className="h-3 w-3 rounded-full bg-red-400/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
          <span className="h-3 w-3 rounded-full bg-green-400/80" />
          <div className="animate-capture-bar flex-1 ml-2 rounded-md bg-white/10 px-3 py-1.5 text-[11px] text-white/60 font-mono">
            console.groq.com/keys
          </div>
          {/* Orma recording indicator */}
          <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 rounded-full px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-green-400">Recording</span>
          </div>
        </div>

        {/* Page content mockup */}
        <div className="p-5 space-y-3">
          <div className="h-2.5 w-3/4 rounded-full bg-white/10" />
          <div className="h-2.5 w-1/2 rounded-full bg-white/10" />
          <div className="h-2.5 w-5/6 rounded-full bg-white/10" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 rounded-lg bg-white/5 border border-white/10" />
            ))}
          </div>
        </div>

        {/* Capture notification — animated */}
        <div className="px-5 pb-5">
          <div className="animate-capture-card rounded-xl bg-gradient-to-r from-accent/80 to-[#5b8ab0]/80 p-3.5 shadow-lg">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/20 font-display text-[13px] font-bold text-white">
                ഓ
              </span>
              <div className="min-w-0">
                <p className="font-display text-[12.5px] font-semibold text-white truncate">
                  📸 Captured &amp; analyzed with AI
                </p>
                <p className="mt-0.5 text-[11px] text-white/70">console.groq.com · Dev/Tech · just now</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating chat bubble */}
      <div className="absolute -bottom-6 -right-4 glass rounded-2xl p-3.5 shadow-xl max-w-[200px]">
        <p className="text-[11px] text-white/60 mb-1">You asked:</p>
        <p className="text-[12px] text-white font-medium">"What API keys did I create yesterday?"</p>
        <div className="mt-2 h-1 w-3/4 rounded-full bg-accent/60" />
        <div className="mt-1.5 h-1 w-1/2 rounded-full bg-accent/40" />
      </div>
    </div>
  )
}

// ── Stats ────────────────────────────────────────────────────────────────────
const stats = [
  { value: '15s', label: 'Capture interval' },
  { value: 'AI', label: 'Vision analysis' },
  { value: '∞', label: 'Memory depth' },
  { value: '100%', label: 'Private & local' },
]

// ── Features ─────────────────────────────────────────────────────────────────
const features = [
  {
    icon: Camera,
    gradient: 'from-blue-500/20 to-indigo-500/20',
    iconColor: 'text-blue-400',
    title: 'Auto-captures everything',
    body: 'Every 15 seconds, Orma silently takes a screenshot and captures page content while you browse — no clicks, no interruptions.',
  },
  {
    icon: Brain,
    gradient: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-400',
    title: 'AI reads your screenshots',
    body: 'Vision AI describes what was literally on your screen — tables, counts, forms, UI elements — so you can ask about it later.',
  },
  {
    icon: Search,
    gradient: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-400',
    title: 'Ask in plain language',
    body: '"What API keys did I create yesterday?" Orma searches your visual memory and gives a detailed answer with screenshots as proof.',
  },
  {
    icon: MessageSquare,
    gradient: 'from-orange-500/20 to-amber-500/20',
    iconColor: 'text-orange-400',
    title: 'Chat with your history',
    body: 'Ask questions that span days or weeks of browsing. Get specific, cited answers with visual evidence from your own screen.',
  },
]

// ── How it works steps ────────────────────────────────────────────────────────
const steps = [
  {
    num: '01',
    title: 'Install & enable',
    body: 'Load the Chrome extension and toggle recording on. That\'s it — Orma works in the background.',
    icon: Zap,
  },
  {
    num: '02',
    title: 'Browse normally',
    body: 'Every 15 seconds, Orma captures your active tab — screenshot, content, and AI analysis, silently.',
    icon: Camera,
  },
  {
    num: '03',
    title: 'Ask anything',
    body: 'Days later, ask what you saw. Get a detailed AI answer with screenshots proving exactly what was on your screen.',
    icon: MessageSquare,
  },
]

// ── Testimonial-style use cases ───────────────────────────────────────────────
const useCases = [
  {
    quote: '"What was that MongoDB cluster I set up last week?"',
    answer: 'You visited MongoDB Atlas on Jul 14 at 5:09 PM. The screenshot shows Cluster0 was created with M0 free tier in us-east-1.',
  },
  {
    quote: '"How many Groq API keys did I create yesterday?"',
    answer: 'You visited the GroqCloud API Keys page at 5:09 PM. The screenshot shows 3 API keys listed in the management table.',
  },
  {
    quote: '"What was I reading about vector databases?"',
    answer: 'You visited Pinecone\'s documentation on Jul 14. The article explained HNSW algorithms and approximate nearest-neighbor search.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="overflow-hidden">

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="hero-gradient relative min-h-screen flex items-center">
        {/* Background layers */}
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        <div className="hero-grid absolute inset-0 pointer-events-none opacity-40" />

        {/* Floating orbs */}
        <div className="orb-1 absolute top-20 left-[10%] h-72 w-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="orb-2 absolute bottom-20 right-[10%] h-96 w-96 rounded-full bg-blue-500/8 blur-3xl pointer-events-none" />
        <div className="orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 w-full">
          <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-center lg:gap-20">

            {/* Left copy */}
            <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 mb-8">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[12px] font-semibold text-white/80 tracking-wide uppercase">
                  Chrome Extension · AI-Powered Memory
                </span>
              </div>

              <h1 className="font-display text-[44px] font-bold leading-[1.08] md:text-[56px] lg:text-[62px]">
                <span className="gradient-text">Your screen,</span>
                <br />
                <span className="text-white">perfectly remembered.</span>
              </h1>

              <p className="mt-6 text-[17px] leading-relaxed text-white/65 max-w-lg mx-auto lg:mx-0">
                Orma automatically captures your browsing every 15 seconds. Ask what you saw, read, or did — days later — and get detailed AI answers with screenshots as proof.
              </p>

              {/* CTA buttons */}
              <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  to="/signup"
                  className="btn-glow w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-4 text-[15px] font-bold text-white hover:bg-accent-dark"
                >
                  Get started free
                  <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/6 px-8 py-4 text-[15px] font-semibold text-white/80 hover:bg-white/12 hover:text-white"
                >
                  See how it works
                </a>
              </div>

              {/* Trust signals */}
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-5">
                {[
                  { icon: Check, text: 'Free to start' },
                  { icon: Shield, text: 'Data stays on your machine' },
                  { icon: Clock, text: 'Set up in 60 seconds' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-[13px] text-white/55">
                    <Icon size={13} className="text-green-400 flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right demo */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <CaptureDemo />
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-20 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map(({ value, label }, i) => (
              <div
                key={label}
                className="glass rounded-2xl px-6 py-5 text-center stat-pop"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <p className="font-display text-[28px] font-bold text-white">{value}</p>
                <p className="mt-1 text-[12px] text-white/50 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PROBLEM STRIP ═════════════════════════════════════════════════════ */}
      <section className="bg-surface border-y border-border">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-12">
            <div className="text-[32px] flex-shrink-0">💭</div>
            <div>
              <h2 className="font-display text-[20px] md:text-[22px] font-bold text-ink leading-snug">
                "What was that website I visited last Tuesday? The one with the pricing table?"
              </h2>
              <p className="mt-2 text-[14px] text-ink-soft">
                Bookmarks fail. Notes apps are a chore. Orma just remembers — automatically, visually, precisely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════════════════ */}
      <section id="features" className="bg-bg py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-accent mb-3">Capabilities</p>
            <h2 className="font-display text-[34px] md:text-[42px] font-bold text-ink leading-tight">
              More than bookmarks.
              <br />
              <span className="accent-gradient-text">It's your visual memory.</span>
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-[16px] text-ink-soft leading-relaxed">
              Orma captures, understands, and recalls — so you never lose what you saw.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, gradient, iconColor, title, body }) => (
              <div
                key={title}
                className="feature-card rounded-2xl border border-border bg-surface p-6 cursor-default"
              >
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}>
                  <Icon size={22} strokeWidth={1.8} className={iconColor} />
                </div>
                <h3 className="font-display text-[15.5px] font-bold text-ink mb-2">{title}</h3>
                <p className="text-[13px] leading-relaxed text-ink-soft">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="bg-surface border-y border-border py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-accent mb-3">Setup</p>
            <h2 className="font-display text-[34px] md:text-[42px] font-bold text-ink">
              Up and running in 3 steps
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative">
            {/* Connector lines on desktop */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-border via-accent/30 to-border" />

            {steps.map(({ num, title, body, icon: Icon }, i) => (
              <div key={num} className="relative text-center md:text-left group">
                <div className="inline-flex md:flex items-center gap-4 mb-5">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-accent text-white font-display text-[14px] font-bold shadow-lg shadow-accent/25 group-hover:scale-110 transition-transform mx-auto md:mx-0">
                    {num}
                  </div>
                </div>
                <h3 className="font-display text-[18px] font-bold text-ink mb-2">{title}</h3>
                <p className="text-[14px] leading-relaxed text-ink-soft">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ USE CASES / DEMO ANSWERS ═══════════════════════════════════════════ */}
      <section className="bg-bg py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-accent mb-3">In action</p>
            <h2 className="font-display text-[34px] md:text-[42px] font-bold text-ink">
              Real questions, real answers
            </h2>
            <p className="mt-4 text-[16px] text-ink-soft">
              This is what chatting with your own browsing history looks like.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {useCases.map(({ quote, answer }, i) => (
              <div key={i} className="rounded-2xl border border-border bg-surface p-6 flex flex-col gap-5">
                {/* User question */}
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-surface-alt flex-shrink-0 flex items-center justify-center text-[13px]">👤</div>
                  <div className="rounded-xl rounded-tl-sm bg-accent/10 border border-accent/20 px-4 py-3 text-[13.5px] font-medium text-accent">
                    {quote}
                  </div>
                </div>
                {/* AI answer */}
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-accent flex-shrink-0 flex items-center justify-center font-display text-[12px] font-bold text-white">ഓ</div>
                  <div className="rounded-xl rounded-tl-sm bg-surface-alt border border-border px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
                    {answer}
                  </div>
                </div>
                {/* Screenshot placeholder */}
                <div className="rounded-lg bg-gradient-to-br from-surface-alt to-accent-soft/30 border border-border h-20 flex items-center justify-center gap-2 text-[11.5px] text-ink-soft">
                  <Camera size={14} className="text-accent" />
                  Screenshot evidence attached
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════════════════ */}
      <section className="hero-gradient relative py-24 overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        <div className="hero-grid absolute inset-0 pointer-events-none opacity-30" />
        <div className="orb-1 absolute -top-20 -right-20 h-80 w-80 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div className="orb-2 absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[12px] font-semibold text-white/70 uppercase tracking-wider">Free during early access</span>
          </div>

          <h2 className="font-display text-[36px] md:text-[48px] font-bold leading-tight">
            <span className="gradient-text">Never lose a memory</span>
            <br />
            <span className="text-white">you didn't know you needed.</span>
          </h2>

          <p className="mt-5 text-[16px] text-white/60 leading-relaxed max-w-xl mx-auto">
            Sign up, install the extension, toggle recording on. Orma silently starts building your visual memory — no configuration needed.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/signup"
              className="btn-glow w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-[15px] font-bold text-accent hover:bg-white/90"
            >
              Start for free
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/6 px-8 py-4 text-[15px] font-semibold text-white/80 hover:bg-white/12 hover:text-white"
            >
              Already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════════════ */}
      <footer className="bg-surface border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-display text-[13px] font-bold text-white">ഓ</span>
              <div>
                <p className="font-display text-[14px] font-bold text-ink">Orma</p>
                <p className="text-[11px] text-ink-soft">Your AI memory layer</p>
              </div>
            </div>
            <p className="text-[12px] text-ink-soft text-center">
              Orma (ഓർമ്മ) means <em>memory</em> in Malayalam. &copy; {new Date().getFullYear()}
            </p>
            <div className="flex items-center gap-4 text-[12.5px] text-ink-soft">
              <Link to="/login" className="hover:text-accent">Log in</Link>
              <Link to="/signup" className="hover:text-accent">Sign up</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
