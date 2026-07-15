require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: (origin, cb) => cb(null, true), credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/captures', require('./routes/captures'));

app.get('/api/health', (req, res) => {
  const k = process.env.GROQ_API_KEY;
  const mongoState = mongoose.connection.readyState; // 0=disconnected,1=connected
  res.json({
    status: 'ok',
    time: new Date(),
    store: mongoState === 1 ? 'mongodb' : 'lowdb',
    mongoConnected: mongoState === 1,
    groqConfigured: !!(k && !k.startsWith('your_')),
  });
});

// ── MongoDB ───────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/orma';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('[Orma] ✓ MongoDB connected — using MongoDB as data store');
  })
  .catch((err) => {
    console.log('[Orma] MongoDB unavailable — using file store (db/data.json)');
    console.log('[Orma] Reason:', err.message);
  });

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[Orma] Server running on http://localhost:${PORT}`));
