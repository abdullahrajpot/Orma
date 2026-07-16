const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'orma_dev_secret_change_in_prod';
const JWT_EXPIRES = '7d';

function signToken(userId) {
  return jwt.sign({ id: String(userId) }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

// ── Single source of truth: detect which store is available at request time ──
// If MongoDB is connected, use it. Otherwise use lowdb.
// When Mongo is available, still fall back to lowdb if a user exists there.

function getStore() {
  return mongoose.connection.readyState === 1 ? 'mongo' : 'lowdb';
}

// Mongo helpers
let UserModel = null;
function getMongoUser() {
  if (!UserModel) UserModel = require('../models/User');
  return UserModel;
}

// Lowdb helpers (kept only as a last-resort fallback)
const { db, uuidv4 } = require('../db/store');

function findLowdbUserByEmail(email) {
  return db.get('users').find({ email: email.toLowerCase() }).value() || null;
}

function findLowdbUserById(id) {
  const u = db.get('users').find({ id: String(id) }).value();
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

// ── Unified user operations ───────────────────────────────────────────────────

async function findUserByEmail(email) {
  const normalized = email.toLowerCase();
  if (getStore() === 'mongo') {
    const mongoUser = await getMongoUser().findOne({ email: normalized });
    if (mongoUser) return mongoUser;
  }
  return findLowdbUserByEmail(normalized);
}

async function findUserById(id) {
  if (getStore() === 'mongo') {
    try {
      const u = await getMongoUser().findById(id).select('-password');
      if (u) return u.toObject();
    } catch {
      // ignore and fallback to lowdb
    }
  }
  return findLowdbUserById(id);
}

async function createUser(name, email, password) {
  const normalized = email.toLowerCase();

  if (getStore() === 'mongo') {
    try {
      return await getMongoUser().create({ name, email: normalized, password });
    } catch (err) {
      if (err.code === 11000) throw new Error('Email already in use.');
      throw err;
    }
  }

  const existingLowdb = findLowdbUserByEmail(normalized);
  if (existingLowdb) {
    throw new Error('Email already in use.');
  }

  const hash = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    name,
    email: normalized,
    password: hash,
    createdAt: new Date().toISOString(),
  };
  db.get('users').push(user).write();
  return user;
}

async function checkPassword(user, plain) {
  // Mongoose document has comparePassword method; lowdb object doesn't
  if (typeof user.comparePassword === 'function') {
    return user.comparePassword(plain);
  }
  return bcrypt.compare(plain, user.password);
}

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const store = getStore();
  console.log(`[auth/signup] store=${store} email=${req.body?.email}`);
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields are required.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const existing = await findUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'Email already in use.' });

    const user = await createUser(name, email, password);
    const id = String(user._id || user.id);
    const token = signToken(id);
    console.log(`[auth/signup] created user ${id} in ${store}`);
    res.status(201).json({ token, user: { id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('[auth/signup]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const store = getStore();
  console.log(`[auth/login] store=${store} email=${req.body?.email}`);
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required.' });

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const ok = await checkPassword(user, password);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password.' });

    const id = String(user._id || user.id);
    const token = signToken(id);
    console.log(`[auth/login] success user ${id} from ${store}`);
    res.json({ token, user: { id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('[auth/login]', err.message);
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

    const id = String(user._id || user.id);
    res.json({ id, name: user.name, email: user.email, createdAt: user.createdAt });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
});

module.exports = router;
