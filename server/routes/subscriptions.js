import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/subscriptions — list the current user's subscriptions
router.get('/', authMiddleware, (req, res) => {
  const rows = db.prepare(`
    SELECT s.id, s.exam_id, s.created_at,
           e.name, e.full_name, e.category, e.icon, e.color,
           e.description, e.vacancies, e.exam_date, e.difficulty,
           e.question_count, e.session_id, e.topics
    FROM subscriptions s
    JOIN exams e ON e.id = s.exam_id
    WHERE s.user_id = ?
    ORDER BY s.created_at DESC
  `).all(req.user.id);

  const subs = rows.map((r) => ({
    id: r.id,
    examId: r.exam_id,
    createdAt: r.created_at,
    exam: {
      id: r.exam_id,
      name: r.name,
      fullName: r.full_name,
      category: r.category,
      icon: r.icon,
      color: r.color,
      description: r.description,
      vacancies: r.vacancies,
      examDate: r.exam_date,
      difficulty: r.difficulty,
      questionCount: r.question_count,
      sessionId: r.session_id,
      topics: JSON.parse(r.topics || '[]'),
    },
  }));
  res.json(subs);
});

// POST /api/subscriptions — subscribe to an exam
router.post('/', authMiddleware, (req, res) => {
  const { examId } = req.body;
  if (!examId) return res.status(400).json({ error: 'examId is required' });

  const exam = db.prepare('SELECT * FROM exams WHERE id = ?').get(examId);
  if (!exam) return res.status(404).json({ error: 'Exam not found' });

  const existing = db.prepare(
    'SELECT id FROM subscriptions WHERE user_id = ? AND exam_id = ?'
  ).get(req.user.id, examId);
  if (existing) return res.status(409).json({ error: 'Already subscribed' });

  const id = uuidv4();
  db.prepare(
    'INSERT INTO subscriptions (id, user_id, exam_id) VALUES (?, ?, ?)'
  ).run(id, req.user.id, examId);

  // Create a welcome notification
  const notifId = uuidv4();
  db.prepare(`
    INSERT INTO notifications (id, user_id, exam_id, title, message, type)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    notifId,
    req.user.id,
    examId,
    `Subscribed to ${exam.name}`,
    `You are now subscribed to ${exam.full_name}. You will receive updates about exam dates, vacancies, and study materials.`,
    'success'
  );

  res.status(201).json({ id, examId, createdAt: new Date().toISOString() });
});

// DELETE /api/subscriptions/:examId — unsubscribe from an exam
router.delete('/:examId', authMiddleware, (req, res) => {
  const result = db.prepare(
    'DELETE FROM subscriptions WHERE user_id = ? AND exam_id = ?'
  ).run(req.user.id, req.params.examId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Subscription not found' });
  }
  res.json({ message: 'Unsubscribed successfully' });
});

// GET /api/subscriptions/check/:examId — check if user is subscribed
router.get('/check/:examId', authMiddleware, (req, res) => {
  const sub = db.prepare(
    'SELECT id FROM subscriptions WHERE user_id = ? AND exam_id = ?'
  ).get(req.user.id, req.params.examId);
  res.json({ subscribed: !!sub });
});

export default router;
