import { Link } from 'react-router-dom'
import { Search, MessageSquare, FolderTree, Plug } from 'lucide-react'

function CaptureDemo() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-[0_20px_50px_-24px_rgba(34,38,46,0.25)]">
      <div className="mb-4 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
      </div>
      <div className="animate-capture-bar rounded-lg border border-border bg-surface-alt px-3 py-2 text-[12px] text-ink-soft">
        pinecone.io/learn/vector-databases
      </div>

      <div className="relative mt-4 h-[92px]">
        <div className="animate-capture-card absolute inset-0 flex items-start gap-3 rounded-xl border border-border bg-bg p-3">
          <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-accent text-[12px] font-bold text-white">
            ഓ
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-[13.5px] font-semibold text-ink">
              Vector Databases, Explained
            </p>
            <p className="mt-1 text-[11.5px] text-ink-soft">Saved to RAG Research · just now</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const features = [
  {
    icon: Plug,
    title: 'One-click save',
    body: 'Click the Orma icon on any page. It cleans the article and stores it — no folders to pick.',
  },
  {
    icon: Search,
    title: 'Ask, don\u2019t search',
    body: 'Describe what you remember in plain words. Orma finds the page, even if you forgot the title.',
  },
  {
    icon: MessageSquare,
    title: 'Chat with your reading',
    body: 'Ask a question that spans several saved pages and get one answer, with sources linked.',
  },
  {
    icon: FolderTree,
    title: 'Groups itself',
    body: 'Related pages land in the same workspace automatically, from the first page you save.',
  },
]

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-14 px-6 pb-20 pt-16 md:flex-row md:pt-24">
        <div className="max-w-xl text-center md:text-left">
          <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-accent">
            Chrome extension · in early access
          </p>
          <h1 className="font-display text-[40px] font-bold leading-[1.1] text-ink md:text-[48px]">
            You already read it once.
            <br />
            You shouldn&apos;t have to find it again.
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-ink-soft">
            Orma saves what you read, understands it in the background, and lets you
            ask for it back in plain language — weeks later, without the tab.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:justify-start">
            <a
              href="https://chrome.google.com/webstore/detail/orma-automatic-screen-memory/"
              target="_blank"
              rel="noreferrer"
              className="w-full rounded-lg bg-accent px-6 py-3 text-center text-[14px] font-semibold text-white hover:bg-accent-dark sm:w-auto"
            >
              Add to Chrome — it&apos;s free
            </a>
            <a
              href="#how-it-works"
              className="w-full rounded-lg border border-border px-6 py-3 text-center text-[14px] font-semibold text-ink hover:bg-surface-alt sm:w-auto"
            >
              See how it works
            </a>
          </div>
        </div>

        <CaptureDemo />
      </section>

      {/* Problem */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="max-w-2xl font-display text-[26px] font-bold leading-snug text-ink">
            Bookmarks are where research goes to be forgotten.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
            Notes apps live outside the browser, so saving anything takes an extra
            step you skip on a deadline. What you read stays trapped on the one tab
            you already closed.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-2 font-display text-[26px] font-bold text-ink">What Orma actually does</h2>
        <p className="mb-10 max-w-xl text-[15px] text-ink-soft">
          Four things, working together in the background while you keep browsing.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-border bg-surface p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft">
                <Icon size={18} strokeWidth={2} className="text-accent" />
              </div>
              <h3 className="font-display text-[16px] font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="mb-10 font-display text-[26px] font-bold text-ink">How it works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              ['Save', 'Click the Orma icon. The page is cleaned and stored in seconds.'],
              ['Understand', 'Orma reads it in the background and files it with related pages.'],
              ['Recall', 'Search in your own words, or ask the chat panel a question directly.'],
            ].map(([step, body], i) => (
              <div key={step}>
                <p className="mb-3 font-display text-[13px] font-bold text-accent">
                  Step {i + 1}
                </p>
                <h3 className="font-display text-[17px] font-semibold text-ink">{step}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="font-display text-[28px] font-bold text-ink">
          Start remembering what you read.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-ink-soft">
          Free while in early access. Takes under a minute to set up.
        </p>
        <a
          href="https://chrome.google.com/webstore/detail/orma-automatic-screen-memory/"
          target="_blank"
          rel="noreferrer"
          className="mt-7 inline-block rounded-lg bg-accent px-7 py-3 text-[14px] font-semibold text-white hover:bg-accent-dark"
        >
          Add to Chrome — it&apos;s free
        </a>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-[12.5px] text-ink-soft">
          Orma (ഓർമ്മ) — Malayalam for &ldquo;memory.&rdquo;
        </div>
      </footer>
    </div>
  )
}
