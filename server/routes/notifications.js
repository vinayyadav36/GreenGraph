import { Router } from 'express';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications — get user notifications (latest 50)
router.get('/', authMiddleware, (req, res) => {
  const rows = db.prepare(`
    SELECT n.*, e.name AS exam_name
    FROM notifications n
    LEFT JOIN exams e ON e.id = n.exam_id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC
    LIMIT 50
  `).all(req.user.id);

  const notifications = rows.map((r) => ({
    id: r.id,
    examId: r.exam_id,
    examName: r.exam_name || null,
    title: r.title,
    message: r.message,
    type: r.type,
    read: r.read === 1,
    createdAt: r.created_at,
  }));
  res.json(notifications);
});

// GET /api/notifications/unread-count
router.get('/unread-count', authMiddleware, (req, res) => {
  const row = db.prepare(
    'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND read = 0'
  ).get(req.user.id);
  res.json({ count: row.count });
});

// PUT /api/notifications/:id/read — mark as read
router.put('/:id/read', authMiddleware, (req, res) => {
  db.prepare(
    'UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?'
  ).run(req.params.id, req.user.id);
  res.json({ message: 'Marked as read' });
});

// PUT /api/notifications/read-all — mark all as read
router.put('/read-all', authMiddleware, (req, res) => {
  db.prepare(
    'UPDATE notifications SET read = 1 WHERE user_id = ?'
  ).run(req.user.id);
  res.json({ message: 'All marked as read' });
});

// DELETE /api/notifications/:id — delete a notification
router.delete('/:id', authMiddleware, (req, res) => {
  db.prepare(
    'DELETE FROM notifications WHERE id = ? AND user_id = ?'
  ).run(req.params.id, req.user.id);
  res.json({ message: 'Deleted' });
});

export default router;
