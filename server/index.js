/**
 * GreenGraph / Forever University — Backend API Server
 * Express + SQLite, fully independent platform.
 */
import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import db from './db.js';
import authRoutes from './routes/auth.js';
import subscriptionRoutes from './routes/subscriptions.js';
import notificationRoutes from './routes/notifications.js';
import resultRoutes from './routes/results.js';
import exportRoutes from './routes/export.js';

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());

// ─── Seed exam data ───────────────────────────────────────────────────────────
const EXAMS = [
  { id: 'upsc-cse', name: 'UPSC CSE', fullName: 'Union Public Service Commission Civil Services Examination', category: 'Central Government', icon: '🏛️', color: 'from-blue-500 to-indigo-600', description: 'The premier civil services examination in India conducted by UPSC for IAS, IPS, IFS and other Group A and B services.', vacancies: '1,105', examDate: 'Jun 2025', difficulty: 'hard', questionCount: 100, sessionId: 'session-upsc-1', topics: ['History','Geography','Polity','Economy','Science','Environment'] },
  { id: 'ssc-cgl', name: 'SSC CGL', fullName: 'Staff Selection Commission Combined Graduate Level Examination', category: 'Central Government', icon: '📋', color: 'from-green-500 to-emerald-600', description: 'SSC CGL exam for recruitment to various Group B and C posts in ministries, departments and organizations of India.', vacancies: '17,727', examDate: 'Sep 2025', difficulty: 'medium', questionCount: 100, sessionId: 'session-ssc-1', topics: ['Quantitative Aptitude','English','Reasoning','General Awareness'] },
  { id: 'ibps-po', name: 'IBPS PO', fullName: 'Institute of Banking Personnel Selection Probationary Officer Exam', category: 'Banking', icon: '🏦', color: 'from-yellow-500 to-orange-600', description: 'IBPS PO exam for recruitment of Probationary Officers in participating public sector banks across India.', vacancies: '4,455', examDate: 'Oct 2025', difficulty: 'medium', questionCount: 100, sessionId: 'session-ibps-po-1', topics: ['English','Reasoning','Quant','General Awareness','Computer Knowledge'] },
  { id: 'rrb-ntpc', name: 'RRB NTPC', fullName: 'Railway Recruitment Board Non-Technical Popular Categories', category: 'Railway', icon: '🚂', color: 'from-purple-500 to-violet-600', description: 'RRB NTPC exam for recruitment to various non-technical posts in Indian Railways including clerk, station master and more.', vacancies: '11,558', examDate: 'Jan 2026', difficulty: 'medium', questionCount: 100, sessionId: 'session-rrb-1', topics: ['Mathematics','General Intelligence','General Awareness'] },
  { id: 'neet-ug', name: 'NEET UG', fullName: 'National Eligibility cum Entrance Test (Undergraduate)', category: 'Medical', icon: '🏥', color: 'from-red-500 to-rose-600', description: 'NEET is the single entrance examination for admission to MBBS, BDS, BAMS and other medical courses across India.', vacancies: '1,09,145', examDate: 'May 2025', difficulty: 'hard', questionCount: 180, sessionId: 'session-neet-1', topics: ['Physics','Chemistry','Biology','Botany','Zoology'] },
  { id: 'jee-main', name: 'JEE Main', fullName: 'Joint Entrance Examination (Main)', category: 'Engineering', icon: '⚙️', color: 'from-cyan-500 to-blue-600', description: 'JEE Main is the gateway to NITs, IIITs, CFTIs and also a qualifier for JEE Advanced for IIT admissions.', vacancies: '31,000+', examDate: 'Apr 2025', difficulty: 'hard', questionCount: 90, sessionId: 'session-jee-1', topics: ['Mathematics','Physics','Chemistry'] },
  { id: 'cat', name: 'CAT', fullName: 'Common Admission Test', category: 'Management', icon: '📊', color: 'from-indigo-500 to-purple-600', description: 'CAT is the premier management entrance exam for admission to IIMs and other top business schools in India.', vacancies: '4,000+', examDate: 'Nov 2025', difficulty: 'hard', questionCount: 66, sessionId: 'session-cat-1', topics: ['VARC','DILR','Quantitative Ability'] },
  { id: 'cds', name: 'CDS', fullName: 'Combined Defence Services Examination', category: 'Defence', icon: '🎖️', color: 'from-gray-500 to-slate-600', description: 'CDS exam conducted by UPSC for recruitment to IMA, INA, AFA and OTA for joining the Indian Defence Services.', vacancies: '459', examDate: 'Sep 2025', difficulty: 'hard', questionCount: 120, sessionId: 'session-cds-1', topics: ['English','General Knowledge','Mathematics'] },
  { id: 'sbi-clerk', name: 'SBI Clerk', fullName: 'State Bank of India Junior Associates (Customer Support & Sales)', category: 'Banking', icon: '💳', color: 'from-blue-400 to-blue-600', description: 'SBI Clerk exam for recruitment as Junior Associates in the largest public sector bank in India.', vacancies: '13,735', examDate: 'Feb 2026', difficulty: 'medium', questionCount: 100, sessionId: 'session-sbi-clerk-1', topics: ['English','Numerical Ability','Reasoning','General Awareness','Computer Knowledge'] },
  { id: 'clat', name: 'CLAT', fullName: 'Common Law Admission Test', category: 'Law', icon: '⚖️', color: 'from-amber-500 to-yellow-600', description: 'CLAT is the centralized national level entrance test for admission to undergraduate and postgraduate law programs at NLUs.', vacancies: '2,700+', examDate: 'Dec 2025', difficulty: 'medium', questionCount: 120, sessionId: 'session-clat-1', topics: ['English','Current Affairs','Legal Reasoning','Logical Reasoning','Quantitative Techniques'] },
  { id: 'gate', name: 'GATE', fullName: 'Graduate Aptitude Test in Engineering', category: 'Engineering', icon: '🔬', color: 'from-teal-500 to-green-600', description: 'GATE tests understanding of undergraduate subjects in engineering and science for postgraduate admissions and PSU recruitment.', vacancies: 'Various PSUs', examDate: 'Feb 2026', difficulty: 'hard', questionCount: 65, sessionId: 'session-gate-1', topics: ['Engineering Mathematics','Subject Specific','General Aptitude'] },
  { id: 'upsc-capf', name: 'UPSC CAPF', fullName: 'Central Armed Police Forces Assistant Commandant Examination', category: 'Defence', icon: '🛡️', color: 'from-rose-500 to-pink-600', description: 'UPSC CAPF exam for recruitment of Assistant Commandants in BSF, CRPF, CISF, ITBP and SSB.', vacancies: '506', examDate: 'Aug 2025', difficulty: 'hard', questionCount: 250, sessionId: 'session-capf-1', topics: ['General Ability','General Studies','Essay','Comprehension','Precis Writing'] },
];

function seedExams() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM exams').get().c;
  if (count > 0) return;
  const insert = db.prepare(`
    INSERT OR IGNORE INTO exams (id, name, full_name, category, icon, color, description, vacancies, exam_date, difficulty, question_count, session_id, topics)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertMany = db.transaction((exams) => {
    for (const e of exams) {
      insert.run(e.id, e.name, e.fullName, e.category, e.icon, e.color, e.description, e.vacancies, e.examDate, e.difficulty, e.questionCount, e.sessionId, JSON.stringify(e.topics));
    }
  });
  insertMany(EXAMS);
  console.log(`✅ Seeded ${EXAMS.length} exams`);
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/export', exportRoutes);

// GET /api/exams — list all exams
app.get('/api/exams', (req, res) => {
  const rows = db.prepare('SELECT * FROM exams ORDER BY name ASC').all();
  const exams = rows.map((e) => ({
    id: e.id,
    name: e.name,
    fullName: e.full_name,
    category: e.category,
    icon: e.icon,
    color: e.color,
    description: e.description,
    vacancies: e.vacancies,
    examDate: e.exam_date,
    difficulty: e.difficulty,
    questionCount: e.question_count,
    sessionId: e.session_id,
    topics: JSON.parse(e.topics || '[]'),
  }));
  res.json(exams);
});

// GET /api/exams/:id
app.get('/api/exams/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM exams WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Exam not found' });
  res.json({
    id: row.id,
    name: row.name,
    fullName: row.full_name,
    category: row.category,
    icon: row.icon,
    color: row.color,
    description: row.description,
    vacancies: row.vacancies,
    examDate: row.exam_date,
    difficulty: row.difficulty,
    questionCount: row.question_count,
    sessionId: row.session_id,
    topics: JSON.parse(row.topics || '[]'),
  });
});

// GET /api/health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), platform: 'GreenGraph Forever University' });
});

// ─── Admin: broadcast notification to all subscribers of an exam ────────────
app.post('/api/admin/notify-subscribers', async (req, res) => {
  const { examId, title, message, type } = req.body;
  if (!examId || !title || !message) {
    return res.status(400).json({ error: 'examId, title, and message are required' });
  }
  const subscribers = db.prepare('SELECT user_id FROM subscriptions WHERE exam_id = ?').all(examId);
  if (subscribers.length === 0) return res.json({ sent: 0 });

  const insert = db.prepare(`
    INSERT INTO notifications (id, user_id, exam_id, title, message, type)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertAll = db.transaction(() => {
    for (const { user_id } of subscribers) {
      insert.run(uuidv4(), user_id, examId, title, message, type || 'info');
    }
  });
  insertAll();
  res.json({ sent: subscribers.length });
});

// ─── Start server ─────────────────────────────────────────────────────────────
seedExams();
app.listen(PORT, () => {
  console.log(`🚀 GreenGraph API server running on http://localhost:${PORT}`);
  console.log(`📊 Database: SQLite at ./data/greengraph.db`);
});
