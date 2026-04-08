import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/progress — get all course progress for user
router.get('/', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM course_progress WHERE user_id = ?').all(req.user.id);
  res.json(rows.map(r => ({
    id: r.id, courseId: r.course_id, stageId: r.stage_id,
    completed: !!r.completed, score: r.score, completedAt: r.completed_at,
  })));
});

// POST /api/progress — save stage completion
router.post('/', authMiddleware, (req, res) => {
  const { courseId, stageId, score } = req.body;
  if (!courseId || !stageId) return res.status(400).json({ error: 'courseId and stageId are required' });
  const existing = db.prepare('SELECT id FROM course_progress WHERE user_id = ? AND course_id = ? AND stage_id = ?').get(req.user.id, courseId, stageId);
  if (existing) {
    db.prepare('UPDATE course_progress SET completed = 1, score = ?, completed_at = datetime("now") WHERE id = ?').run(score ?? null, existing.id);
    return res.json({ id: existing.id, courseId, stageId, completed: true });
  }
  const id = uuidv4();
  db.prepare('INSERT INTO course_progress (id, user_id, course_id, stage_id, completed, score, completed_at) VALUES (?, ?, ?, ?, 1, ?, datetime("now"))').run(id, req.user.id, courseId, stageId, score ?? null);
  res.status(201).json({ id, courseId, stageId, completed: true });
});

export default router;
