const express = require('express');
const axios = require('axios');
const requireAuth = require('../middleware/auth');
const { db, uuidv4 } = require('../db/store');

const router = express.Router();
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Text model — fast, for summaries and chat
const TEXT_MODEL = 'llama-3.3-70b-versatile';
// Vision model — reads screenshots
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

// ── Key helper ────────────────────────────────────────────────────────────────
function getGroqKey(requestKey) {
  const candidate = requestKey || process.env.GROQ_API_KEY;
  return candidate && !candidate.startsWith('your_') ? candidate : null;
}

// ── Text-only Groq call ───────────────────────────────────────────────────────
async function groqText(system, user, maxTokens = 500, requestKey = null) {
  const key = getGroqKey(requestKey);
  if (!key) { console.error('[Groq/text] No API key'); return null; }
  try {
    const res = await axios.post(
      GROQ_URL,
      {
        model: TEXT_MODEL,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      },
      { headers: { Authorization: `Bearer ${key}` }, timeout: 20000 }
    );
    return res.data.choices[0].message.content.trim();
  } catch (err) {
    const errMsg = err.response?.data?.error?.message || err.message;
    console.error('[Groq/text] ERROR:', errMsg);
    console.error('[Groq/text] Status:', err.response?.status);
    return null;
  }
}

// ── Vision Groq call — reads a screenshot ────────────────────────────────────
// Returns a plain-English description of what's visible on screen
async function groqVision(screenshotBase64, pageTitle, pageUrl, requestKey = null) {
  const key = getGroqKey(requestKey);
  if (!key || !screenshotBase64) return null;

  // Must be a valid base64 data URL
  if (!screenshotBase64.startsWith('data:image')) return null;

  try {
    const res = await axios.post(
      GROQ_URL,
      {
        model: VISION_MODEL,
        max_tokens: 400,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `This is a screenshot of a browser tab.
Page title: "${pageTitle}"
URL: ${pageUrl}

Describe exactly what is visible on screen in 3-5 sentences. Be specific:
- What type of page is this? (dashboard, article, form, video, etc.)
- What specific content, data, or UI elements are visible? (e.g. list of items, a table with X rows, a form, a video player, code, etc.)
- Any counts, names, or key values visible (e.g. "5 API keys listed", "a MongoDB cluster named Cluster0", "YouTube video titled X")
- What was the user likely doing here?
Only describe what you can actually see. Be factual and concise.`,
              },
              {
                type: 'image_url',
                image_url: { url: screenshotBase64 },
              },
            ],
          },
        ],
      },
      { headers: { Authorization: `Bearer ${key}` }, timeout: 30000 }
    );
    return res.data.choices[0].message.content.trim();
  } catch (err) {
    console.error('[Groq/vision]', err.response?.data?.error?.message || err.message);
    return null;
  }
}

// ── DB helpers ────────────────────────────────────────────────────────────────
function getCaptures(userId) {
  return db.get('captures').filter({ userId: String(userId) }).value();
}

function saveCapture(data) {
  const capture = { _id: uuidv4(), ...data, capturedAt: new Date().toISOString() };
  capture.id = capture._id;
  db.get('captures').push(capture).write();
  return capture;
}

function updateCapture(id, updates) {
  db.get('captures').find({ _id: id }).assign(updates).write();
}

function deleteCapture(id, userId) {
  db.get('captures').remove({ _id: id, userId: String(userId) }).write();
}

// ── POST /api/captures ────────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  try {
    const { url, title, domain, pageText, screenshot } = req.body;
    const requestKey = req.headers['x-groq-api-key'] || null;
    if (!url) return res.status(400).json({ error: 'url is required' });

    if (
      url.startsWith('chrome://') || url.startsWith('chrome-extension://') ||
      url.startsWith('about:') || url.startsWith('edge://')
    ) return res.status(204).end();

    // Deduplicate: same URL within last 60s
    const cutoff = new Date(Date.now() - 60_000).toISOString();
    const dup = getCaptures(req.userId).find(c => c.url === url && c.capturedAt > cutoff);
    if (dup) return res.status(204).end();

    // Save immediately so the extension gets a fast response
    const capture = saveCapture({
      userId: String(req.userId),
      url,
      title: title || 'Untitled',
      domain: domain || '',
      pageText: (pageText || '').slice(0, 4000),
      screenshot: screenshot || '',
      summary: '',
      visualDescription: '',
      category: 'General',
    });

    res.status(201).json({ id: capture._id });

    // ── Background AI analysis (after responding) ─────────────────────────
    setImmediate(async () => {
      const key = getGroqKey(requestKey);
      if (!key) return;

      let summary = '';
      let category = 'General';
      let visualDescription = '';

      // 1. Vision — read the screenshot
      if (screenshot) {
        console.log(`[Vision] Analyzing screenshot for: ${title}`);
        visualDescription = await groqVision(screenshot, title, url, requestKey) || '';
        if (visualDescription) console.log(`[Vision] Done: ${visualDescription.slice(0, 80)}…`);
      }

      // 2. Text summary + category
      const textForSummary = [
        title,
        visualDescription,
        (pageText || '').slice(0, 1000),
      ].filter(Boolean).join('\n');

      if (textForSummary) {
        const aiReply = await groqText(
          'You are a concise assistant. Given a web page title, visual description, and text, output ONLY valid JSON: {"summary":"one or two sentence summary of what this page is about and what was happening","category":"..."}. Category must be one of: Article, Video, Social, Shopping, Research, News, Entertainment, Dev/Tech, Other. Output JSON only, no explanation.',
          textForSummary,
          500,
          requestKey
        );
        if (aiReply) {
          try {
            const p = JSON.parse(aiReply);
            summary = p.summary || '';
            category = p.category || 'General';
          } catch {
            // If JSON parse fails, use the raw text as summary
            summary = aiReply.slice(0, 200);
          }
        }
      }

      updateCapture(capture._id, { summary, category, visualDescription });
      console.log(`[AI] Capture enriched: "${title}" → ${category}`);
    });

  } catch (err) {
    console.error('[captures POST]', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/captures ─────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const skip = parseInt(req.query.skip) || 0;
    const { date, search } = req.query;

    let list = getCaptures(req.userId);

    if (date) {
      list = list.filter(c =>
        c.capturedAt >= date && c.capturedAt <= date + 'T23:59:59.999Z'
      );
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        [c.title, c.summary, c.pageText, c.visualDescription].join(' ').toLowerCase().includes(q)
      );
    }

    list = list.sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
    const total = list.length;
    const captures = list.slice(skip, skip + limit).map(({ pageText, ...rest }) => rest);
    res.json({ captures, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/captures/stats/daily ────────────────────────────────────────────
router.get('/stats/daily', requireAuth, async (req, res) => {
  try {
    const map = {};
    getCaptures(req.userId).forEach(c => {
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

// ── POST /api/captures/reanalyze ─────────────────────────────────────────────
router.post('/reanalyze', requireAuth, async (req, res) => {
  const key = getGroqKey();
  if (!key) {
    return res.status(400).json({
      error: 'No Groq API key configured. Add GROQ_API_KEY to backend/.env and restart the server.',
    });
  }

  const all = getCaptures(req.userId);
  const needsVision = all.filter(c => c.screenshot && !c.visualDescription);
  res.json({ queued: needsVision.length });

  // Process in background
  setImmediate(async () => {
    for (const c of needsVision.slice(0, 50)) { // max 50 at a time
      const vd = await groqVision(c.screenshot, c.title, c.url, req.headers['x-groq-api-key'] || null);
      if (vd) {
        updateCapture(c._id, { visualDescription: vd });
        console.log(`[Reanalyze] ${c.title}: ${vd.slice(0, 60)}…`);
      }
      await new Promise(r => setTimeout(r, 500)); // rate limit
    }
    console.log('[Reanalyze] Done');
  });
});

// ── POST /api/captures/chat ───────────────────────────────────────────────────
router.post('/chat', requireAuth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const query = message.toLowerCase().trim();
    const now = new Date();
    let list = getCaptures(req.userId);

    // ── Time filter ───────────────────────────────────────────────────────────
    let timeLabel = '';
    if (query.includes('yesterday')) {
      const y = new Date(now); y.setDate(y.getDate() - 1);
      list = list.filter(c => c.capturedAt.startsWith(y.toISOString().slice(0, 10)));
      timeLabel = 'yesterday';
    } else if (query.includes('today')) {
      list = list.filter(c => c.capturedAt.startsWith(now.toISOString().slice(0, 10)));
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

    list = list.sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));

    if (list.length === 0) {
      return res.json({
        answer: timeLabel
          ? `I don't have any captures from ${timeLabel}. Was recording on during that time?`
          : "No captures yet. Turn on recording in the extension and browse some pages.",
        sources: [],
      });
    }

    // ── Keyword scoring (title, domain, summary, visual description, page text) ─
    const stopWords = new Set([
      'what','when','where','which','who','how','did','do','does','was','were',
      'have','has','the','a','an','and','or','but','in','on','at','to','for',
      'of','with','about','from','that','this','my','i','me','you','your',
      'tell','show','find','give','list','can','could','would','should',
      'something','anything','everything','some','any','all','just','like',
      'many','much','more','most','very','really','quite','also','too',
    ]);
    const keywords = query
      .split(/[\s,?.!]+/)
      .map(w => w.replace(/[^a-z0-9]/g, ''))
      .filter(w => w.length >= 2 && !stopWords.has(w));

    console.log('[chat] keywords:', keywords, '| time:', timeLabel || 'all time');

    const scored = list.map(c => {
      let score = 0;
      const title = (c.title || '').toLowerCase();
      const domain = (c.domain || '').toLowerCase();
      const summary = (c.summary || '').toLowerCase();
      const visual = (c.visualDescription || '').toLowerCase();
      const text = (c.pageText || '').toLowerCase();
      const url = (c.url || '').toLowerCase();

      keywords.forEach(kw => {
        if (title.includes(kw))   score += 5;
        if (domain.includes(kw))  score += 4;
        if (url.includes(kw))     score += 3;
        if (summary.includes(kw)) score += 3;
        if (visual.includes(kw))  score += 2;
        if (text.includes(kw))    score += 1;
      });
      return { ...c, score };
    }).sort((a, b) => b.score - a.score);

    const hasMatches = scored.some(c => c.score > 0);
    const topCaptures = (hasMatches ? scored.filter(c => c.score > 0) : scored).slice(0, 8);

    const sources = topCaptures.slice(0, 6).map(c => ({
      id: c._id,
      title: c.title,
      url: c.url,
      domain: c.domain,
      screenshot: c.screenshot || '',
      capturedAt: c.capturedAt,
      summary: c.summary || '',
      visualDescription: c.visualDescription || '',
      category: c.category || 'General',
    }));

    // ── AI answer ─────────────────────────────────────────────────────────────
    const key = getGroqKey(req.headers['x-groq-api-key'] || null);
    console.log('[chat] Groq key present:', !!key, '| topCaptures:', topCaptures.length);

    if (key) {
      // Build the richest possible context — text + visual descriptions
      const context = topCaptures.slice(0, 10).map((c, i) => {
        const time = new Date(c.capturedAt).toLocaleString(undefined, {
          weekday: 'short', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
        });
        const parts = [
          `=== Source [${i + 1}] ===`,
          `Title: ${c.title}`,
          `Website: ${c.domain}`,
          `URL: ${c.url}`,
          `Captured: ${time}`,
          `Category: ${c.category || 'General'}`,
        ];
        if (c.visualDescription) {
          parts.push(`What was visible on screen: ${c.visualDescription}`);
        }
        if (c.summary) {
          parts.push(`Page summary: ${c.summary}`);
        }
        if (c.pageText) {
          parts.push(`Page text excerpt: ${c.pageText.slice(0, 600)}`);
        }
        return parts.join('\n');
      }).join('\n\n');

      console.log('[chat] Context length:', context.length, 'chars | Calling Groq...');

      const systemPrompt = `You are Orma, a personal AI memory assistant. The user is asking about their own browsing history. You have been given their captured page data including visual descriptions of screenshots.

STRICT RULES:
1. Answer the EXACT question asked — do not give a generic overview
2. If asked "what API keys are created" — list the actual key names/details visible in the captures
3. If asked "how many" — count and state the exact number
4. If asked about a specific site/project — only describe captures from that site/project
5. Use specific details: page titles, times, what was visible on screen, counts, names
6. Write in plain conversational English — 2-3 paragraphs max
7. If a visual description says "3 API keys listed named X, Y, Z" — use that exact info
8. NEVER say "I don't have enough information" if you have relevant captures — use what you have
9. Be direct: start your answer with the actual answer, not a preamble`;

      const userPrompt = `User's question: "${message}"
${timeLabel ? `They are asking about: ${timeLabel}` : ''}
Number of relevant captures: ${topCaptures.length}

Here is the browsing data (sorted by relevance):

${context}

Now answer the question "${message}" using the specific details from the captures above.`;

      const aiAnswer = await groqText(systemPrompt, userPrompt, 700, req.headers['x-groq-api-key'] || null);
      console.log('[chat] Groq answer:', aiAnswer ? aiAnswer.slice(0, 100) + '...' : 'NULL — falling back');

      if (aiAnswer) return res.json({ answer: aiAnswer, sources });
    }

    // ── No-key fallback ───────────────────────────────────────────────────────
    return res.json({
      answer: buildFallback(query, keywords, topCaptures, hasMatches, timeLabel),
      sources,
    });

  } catch (err) {
    console.error('[chat]', err);
    res.status(500).json({ error: err.message });
  }
});

function buildFallback(query, keywords, captures, hasMatches, timeLabel) {
  if (!captures.length) return 'No captures found.';
  const when = timeLabel ? ` from ${timeLabel}` : '';
  const top = captures.slice(0, 3);
  const isHowMany = /how many|count|number/i.test(query);

  if (isHowMany && hasMatches) {
    const title = top[0]?.title || 'a capture';
    return `I found ${captures.length} capture${captures.length !== 1 ? 's' : ''}${when} that match your question. The most relevant one is "${title}"${when}. See the attached sources for details.`;
  }

  const summaryLines = top.map(c => {
    const t = new Date(c.capturedAt).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    const detail = c.summary || c.visualDescription || c.pageText || '';
    const details = detail ? ` ${detail.slice(0, 120).trim()}` : '';
    return `• ${c.title || 'Untitled'} (${c.domain}) at ${t}.${details}`;
  });

  return `I found ${captures.length} capture${captures.length !== 1 ? 's' : ''}${when}. The top matches are:\n\n${summaryLines.join('\n')}\n\nOpen the screenshot sources to see the exact pages and details.`;
}

// ── GET /api/captures/:id ─────────────────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const c = db.get('captures').find({ _id: req.params.id, userId: String(req.userId) }).value();
    if (!c) return res.status(404).json({ error: 'Not found.' });
    res.json(c);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/captures/:id ──────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    deleteCapture(req.params.id, req.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
