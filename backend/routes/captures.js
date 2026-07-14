const express = require('express');
const axios = require('axios');
const requireAuth = require('../middleware/auth');
const { db, uuidv4 } = require('../db/store');

const router = express.Router();
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama3-8b-8192';

// Read key dynamically so adding it to .env takes effect without restart
function getGroqKey() {
  return process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here'
    ? process.env.GROQ_API_KEY
    : null;
}

// ── Try Mongoose Capture model, fall back to lowdb ────────────────────────────
let CaptureModel = null;
try { CaptureModel = require('../models/Capture'); } catch {}

// ── Groq helper ────────────────────────────────────────────────────────────────
async function groq(systemPrompt, userMessage, maxTokens = 400) {
  const key = getGroqKey();
  if (!key) return null;
  try {
    const res = await axios.post(
      GROQ_URL,
      { model: MODEL, max_tokens: maxTokens, messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ]},
      { headers: { Authorization: `Bearer ${key}` }, timeout: 15000 }
    );
    return res.data.choices[0].message.content.trim();
  } catch (err) {
    console.error('[Groq]', err.response?.data?.error?.message || err.message);
    return null;
  }
}

// ── DB helpers ─────────────────────────────────────────────────────────────────
function getCaptures(userId) {
  return db.get('captures').filter({ userId: String(userId) }).value();
}

function saveCapture(data) {
  const capture = {
    _id: uuidv4(),
    id: undefined, // set after
    ...data,
    capturedAt: new Date().toISOString(),
  };
  capture.id = capture._id;
  db.get('captures').push(capture).write();
  return capture;
}

function deleteCapture(id, userId) {
  db.get('captures').remove({ _id: id, userId: String(userId) }).write();
}

// ── POST /api/captures ─────────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  try {
    const { url, title, domain, pageText, screenshot } = req.body;
    if (!url) return res.status(400).json({ error: 'url is required' });

    if (url.startsWith('chrome') || url.startsWith('about:') || url.startsWith('chrome-extension:'))
      return res.status(204).end();

    // Deduplicate: same URL within last 60 seconds
    const cutoff = new Date(Date.now() - 60_000).toISOString();
    const existing = getCaptures(req.userId).find(
      c => c.url === url && c.capturedAt > cutoff
    );
    if (existing) return res.status(204).end();

    // AI summary + category
    let summary = '';
    let category = 'General';
    if (pageText && getGroqKey()) {
      const aiReply = await groq(
        'You are a concise assistant. Given a web page title and text, output valid JSON only: {"summary":"...","category":"..."}. Category must be one of: Article, Video, Social, Shopping, Research, News, Entertainment, Dev/Tech, Other.',
        `Title: ${title}\nText: ${pageText.slice(0, 1500)}`
      );
      if (aiReply) {
        try {
          const parsed = JSON.parse(aiReply);
          summary = parsed.summary || '';
          category = parsed.category || 'General';
        } catch {
          summary = aiReply;
        }
      }
    }

    const capture = saveCapture({
      userId: String(req.userId),
      url,
      title: title || 'Untitled',
      domain: domain || '',
      pageText: (pageText || '').slice(0, 4000),
      screenshot: screenshot || '',
      summary,
      category,
    });

    res.status(201).json({ id: capture._id, summary, category });
  } catch (err) {
    console.error('[captures POST]', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/captures ──────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const skip = parseInt(req.query.skip) || 0;
    const { date, search } = req.query;

    let list = getCaptures(req.userId);

    // Date filter
    if (date) {
      const dayStart = date; // 'YYYY-MM-DD'
      const dayEnd = date + 'T23:59:59.999Z';
      list = list.filter(c => c.capturedAt >= dayStart && c.capturedAt <= dayEnd);
    }

    // Keyword search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        (c.title + ' ' + c.summary + ' ' + c.pageText).toLowerCase().includes(q)
      );
    }

    // Sort newest first
    list = list.sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
    const total = list.length;
    const captures = list.slice(skip, skip + limit).map(c => {
      // Don't send full pageText in list view
      const { pageText, ...rest } = c;
      return rest;
    });

    res.json({ captures, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/captures/stats/daily ─────────────────────────────────────────────
router.get('/stats/daily', requireAuth, async (req, res) => {
  try {
    const list = getCaptures(req.userId);
    const map = {};
    list.forEach(c => {
      const day = c.capturedAt.slice(0, 10);
      map[day] = (map[day] || 0) + 1;
    });
    const stats = Object.entries(map)
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => b._id.localeCompare(a._id))
      .slice(0, 90);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/captures/chat ────────────────────────────────────────────────────
router.post('/chat', requireAuth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const query = message.toLowerCase().trim();
    const now = new Date();
    let list = getCaptures(req.userId);

    // ── 1. Time-based filtering ──────────────────────────────────────────────
    let timeLabel = '';
    if (query.includes('yesterday')) {
      const y = new Date(now); y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().slice(0, 10);
      list = list.filter(c => c.capturedAt.startsWith(yStr));
      timeLabel = 'yesterday';
    } else if (query.includes('today')) {
      const todayStr = now.toISOString().slice(0, 10);
      list = list.filter(c => c.capturedAt.startsWith(todayStr));
      timeLabel = 'today';
    } else if (query.match(/(\d+)\s*days?\s*ago/)) {
      const d = parseInt(query.match(/(\d+)\s*days?\s*ago/)[1]);
      const past = new Date(now); past.setDate(past.getDate() - d);
      list = list.filter(c => c.capturedAt >= past.toISOString());
      timeLabel = `${d} days ago`;
    } else if (query.includes('this week') || query.includes('last week')) {
      const week = new Date(now); week.setDate(week.getDate() - 7);
      list = list.filter(c => c.capturedAt >= week.toISOString());
      timeLabel = 'this week';
    }

    // Sort newest first
    list = list.sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));

    if (list.length === 0) {
      return res.json({
        answer: timeLabel
          ? `I don't have any captures from ${timeLabel}. Make sure recording was on.`
          : "I don't have any captures yet. Make sure the extension is on and recording.",
        sources: [],
      });
    }

    // ── 2. Smart keyword scoring ─────────────────────────────────────────────
    // Extract meaningful words from the query (remove stop words, keep all lengths)
    const stopWords = new Set([
      'what','when','where','which','who','how','did','do','does','was','were',
      'have','has','the','a','an','and','or','but','in','on','at','to','for',
      'of','with','about','from','that','this','my','i','me','you','your',
      'tell','show','find','give','list','can','could','would','should',
      'something','anything','everything','some','any','all','just','like',
    ]);
    const keywords = query
      .split(/[\s,?.!]+/)
      .map(w => w.replace(/[^a-z0-9]/g, ''))
      .filter(w => w.length >= 2 && !stopWords.has(w));

    console.log('[chat] query keywords:', keywords);

    // Score each capture against keywords
    const scored = list.map(c => {
      const haystack = [
        c.title || '',
        c.summary || '',
        c.pageText || '',
        c.domain || '',
        c.category || '',
        c.url || '',
      ].join(' ').toLowerCase();

      let score = 0;
      let exactMatches = 0;
      keywords.forEach(kw => {
        if (haystack.includes(kw)) {
          score += 1;
          // Boost title/domain matches (more specific)
          if ((c.title || '').toLowerCase().includes(kw)) score += 3;
          if ((c.domain || '').toLowerCase().includes(kw)) score += 2;
          if ((c.summary || '').toLowerCase().includes(kw)) score += 1;
          exactMatches++;
        }
      });
      return { ...c, score, exactMatches };
    });

    scored.sort((a, b) => b.score - a.score);

    // Top relevant sources — only include if they have some match
    // If nothing matches keywords, fall back to most recent
    const hasMatches = scored.some(c => c.score > 0);
    const topCaptures = hasMatches
      ? scored.filter(c => c.score > 0).slice(0, 6)
      : scored.slice(0, 5);

    const sources = topCaptures.slice(0, 5).map(c => ({
      id: c._id,
      title: c.title,
      url: c.url,
      domain: c.domain,
      screenshot: c.screenshot,
      capturedAt: c.capturedAt,
      summary: c.summary,
      category: c.category,
    }));

    // ── 3. AI answer (if Groq key is set) ────────────────────────────────────
    const activeKey = process.env.GROQ_API_KEY;
    if (activeKey && activeKey !== 'your_groq_api_key_here') {
      // Use top scored captures as context for AI
      const contextCaptures = topCaptures.slice(0, 15);
      const context = contextCaptures.map((c, i) => {
        const d = new Date(c.capturedAt).toLocaleString();
        return [
          `[${i + 1}] Title: "${c.title}"`,
          `URL: ${c.url}`,
          `Time: ${d}`,
          `Category: ${c.category || 'General'}`,
          `Summary: ${c.summary || '(no summary)'}`,
          `Snippet: ${(c.pageText || '').slice(0, 400)}`,
        ].join('\n');
      }).join('\n\n---\n\n');

      const aiAnswer = await groq(
        `You are Orma, a personal AI memory assistant. The user has a browsing history with page captures.
Your job: answer the user's SPECIFIC question using ONLY the provided capture context.
- Be direct and specific — mention exact page titles, websites, and times
- If asked about a specific topic (e.g. "bazar project", "api key"), focus ONLY on captures relevant to that
- If asked "what did I do when creating X project", describe what pages they visited related to X
- Group related captures together in your answer
- If no captures match the question, say so clearly
- Do NOT list unrelated captures
- Format: conversational prose, not bullet lists`,
        `User question: "${message}"\n\nRelevant captures (ranked by relevance):\n\n${context}`,
        700
      );

      if (aiAnswer) {
        return res.json({ answer: aiAnswer, sources });
      }
    }

    // ── 4. Smart fallback (no AI key) ─────────────────────────────────────────
    return res.json({
      answer: buildSmartAnswer(query, keywords, topCaptures, hasMatches, timeLabel),
      sources,
    });

  } catch (err) {
    console.error('[captures/chat]', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Smart answer builder (no AI key needed) ────────────────────────────────────
function buildSmartAnswer(query, keywords, captures, hasMatches, timeLabel) {
  if (captures.length === 0) return "No captures found.";

  const when = timeLabel ? ` from ${timeLabel}` : '';

  // Detect question intent
  const isWhatVisited = /what.*(visit|open|go|browse|look)/i.test(query);
  const isWhatRead = /what.*(read|article|blog|post)/i.test(query);
  const isWhatWatch = /what.*(watch|video|youtube)/i.test(query);
  const isSpecificTopic = keywords.length > 0 && hasMatches;
  const isWhenQuestion = /when.*(visit|open|go|look|check)/i.test(query);

  if (!hasMatches) {
    // Generic time-based summary
    const lines = captures.slice(0, 6).map(c => {
      const t = new Date(c.capturedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      const day = new Date(c.capturedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return `• "${c.title}" on ${c.domain} — ${day} at ${t}`;
    });
    return `Here's what you browsed${when}:\n\n${lines.join('\n')}`;
  }

  // Group by domain/topic
  const groups = {};
  captures.forEach(c => {
    const key = c.domain || 'other';
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  });

  if (isWhenQuestion && captures.length > 0) {
    const c = captures[0];
    const t = new Date(c.capturedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    return `You visited "${c.title}" on ${c.domain} at ${t}.${captures.length > 1 ? ` There were ${captures.length - 1} other related captures.` : ''}`;
  }

  // Topic-specific answer
  const topicSummary = captures.slice(0, 5).map(c => {
    const t = new Date(c.capturedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const summary = c.summary ? ` — ${c.summary.slice(0, 100)}` : '';
    return `• "${c.title}" (${c.domain}) at ${t}${summary}`;
  }).join('\n');

  const topicName = keywords.slice(0, 3).join(' ');
  return `Based on your captures${when} related to "${topicName}":\n\n${topicSummary}${
    captures.length > 5 ? `\n\n…and ${captures.length - 5} more related captures.` : ''
  }\n\n💡 Add a Groq API key in backend/.env for detailed AI analysis.`;
}


// ── GET /api/captures/:id ──────────────────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const capture = db.get('captures')
      .find({ _id: req.params.id, userId: String(req.userId) })
      .value();
    if (!capture) return res.status(404).json({ error: 'Not found.' });
    res.json(capture);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/captures/:id ───────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    deleteCapture(req.params.id, req.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
