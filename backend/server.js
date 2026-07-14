require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => cb(null, true), // allow all origins in dev
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/captures', require('./routes/captures'));
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ── Optional MongoDB ─────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/orma';
try {
  const mongoose = require('mongoose');
  mongoose.connect(MONGO_URI)
    .then(() => console.log('[Orma] MongoDB connected'))
    .catch(() => console.log('[Orma] MongoDB unavailable — using file store (db/data.json)'));
} catch {
  console.log('[Orma] Mongoose not loaded — using file store (db/data.json)');
}

// ── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[Orma] Server running on http://localhost:${PORT}`));
