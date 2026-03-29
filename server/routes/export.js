import { Router } from 'express';
import ExcelJS from 'exceljs';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// GET /api/export/users — export all user data to Excel
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.email, u.display_name, u.role, u.language, u.created_at,
           COUNT(DISTINCT s.exam_id) AS subscriptions,
           COUNT(DISTINCT r.id) AS results,
           COALESCE(MAX(r.score), 0) AS best_score
    FROM users u
    LEFT JOIN subscriptions s ON s.user_id = u.id
    LEFT JOIN exam_results r ON r.user_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `).all();

  const wb = new ExcelJS.Workbook();
  wb.creator = 'GreenGraph Platform';
  wb.created = new Date();

  const ws = wb.addWorksheet('Users');
  ws.columns = [
    { header: 'ID', key: 'id', width: 36 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Display Name', key: 'display_name', width: 20 },
    { header: 'Role', key: 'role', width: 12 },
    { header: 'Language', key: 'language', width: 10 },
    { header: 'Subscriptions', key: 'subscriptions', width: 15 },
    { header: 'Results', key: 'results', width: 10 },
    { header: 'Best Score (%)', key: 'best_score', width: 15 },
    { header: 'Joined', key: 'created_at', width: 20 },
  ];

  // Style header row
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  users.forEach((u) => ws.addRow(u));

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="greengraph_users_${Date.now()}.xlsx"`);
  await wb.xlsx.write(res);
  res.end();
});

// GET /api/export/results — export all exam results to Excel
router.get('/results', authMiddleware, adminOnly, async (req, res) => {
  const results = db.prepare(`
    SELECT r.id, u.email, u.display_name, r.exam_id, e.name AS exam_name,
           r.score, r.accuracy, r.time_taken_sec, r.created_at
    FROM exam_results r
    JOIN users u ON u.id = r.user_id
    LEFT JOIN exams e ON e.id = r.exam_id
    ORDER BY r.created_at DESC
  `).all();

  const wb = new ExcelJS.Workbook();
  wb.creator = 'GreenGraph Platform';
  wb.created = new Date();

  const ws = wb.addWorksheet('Exam Results');
  ws.columns = [
    { header: 'Result ID', key: 'id', width: 36 },
    { header: 'User Email', key: 'email', width: 30 },
    { header: 'User Name', key: 'display_name', width: 20 },
    { header: 'Exam', key: 'exam_name', width: 25 },
    { header: 'Score (%)', key: 'score', width: 12 },
    { header: 'Accuracy (%)', key: 'accuracy', width: 14 },
    { header: 'Time (sec)', key: 'time_taken_sec', width: 12 },
    { header: 'Date', key: 'created_at', width: 20 },
  ];

  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } };
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  results.forEach((r) => ws.addRow({ ...r, accuracy: Math.round(r.accuracy * 100) }));

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="greengraph_results_${Date.now()}.xlsx"`);
  await wb.xlsx.write(res);
  res.end();
});

// GET /api/export/subscriptions — export subscriptions to Excel
router.get('/subscriptions', authMiddleware, adminOnly, async (req, res) => {
  const subs = db.prepare(`
    SELECT s.id, u.email, u.display_name, e.name AS exam_name,
           e.category, s.created_at
    FROM subscriptions s
    JOIN users u ON u.id = s.user_id
    JOIN exams e ON e.id = s.exam_id
    ORDER BY s.created_at DESC
  `).all();

  const wb = new ExcelJS.Workbook();
  wb.creator = 'GreenGraph Platform';
  wb.created = new Date();

  const ws = wb.addWorksheet('Subscriptions');
  ws.columns = [
    { header: 'ID', key: 'id', width: 36 },
    { header: 'User Email', key: 'email', width: 30 },
    { header: 'User Name', key: 'display_name', width: 20 },
    { header: 'Exam', key: 'exam_name', width: 25 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Subscribed At', key: 'created_at', width: 20 },
  ];

  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  subs.forEach((s) => ws.addRow(s));

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="greengraph_subscriptions_${Date.now()}.xlsx"`);
  await wb.xlsx.write(res);
  res.end();
});

export default router;
