const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'orma_dev_secret_change_in_prod';
const JWT_EXPIRES = '7d';

function signToken(userId) {
  return jwt.sign({ id: String(userId) }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

// ── DB helpers: try Mongoose, fallback to lowdb ───────────────────────────────
let User = null;
try { User = require('../models/User'); } catch {}

const { db, uuidv4 } = require('../db/store');

async function findUserByEmail(email) {
  if (User) {
    try { return await User.findOne({ email }); } catch {}
  }
  return db.get('users').find({ email }).value() || null;
}

async function findUserById(id) {
  if (User) {
    try { return await User.findById(id).select('-password'); } catch {}
  }
  const u = db.get('users').find({ id: String(id) }).value();
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

async function createUser(name, email, password) {
  const hash = await bcrypt.hash(password, 10); // 10 rounds is fine for dev
  if (User) {
    try { return await User.create({ name, email, password }); } catch {}
  }
  const user = { id: uuidv4(), name, email, password: hash, createdAt: new Date().toISOString() };
  db.get('users').push(user).write();
  return user;
}

async function checkPassword(user, plain) {
  if (user.comparePassword) return user.comparePassword(plain);
  return bcrypt.compare(plain, user.password);
}

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  console.log('[auth] signup request received', req.body?.email);
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields are required.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const existing = await findUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'Email already in use.' });

    const user = await createUser(name, email, password);
    const id = user._id || user.id;
    const token = signToken(id);
    res.status(201).json({ token, user: { id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('[auth/signup]', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required.' });

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const ok = await checkPassword(user, password);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password.' });

    const id = user._id || user.id;
    const token = signToken(id);
    res.json({ token, user: { id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('[auth/login]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer '))
      return res.status(401).json({ error: 'No token.' });

    const payload = jwt.verify(auth.slice(7), JWT_SECRET);
    const user = await findUserById(payload.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const id = user._id || user.id;
    res.json({ id, name: user.name, email: user.email, createdAt: user.createdAt });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
});

module.exports = router;
