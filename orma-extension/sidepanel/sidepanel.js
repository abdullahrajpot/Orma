const DEFAULT_API = 'http://localhost:5000/api';
let API = DEFAULT_API;
const messagesEl = document.getElementById('messages');

// ── Helpers ─────────────────────────────────────────────────────────────────
function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return ''; }
}

function addBubble(role, html, sources = []) {
  const div = document.createElement('div');
  div.className = `bubble ${role}`;

  const content = document.createElement('div');
  content.innerHTML = html;
  div.appendChild(content);

  if (sources.length > 0) {
    const srcContainer = document.createElement('div');
    srcContainer.className = 'sources';
    sources.forEach((s, i) => {
      const card = document.createElement('div');
      card.className = 'source-card';
      const time = s.capturedAt ? formatTime(s.capturedAt) : '';
      card.innerHTML = `
        <div class="source-card-inner">
          ${s.screenshot
            ? `<img src="${s.screenshot}" alt="${s.title}" loading="lazy" class="source-img">`
            : `<div class="source-img-placeholder">${s.domain || 'No preview'}</div>`
          }
          <div class="source-card-body">
            <span class="source-num">[${i + 1}] ${s.category || 'General'}</span>
            <div class="source-title">${s.title || 'Untitled'}</div>
            <div class="source-meta">${s.domain || ''}${time ? ' · ' + time : ''}</div>
            ${s.summary ? `<div class="source-summary">${s.summary.slice(0, 150)}</div>` : ''}
          </div>
        </div>
      `;
      card.addEventListener('click', () => {
        if (s.url) chrome.tabs.create({ url: s.url });
      });
      srcContainer.appendChild(card);
    });
    div.appendChild(srcContainer);
  }

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

// ── Token ────────────────────────────────────────────────────────────────────
async function getToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['orma_token'], (d) => resolve(d.orma_token ?? null));
  });
}

// ── Status bar ───────────────────────────────────────────────────────────────
async function refreshStatus() {
  chrome.storage.local.get(['orma_api_base'], (data) => {
    API = data.orma_api_base || DEFAULT_API;
  });
  try {
    chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (status) => {
      const dot = document.getElementById('rec-dot');
      const line = document.getElementById('status-line');
      if (chrome.runtime.lastError) {
        dot.className = 'rec-dot off';
        line.textContent = 'Not recording';
        return;
      }
      if (status?.recording) {
        dot.className = 'rec-dot on';
        line.textContent = `Recording · ${status.captureCount || 0} captures`;
      } else {
        dot.className = 'rec-dot off';
        line.textContent = 'Not recording';
      }
    });
  } catch (e) {
    const dot = document.getElementById('rec-dot');
    const line = document.getElementById('status-line');
    if (dot && line) {
      dot.className = 'rec-dot off';
      line.textContent = 'Not recording';
    }
  }
}
refreshStatus();
setInterval(refreshStatus, 5000);

// ── Example chips ─────────────────────────────────────────────────────────────
document.querySelectorAll('.ex-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.getElementById('input').value = chip.dataset.q;
    document.getElementById('form').dispatchEvent(new Event('submit'));
  });
});

// ── Chat form ────────────────────────────────────────────────────────────────
document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('input');
  const text = input.value.trim();
  if (!text) return;

  addBubble('user', text);
  input.value = '';

  const thinking = addBubble('thinking', 'Searching your memory…');

  const token = await getToken();
  if (!token) {
    thinking.remove();
    addBubble('assistant', 'You need to log in via the Orma popup first.');
    return;
  }

  try {
    const res = await fetch(`${API}/captures/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json().catch(() => ({}));
    thinking.remove();
    if (!res.ok) {
      addBubble('assistant', `The Orma backend returned an error (${res.status}). Check that the API endpoint is reachable and that your token is valid.`);
      return;
    }
    addBubble('assistant', data.answer || 'No answer found.', data.sources || []);
  } catch (err) {
    thinking.remove();
    addBubble('assistant', `Could not reach the Orma backend at ${API}. Make sure the backend is running and the API base URL is correct.`);
  }
});
