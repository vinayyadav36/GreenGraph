import { Router } from 'express';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') return res.status(403).json({ error: 'Forbidden' });
  next();
}

// GET /api/admin/stats
router.get('/stats', authMiddleware, adminOnly, (req, res) => {
  const users = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  const enrollments = db.prepare('SELECT COUNT(*) AS c FROM enrollments').get().c;
  const results = db.prepare('SELECT COUNT(*) AS c FROM exam_results').get().c;
  const questions = db.prepare('SELECT COUNT(*) AS c FROM questions').get().c;
  res.json({ users, enrollments, results, questions });
});

// GET /api/admin/users
router.get('/users', authMiddleware, adminOnly, (req, res) => {
  const rows = db.prepare('SELECT id, email, display_name, role, created_at FROM users ORDER BY created_at DESC').all();
  res.json(rows.map(r => ({ id: r.id, email: r.email, displayName: r.display_name, role: r.role, createdAt: r.created_at })));
});

export default router;
