import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/questions/:examId — get questions for an exam
router.get('/:examId', (req, res) => {
  const rows = db.prepare('SELECT * FROM questions WHERE exam_id = ? ORDER BY created_at ASC').all(req.params.examId);
  const questions = rows.map(r => ({
    id: r.id, examId: r.exam_id, text: r.text,
    options: JSON.parse(r.options || '[]'), correct: r.correct,
    type: r.type, difficulty: r.difficulty,
    tags: JSON.parse(r.tags || '[]'), explanation: r.explanation, trick: r.trick,
  }));
  res.json(questions);
});

// POST /api/questions — add question (admin only)
router.post('/', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') return res.status(403).json({ error: 'Forbidden' });
  const { examId, text, options, correct, type, difficulty, tags, explanation, trick } = req.body;
  if (!examId || !text || !options || !correct) return res.status(400).json({ error: 'examId, text, options, correct are required' });
  const id = uuidv4();
  db.prepare(`INSERT INTO questions (id, exam_id, text, options, correct, type, difficulty, tags, explanation, trick) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, examId, text, JSON.stringify(options), correct, type || 'single', difficulty || 'medium', JSON.stringify(tags || []), explanation || '', trick || null);
  res.status(201).json({ id, examId, text, options, correct, type, difficulty });
});

// DELETE /api/questions/:id — delete question (admin only)
router.delete('/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') return res.status(403).json({ error: 'Forbidden' });
  const result = db.prepare('DELETE FROM questions WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Question not found' });
  res.json({ message: 'Deleted' });
});

export default router;
