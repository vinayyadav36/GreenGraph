import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/enrollments — list user's enrolled courses
router.get('/', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM enrollments WHERE user_id = ? ORDER BY enrolled_at DESC').all(req.user.id);
  res.json(rows.map(r => ({ id: r.id, courseId: r.course_id, email: r.email, enrolledAt: r.enrolled_at })));
});

// GET /api/enrollments/check/:courseId
router.get('/check/:courseId', authMiddleware, (req, res) => {
  const row = db.prepare('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?').get(req.user.id, req.params.courseId);
  res.json({ enrolled: !!row });
});

// POST /api/enrollments — enroll in a course
router.post('/', authMiddleware, (req, res) => {
  const { courseId, email } = req.body;
  if (!courseId || !email) return res.status(400).json({ error: 'courseId and email are required' });
  const existing = db.prepare('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?').get(req.user.id, courseId);
  if (existing) return res.status(409).json({ error: 'Already enrolled' });
  const id = uuidv4();
  db.prepare('INSERT INTO enrollments (id, user_id, course_id, email) VALUES (?, ?, ?, ?)').run(id, req.user.id, courseId, email);
  res.status(201).json({ id, courseId, email, enrolledAt: new Date().toISOString() });
});

// DELETE /api/enrollments/:courseId
router.delete('/:courseId', authMiddleware, (req, res) => {
  const result = db.prepare('DELETE FROM enrollments WHERE user_id = ? AND course_id = ?').run(req.user.id, req.params.courseId);
  if (result.changes === 0) return res.status(404).json({ error: 'Enrollment not found' });
  res.json({ message: 'Unenrolled successfully' });
});

export default router;
