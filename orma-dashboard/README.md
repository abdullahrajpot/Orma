# Orma — Frontend (Lokesh Kumar — 5 Day Build)

React + Vite + Tailwind CSS v4. Locked palette: **Slate Ledger**.

## Run locally
```
npm install
npm run dev
```
Build: `npm run build`

## Folder structure
```
src/
├── components/
│   ├── Navbar.jsx            Public marketing nav
│   ├── Sidebar.jsx           Dashboard nav — desktop sidebar + mobile bottom bar
│   ├── DashboardLayout.jsx   Sidebar + content shell for all /app/* routes
│   ├── SearchBar.jsx         Reusable natural-language search input
│   ├── MemoryCard.jsx        Saved-page card (title, domain, tag, summary)
│   ├── ChatBubble.jsx        Chat message bubble with source citations
│   └── LoadingIndicator.jsx  Processing / async state indicator
├── pages/
│   ├── LandingPage.jsx       Marketing hero + features + how-it-works
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── DashboardPage.jsx     Memory feed, search, project filter chips
│   ├── ChatPage.jsx          RAG chat over saved memories
│   ├── SaveMemoryPage.jsx    Paste-a-link → processing → saved
│   ├── MemoryDetailsPage.jsx Single memory, summary + full content
│   ├── ProfilePage.jsx
│   └── SettingsPage.jsx
├── lib/
│   ├── api.js       API layer — every call is mocked with realistic
│   │                delay + shape; each function has the real fetch()
│   │                call commented directly below it, matching the
│   │                planned backend routes (/api/memories, /api/chat, etc.)
│   └── mockData.js  Sample memories/projects/user used until the
│                     backend is live
├── App.jsx    Routing: public pages (/,/login,/signup) + dashboard
│              shell (/app, /app/chat, /app/save, /app/memory/:id,
│              /app/profile, /app/settings)
├── main.jsx
└── index.css  Design tokens (@theme) + signature hero animation +
               global transition/motion polish
```

## Day-by-day (matches the team schedule)

**Day 1** — React + Vite project, Tailwind v4 configured with the Slate
Ledger tokens, folder structure, Landing / Login / Signup pages, Navbar.

**Day 2** — Dashboard, Sidebar (desktop + mobile), Memory Cards, Search
Bar, Profile Page, Settings Page.

**Day 3** — AI Chat Page, Save Memory Page (with step-by-step processing
indicator), Memory Details Page, Loading UI.

**Day 4** — `lib/api.js` written as the integration point for the real
backend: every function already matches the planned endpoints
(`POST /api/auth/login`, `GET /api/memories`, `GET /api/memories/search`,
`POST /api/chat`, etc.) and currently returns mocked data so the UI is
fully demoable. Search and Chat are wired end-to-end through this layer.
Swap the mock body for the commented `fetch()` call once Mahnoor/Abdullah's
backend is live — no component code needs to change.

**Day 5** — Responsive pass (mobile bottom nav, single-column layouts
below `md`), consistent transitions on interactive elements, page
entrance animation, `prefers-reduced-motion` respected throughout.

## Palette (src/index.css @theme block)
| Token | Hex |
|---|---|
| bg | #F5F6F8 |
| surface | #FFFFFF |
| surface-alt | #EAECF0 |
| ink | #22262E |
| ink-soft | #6B7280 |
| accent | #3D5A80 |
| accent-dark | #2E4762 |
| accent-soft | #E4E9F2 |
| border | #DCDFE5 |

Fonts: Sora (display) + Inter (body).

## Connecting the real backend
Set `VITE_API_URL` in a `.env` file (defaults to `http://localhost:5000/api`),
then in `src/lib/api.js` uncomment the real `fetch()` line in each function
and delete the mock line above it.
