import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// POST /api/results — save exam result
router.post('/', authMiddleware, (req, res) => {
  const { examId, score, accuracy, timeTakenSeconds, topicBreakdown } = req.body;
  if (!examId || score === undefined) {
    return res.status(400).json({ error: 'examId and score are required' });
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO exam_results (id, user_id, exam_id, score, accuracy, time_taken_sec, topic_breakdown)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    req.user.id,
    examId,
    score,
    accuracy || 0,
    timeTakenSeconds || 0,
    JSON.stringify(topicBreakdown || {})
  );

  // Create a notification for the result
  const notifId = uuidv4();
  const grade = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Keep Practising';
  const exam = db.prepare('SELECT name FROM exams WHERE id = ?').get(examId);
  const examName = exam ? exam.name : examId;

  db.prepare(`
    INSERT INTO notifications (id, user_id, exam_id, title, message, type)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    notifId,
    req.user.id,
    examId,
    `Result: ${examName} — ${grade}`,
    `You scored ${Math.round(score)}% on your ${examName} practice. ${grade === 'Excellent' ? '🌟 Outstanding performance!' : grade === 'Good' ? '📚 Keep up the good work!' : '💪 Consistent practice makes perfect!'}`,
    score >= 80 ? 'success' : score >= 60 ? 'info' : 'warning'
  );

  const result = {
    id,
    userId: req.user.id,
    examId,
    score,
    accuracy: accuracy || 0,
    timeTakenSeconds: timeTakenSeconds || 0,
    topicBreakdown: topicBreakdown || {},
    createdAt: new Date().toISOString(),
  };
  res.status(201).json(result);
});

// GET /api/results — get user's results
router.get('/', authMiddleware, (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM exam_results
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 20
  `).all(req.user.id);

  const results = rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    examId: r.exam_id,
    score: r.score,
    accuracy: r.accuracy,
    timeTakenSeconds: r.time_taken_sec,
    topicBreakdown: JSON.parse(r.topic_breakdown || '{}'),
    createdAt: r.created_at,
  }));
  res.json(results);
});

// GET /api/results/:id
router.get('/:id', authMiddleware, (req, res) => {
  const row = db.prepare(
    'SELECT * FROM exam_results WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.user.id);

  if (!row) return res.status(404).json({ error: 'Result not found' });

  res.json({
    id: row.id,
    userId: row.user_id,
    examId: row.exam_id,
    score: row.score,
    accuracy: row.accuracy,
    timeTakenSeconds: row.time_taken_sec,
    topicBreakdown: JSON.parse(row.topic_breakdown || '{}'),
    createdAt: row.created_at,
  });
});

export default router;
