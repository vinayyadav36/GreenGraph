import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { signToken, authMiddleware } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'email, password, and displayName are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hashed = await bcrypt.hash(password, 12);
  const id = uuidv4();
  const role = email.toLowerCase().includes('admin') ? 'admin' : 'student';

  db.prepare(`
    INSERT INTO users (id, email, password, display_name, role)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, email.toLowerCase(), hashed, displayName, role);

  const token = signToken({ id, email: email.toLowerCase(), role });
  const user = { id, email: email.toLowerCase(), role, profile: { displayName, preferredLanguage: 'en' }, createdAt: new Date().toISOString() };

  res.status(201).json({ token, user });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!row) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const valid = await bcrypt.compare(password, row.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken({ id: row.id, email: row.email, role: row.role });
  const user = {
    id: row.id,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    profile: {
      displayName: row.display_name,
      avatarUrl: row.avatar_url || undefined,
      preferredLanguage: row.language,
    },
  };

  res.json({ token, user });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!row) return res.status(404).json({ error: 'User not found' });
  res.json({
    id: row.id,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    profile: {
      displayName: row.display_name,
      avatarUrl: row.avatar_url || undefined,
      preferredLanguage: row.language,
    },
  });
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, (req, res) => {
  const { displayName, language } = req.body;
  const updates = [];
  const params = [];
  if (displayName) { updates.push('display_name = ?'); params.push(displayName); }
  if (language) { updates.push('language = ?'); params.push(language); }
  if (updates.length === 0) return res.status(400).json({ error: 'Nothing to update' });
  params.push(req.user.id);
  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json({
    id: row.id,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    profile: {
      displayName: row.display_name,
      avatarUrl: row.avatar_url || undefined,
      preferredLanguage: row.language,
    },
  });
});

export default router;
