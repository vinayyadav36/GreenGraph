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
import enrollmentRoutes from './routes/enrollments.js';
import progressRoutes from './routes/progress.js';
import questionRoutes from './routes/questions.js';
import adminRoutes from './routes/admin.js';

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
  { id: 'upsc', name: 'UPSC CSE', fullName: 'Union Public Service Commission Civil Services Examination', category: 'Central Government', icon: '🏛️', color: 'from-blue-500 to-indigo-600', description: 'The premier civil services examination in India conducted by UPSC for IAS, IPS, IFS and other Group A and B services.', vacancies: '1,105', examDate: 'Jun 2025', difficulty: 'hard', questionCount: 100, sessionId: 'upsc-session', topics: ['History','Geography','Polity','Economy','Science','Environment'] },
  { id: 'ssc-cgl', name: 'SSC CGL', fullName: 'Staff Selection Commission Combined Graduate Level Examination', category: 'Central Government', icon: '📋', color: 'from-green-500 to-emerald-600', description: 'SSC CGL exam for recruitment to various Group B and C posts in ministries, departments and organizations of India.', vacancies: '17,727', examDate: 'Sep 2025', difficulty: 'medium', questionCount: 100, sessionId: 'ssc-session', topics: ['Quantitative Aptitude','English','Reasoning','General Awareness'] },
  { id: 'ibps-po', name: 'IBPS PO', fullName: 'Institute of Banking Personnel Selection Probationary Officer Exam', category: 'Banking', icon: '🏦', color: 'from-yellow-500 to-orange-600', description: 'IBPS PO exam for recruitment of Probationary Officers in participating public sector banks across India.', vacancies: '4,455', examDate: 'Oct 2025', difficulty: 'medium', questionCount: 100, sessionId: 'banking-session', topics: ['English','Reasoning','Quant','General Awareness','Computer Knowledge'] },
  { id: 'rrb-ntpc', name: 'RRB NTPC', fullName: 'Railway Recruitment Board Non-Technical Popular Categories', category: 'Railway', icon: '🚂', color: 'from-purple-500 to-violet-600', description: 'RRB NTPC exam for recruitment to various non-technical posts in Indian Railways including clerk, station master and more.', vacancies: '11,558', examDate: 'Jan 2026', difficulty: 'medium', questionCount: 100, sessionId: 'railway-session', topics: ['Mathematics','General Intelligence','General Awareness'] },
  { id: 'neet', name: 'NEET UG', fullName: 'National Eligibility cum Entrance Test (Undergraduate)', category: 'Medical', icon: '🏥', color: 'from-red-500 to-rose-600', description: 'NEET is the single entrance examination for admission to MBBS, BDS, BAMS and other medical courses across India.', vacancies: '1,09,145', examDate: 'May 2025', difficulty: 'hard', questionCount: 180, sessionId: 'neet-session', topics: ['Physics','Chemistry','Biology','Botany','Zoology'] },
  { id: 'jee-main', name: 'JEE Main', fullName: 'Joint Entrance Examination (Main)', category: 'Engineering', icon: '⚙️', color: 'from-cyan-500 to-blue-600', description: 'JEE Main is the gateway to NITs, IIITs, CFTIs and also a qualifier for JEE Advanced for IIT admissions.', vacancies: '31,000+', examDate: 'Apr 2025', difficulty: 'hard', questionCount: 90, sessionId: 'jee-session', topics: ['Mathematics','Physics','Chemistry'] },
  { id: 'cat', name: 'CAT', fullName: 'Common Admission Test', category: 'Management', icon: '📊', color: 'from-indigo-500 to-purple-600', description: 'CAT is the premier management entrance exam for admission to IIMs and other top business schools in India.', vacancies: '4,000+', examDate: 'Nov 2025', difficulty: 'hard', questionCount: 66, sessionId: 'ca-session', topics: ['VARC','DILR','Quantitative Ability'] },
  { id: 'nda', name: 'NDA', fullName: 'National Defence Academy Examination', category: 'Defence', icon: '🎖️', color: 'from-gray-500 to-slate-600', description: 'NDA exam conducted by UPSC for recruitment to IMA, INA, AFA and OTA for joining the Indian Defence Services.', vacancies: '400+', examDate: 'Sep 2025', difficulty: 'medium', questionCount: 120, sessionId: 'session-demo-1', topics: ['Mathematics','General Ability','Physics','Chemistry','History','English'] },
  { id: 'clat', name: 'CLAT', fullName: 'Common Law Admission Test', category: 'Law', icon: '⚖️', color: 'from-amber-500 to-yellow-600', description: 'CLAT is the centralized national level entrance test for admission to undergraduate and postgraduate law programs at NLUs.', vacancies: '2,700+', examDate: 'Dec 2025', difficulty: 'medium', questionCount: 120, sessionId: 'ca-session', topics: ['English','Current Affairs','Legal Reasoning','Logical Reasoning','Quantitative Techniques'] },
  { id: 'gate', name: 'GATE', fullName: 'Graduate Aptitude Test in Engineering', category: 'Engineering', icon: '🔬', color: 'from-teal-500 to-green-600', description: 'GATE tests understanding of undergraduate subjects in engineering and science for postgraduate admissions and PSU recruitment.', vacancies: 'Various PSUs', examDate: 'Feb 2026', difficulty: 'hard', questionCount: 65, sessionId: 'session-demo-1', topics: ['Engineering Mathematics','Subject Specific','General Aptitude'] },
  { id: 'current-affairs', name: 'Current Affairs GK', fullName: 'Current Affairs & General Knowledge – All Exams', category: 'General', icon: '📰', color: 'from-cyan-500 to-blue-600', description: 'Stay updated with the latest current affairs, government schemes, sports, awards, and national/international events for all competitive exams.', vacancies: 'All Exams', examDate: 'Ongoing', difficulty: 'easy', questionCount: 50, sessionId: 'ca-session', topics: ['National Events','International Affairs','Government Schemes','Awards & Honours','Sports','Science & Technology'] },
  { id: 'sbi-clerk', name: 'SBI Clerk', fullName: 'State Bank of India Junior Associates (Customer Support & Sales)', category: 'Banking', icon: '💳', color: 'from-blue-400 to-blue-600', description: 'SBI Clerk exam for recruitment as Junior Associates in the largest public sector bank in India.', vacancies: '13,735', examDate: 'Feb 2026', difficulty: 'medium', questionCount: 100, sessionId: 'banking-session', topics: ['English','Numerical Ability','Reasoning','General Awareness','Computer Knowledge'] },
];

function seedExams() {
  const existing = db.prepare('SELECT COUNT(*) AS c FROM exams').get().c;
  // Check if we need to re-seed by verifying a key exam ID
  const hasUpsc = db.prepare("SELECT id FROM exams WHERE id = 'upsc'").get();
  if (existing > 0 && hasUpsc) return;

  // Clear existing data and re-seed with correct IDs
  db.prepare('DELETE FROM exams').run();
  const insert = db.prepare(`
    INSERT OR REPLACE INTO exams (id, name, full_name, category, icon, color, description, vacancies, exam_date, difficulty, question_count, session_id, topics)
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
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/admin', adminRoutes);

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

function seedQuestions() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM questions').get().c;
  if (count > 0) return;

  const insert = db.prepare(`INSERT OR IGNORE INTO questions (id, exam_id, text, options, correct, type, difficulty, tags, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  const questionsData = [
    // UPSC (10 questions)
    { id: 'q-upsc-1', examId: 'upsc', text: 'Who was the first Governor-General of independent India?', options: ['Lord Mountbatten', 'C. Rajagopalachari', 'Jawaharlal Nehru', 'Dr. Rajendra Prasad'], correct: 'Lord Mountbatten', difficulty: 'medium', tags: ['polity','history'], explanation: 'Lord Mountbatten became the first Governor-General of independent India on August 15, 1947.' },
    { id: 'q-upsc-2', examId: 'upsc', text: 'The Preamble of the Indian Constitution was amended by which Constitutional Amendment?', options: ['42nd Amendment', '44th Amendment', '52nd Amendment', '73rd Amendment'], correct: '42nd Amendment', difficulty: 'medium', tags: ['polity','constitution'], explanation: 'The 42nd Amendment Act (1976) added "Socialist", "Secular" and "Integrity" to the Preamble.' },
    { id: 'q-upsc-3', examId: 'upsc', text: 'Which article of the Indian Constitution deals with the Right to Constitutional Remedies?', options: ['Article 14', 'Article 19', 'Article 32', 'Article 21'], correct: 'Article 32', difficulty: 'medium', tags: ['polity','fundamental-rights'], explanation: 'Article 32 gives the right to move the Supreme Court for the enforcement of fundamental rights.' },
    { id: 'q-upsc-4', examId: 'upsc', text: 'The Indus Valley Civilization was discovered in which year?', options: ['1901', '1912', '1921', '1935'], correct: '1921', difficulty: 'easy', tags: ['history','ancient-india'], explanation: 'The Indus Valley Civilization was discovered in 1921 when Rai Bahadur Daya Ram Sahni excavated Harappa.' },
    { id: 'q-upsc-5', examId: 'upsc', text: 'Which of the following is NOT a Fundamental Right under the Indian Constitution?', options: ['Right to Equality', 'Right to Work', 'Right to Freedom of Religion', 'Right against Exploitation'], correct: 'Right to Work', difficulty: 'easy', tags: ['polity','fundamental-rights'], explanation: 'Right to Work is a Directive Principle of State Policy (Article 41), not a Fundamental Right.' },
    { id: 'q-upsc-6', examId: 'upsc', text: 'The Paris Agreement on Climate Change was adopted in which year?', options: ['2012', '2013', '2015', '2016'], correct: '2015', difficulty: 'medium', tags: ['environment','international'], explanation: 'The Paris Agreement was adopted on 12 December 2015 at the COP21 summit.' },
    { id: 'q-upsc-7', examId: 'upsc', text: 'Who wrote "Arthashastra"?', options: ['Chandragupta Maurya', 'Ashoka', 'Kautilya (Chanakya)', 'Megasthenes'], correct: 'Kautilya (Chanakya)', difficulty: 'easy', tags: ['history','ancient-india'], explanation: 'Arthashastra was written by Kautilya, advisor to Chandragupta Maurya.' },
    { id: 'q-upsc-8', examId: 'upsc', text: 'Which Schedule of the Indian Constitution deals with the allocation of powers between Union and States?', options: ['Fifth Schedule', 'Sixth Schedule', 'Seventh Schedule', 'Eighth Schedule'], correct: 'Seventh Schedule', difficulty: 'hard', tags: ['polity','constitution'], explanation: 'The Seventh Schedule contains Union List, State List, and Concurrent List.' },
    { id: 'q-upsc-9', examId: 'upsc', text: 'CRISPR-Cas9 is associated with which technology?', options: ['Space Technology', 'Gene Editing', 'Quantum Computing', 'Artificial Intelligence'], correct: 'Gene Editing', difficulty: 'medium', tags: ['science','biotechnology'], explanation: 'CRISPR-Cas9 is a revolutionary gene-editing technology.' },
    { id: 'q-upsc-10', examId: 'upsc', text: 'The Chipko Movement was primarily related to:', options: ['Water Conservation', 'Forest Conservation', 'Soil Conservation', 'Wildlife Protection'], correct: 'Forest Conservation', difficulty: 'easy', tags: ['environment','movements'], explanation: 'The Chipko Movement started in 1973 in Uttarakhand. Villagers hugged trees to prevent them from being felled.' },

    // SSC-CGL (10 questions)
    { id: 'q-ssc-1', examId: 'ssc-cgl', text: 'If ROAD is coded as URDG, how is SWAN coded?', options: ['VXDQ', 'VZDQ', 'VZCQ', 'WXDQ'], correct: 'VZDQ', difficulty: 'medium', tags: ['reasoning','coding-decoding'], explanation: 'Each letter is shifted by +3: S+3=V, W+3=Z, A+3=D, N+3=Q → VZDQ.' },
    { id: 'q-ssc-2', examId: 'ssc-cgl', text: 'A train 150m long passes a pole in 15 seconds. How long to pass a platform 300m long?', options: ['25 seconds', '30 seconds', '45 seconds', '35 seconds'], correct: '45 seconds', difficulty: 'medium', tags: ['quant','time-speed-distance'], explanation: 'Speed = 150/15 = 10 m/s. Distance = 450m. Time = 450/10 = 45 seconds.' },
    { id: 'q-ssc-3', examId: 'ssc-cgl', text: 'Which of the following is the largest planet in our solar system?', options: ['Saturn', 'Neptune', 'Jupiter', 'Uranus'], correct: 'Jupiter', difficulty: 'easy', tags: ['general-awareness','science'], explanation: 'Jupiter is the largest planet in our solar system.' },
    { id: 'q-ssc-4', examId: 'ssc-cgl', text: 'If the simple interest on Rs. 400 for 5 years is Rs. 80, what is the rate of interest?', options: ['2%', '4%', '5%', '8%'], correct: '4%', difficulty: 'medium', tags: ['quant','interest'], explanation: 'SI = PRT/100. R = 80×100/(400×5) = 4%.' },
    { id: 'q-ssc-5', examId: 'ssc-cgl', text: 'The chemical formula of Baking Soda is:', options: ['NaCl', 'Na2CO3', 'NaHCO3', 'CaCO3'], correct: 'NaHCO3', difficulty: 'easy', tags: ['science','chemistry'], explanation: 'Baking Soda is Sodium Bicarbonate, NaHCO3.' },
    { id: 'q-ssc-6', examId: 'ssc-cgl', text: 'A and B can do a work in 12 days, B and C in 15 days, A and C in 20 days. How many days for A, B, C together?', options: ['8 days', '10 days', '12 days', '15 days'], correct: '10 days', difficulty: 'hard', tags: ['quant','time-work'], explanation: '2(A+B+C) = 1/12+1/15+1/20 = 1/5. A+B+C = 1/10. Time = 10 days.' },
    { id: 'q-ssc-7', examId: 'ssc-cgl', text: 'Choose the correct meaning of the idiom: "To bite the bullet"', options: ['To eat hastily', 'To endure a painful experience', 'To be very hungry', 'To face danger'], correct: 'To endure a painful experience', difficulty: 'medium', tags: ['english','idioms'], explanation: '"To bite the bullet" means to endure a painful situation with courage.' },
    { id: 'q-ssc-8', examId: 'ssc-cgl', text: 'Which Mughal emperor built the Taj Mahal?', options: ['Akbar', 'Aurangzeb', 'Shah Jahan', 'Jahangir'], correct: 'Shah Jahan', difficulty: 'easy', tags: ['history','medieval-india'], explanation: 'The Taj Mahal was built by Shah Jahan in memory of his wife Mumtaz Mahal.' },
    { id: 'q-ssc-9', examId: 'ssc-cgl', text: 'The square root of 1764 is:', options: ['42', '44', '46', '48'], correct: '42', difficulty: 'easy', tags: ['quant','squares'], explanation: '42 × 42 = 1764.' },
    { id: 'q-ssc-10', examId: 'ssc-cgl', text: 'Which gas is primarily responsible for the greenhouse effect?', options: ['Nitrogen', 'Oxygen', 'Carbon Dioxide', 'Argon'], correct: 'Carbon Dioxide', difficulty: 'easy', tags: ['science','environment'], explanation: 'Carbon Dioxide (CO2) is the primary greenhouse gas.' },

    // IBPS-PO (10 questions)
    { id: 'q-ibps-1', examId: 'ibps-po', text: 'Which of the following is the apex bank of India?', options: ['State Bank of India', 'Reserve Bank of India', 'NABARD', 'SIDBI'], correct: 'Reserve Bank of India', difficulty: 'easy', tags: ['banking','general-awareness'], explanation: 'The Reserve Bank of India (RBI) is the central bank of India.' },
    { id: 'q-ibps-2', examId: 'ibps-po', text: 'The number of arrangements of the letters of "BANANA" is:', options: ['360', '60', '120', '180'], correct: '60', difficulty: 'hard', tags: ['quant','permutations'], explanation: 'BANANA: 6!/(3!×2!) = 720/12 = 60.' },
    { id: 'q-ibps-3', examId: 'ibps-po', text: 'KYC stands for:', options: ['Keep Your Cash', 'Know Your Customer', 'Keep Your Credentials', 'Know Your Credit'], correct: 'Know Your Customer', difficulty: 'easy', tags: ['banking','full-forms'], explanation: 'KYC (Know Your Customer) is a mandatory bank verification process.' },
    { id: 'q-ibps-4', examId: 'ibps-po', text: 'In a series: 4, 9, 25, 49, 121, 169, __ what is next?', options: ['196', '225', '256', '289'], correct: '289', difficulty: 'medium', tags: ['reasoning','number-series'], explanation: 'Squares of primes: 2²,3²,5²,7²,11²,13²,17²=289.' },
    { id: 'q-ibps-5', examId: 'ibps-po', text: 'What does NEFT stand for?', options: ['National Electronic Funds Transfer', 'Net Enabled Financial Transfer', 'National Efficient Fund Transmission', 'National Exchange of Financial Transfers'], correct: 'National Electronic Funds Transfer', difficulty: 'easy', tags: ['banking','payments'], explanation: 'NEFT is an electronic funds transfer system maintained by RBI.' },
    { id: 'q-ibps-6', examId: 'ibps-po', text: 'Find the odd one out: 3, 5, 7, 11, 13, 15', options: ['3', '7', '11', '15'], correct: '15', difficulty: 'easy', tags: ['reasoning','odd-one-out'], explanation: '15 is not a prime number (15 = 3×5).' },
    { id: 'q-ibps-7', examId: 'ibps-po', text: 'Which of the following is a Nationalized Bank?', options: ['HDFC Bank', 'ICICI Bank', 'Bank of Baroda', 'Axis Bank'], correct: 'Bank of Baroda', difficulty: 'easy', tags: ['banking','general-awareness'], explanation: 'Bank of Baroda is a nationalized (public sector) bank.' },
    { id: 'q-ibps-8', examId: 'ibps-po', text: 'The average of first 50 natural numbers is:', options: ['25', '25.5', '26', '27.5'], correct: '25.5', difficulty: 'easy', tags: ['quant','averages'], explanation: 'Sum = 50×51/2 = 1275. Average = 1275/50 = 25.5.' },
    { id: 'q-ibps-9', examId: 'ibps-po', text: 'Repo Rate is the rate at which:', options: ['RBI lends money to commercial banks', 'Banks lend to customers', 'Commercial banks lend to RBI', 'Government borrows from RBI'], correct: 'RBI lends money to commercial banks', difficulty: 'medium', tags: ['banking','monetary-policy'], explanation: 'Repo Rate is the rate at which RBI lends short-term money to commercial banks.' },
    { id: 'q-ibps-10', examId: 'ibps-po', text: 'Pointing to a photograph, a man says "She is the daughter of my grandmother\'s only son." What is the relation?', options: ['Sister', 'Cousin', 'Aunt', 'Mother'], correct: 'Sister', difficulty: 'medium', tags: ['reasoning','blood-relations'], explanation: 'My grandmother\'s only son = my father. Daughter of my father = my sister.' },

    // NDA (10 questions)
    { id: 'q-nda-1', examId: 'nda', text: 'A body thrown vertically upward with velocity u reaches maximum height:', options: ['u²/g', 'u²/2g', '2u²/g', 'u/2g'], correct: 'u²/2g', difficulty: 'medium', tags: ['physics','kinematics'], explanation: 'Using v²=u²-2gh with v=0: h=u²/2g.' },
    { id: 'q-nda-2', examId: 'nda', text: 'The Battle of Panipat (1526) was fought between:', options: ['Akbar and Hemu', 'Babur and Ibrahim Lodi', 'Humayun and Sher Shah Suri', 'Babar and Rana Sanga'], correct: 'Babur and Ibrahim Lodi', difficulty: 'easy', tags: ['history','medieval'], explanation: 'The First Battle of Panipat (1526) was between Babur and Ibrahim Lodi.' },
    { id: 'q-nda-3', examId: 'nda', text: 'If sin θ = 3/5, find cos θ (θ is acute):', options: ['4/5', '3/4', '5/4', '4/3'], correct: '4/5', difficulty: 'medium', tags: ['mathematics','trigonometry'], explanation: 'cos²θ = 1 - 9/25 = 16/25, cosθ = 4/5.' },
    { id: 'q-nda-4', examId: 'nda', text: 'The speed of light in vacuum is approximately:', options: ['3 × 10⁶ m/s', '3 × 10⁸ m/s', '3 × 10¹⁰ m/s', '3 × 10⁴ m/s'], correct: '3 × 10⁸ m/s', difficulty: 'easy', tags: ['physics','light'], explanation: 'Speed of light c ≈ 3 × 10⁸ m/s.' },
    { id: 'q-nda-5', examId: 'nda', text: 'National Defence Academy is located at:', options: ['Dehradun', 'Khadakwasla, Pune', 'Bangalore', 'Chennai'], correct: 'Khadakwasla, Pune', difficulty: 'easy', tags: ['general-knowledge','defence'], explanation: 'The NDA is located at Khadakwasla, near Pune, Maharashtra.' },
    { id: 'q-nda-6', examId: 'nda', text: 'The atomic number of Carbon is:', options: ['4', '6', '8', '12'], correct: '6', difficulty: 'easy', tags: ['chemistry','periodic-table'], explanation: 'Carbon has atomic number 6.' },
    { id: 'q-nda-7', examId: 'nda', text: 'If LCM of two numbers is 60 and HCF is 5, what is their product?', options: ['300', '65', '600', '12'], correct: '300', difficulty: 'medium', tags: ['mathematics','lcm-hcf'], explanation: 'Product = LCM × HCF = 60 × 5 = 300.' },
    { id: 'q-nda-8', examId: 'nda', text: 'Which is the highest rank in the Indian Army?', options: ['General', 'Lieutenant General', 'Field Marshal', 'Major General'], correct: 'Field Marshal', difficulty: 'easy', tags: ['general-knowledge','defence'], explanation: 'Field Marshal is the highest 5-star rank in the Indian Army.' },
    { id: 'q-nda-9', examId: 'nda', text: 'The ozone layer is found in the:', options: ['Troposphere', 'Stratosphere', 'Mesosphere', 'Thermosphere'], correct: 'Stratosphere', difficulty: 'easy', tags: ['science','atmosphere'], explanation: 'The ozone layer is in the stratosphere, 15-35 km above Earth.' },
    { id: 'q-nda-10', examId: 'nda', text: 'Find the next term: 1, 4, 9, 16, 25, __', options: ['30', '36', '49', '35'], correct: '36', difficulty: 'easy', tags: ['mathematics','series'], explanation: 'Perfect squares: 6² = 36.' },

    // JEE-MAIN (10 questions)
    { id: 'q-jee-1', examId: 'jee-main', text: 'The de Broglie wavelength λ of an electron moving with velocity v. If velocity is doubled, new wavelength is:', options: ['2λ', 'λ/2', 'λ/4', '4λ'], correct: 'λ/2', difficulty: 'medium', tags: ['physics','modern-physics'], explanation: 'λ = h/mv. If v → 2v, λ → λ/2.' },
    { id: 'q-jee-2', examId: 'jee-main', text: 'Which of the following has the highest electronegativity?', options: ['Oxygen', 'Chlorine', 'Fluorine', 'Nitrogen'], correct: 'Fluorine', difficulty: 'easy', tags: ['chemistry','periodic-table'], explanation: 'Fluorine has the highest electronegativity (3.98).' },
    { id: 'q-jee-3', examId: 'jee-main', text: 'The integral ∫(0 to π/2) sin x dx equals:', options: ['0', '1', '2', 'π/2'], correct: '1', difficulty: 'easy', tags: ['mathematics','calculus'], explanation: '[-cos x] from 0 to π/2 = 0 - (-1) = 1.' },
    { id: 'q-jee-4', examId: 'jee-main', text: 'A capacitor of capacitance C is charged to voltage V. The energy stored is:', options: ['CV', 'CV²', 'CV²/2', 'C²V'], correct: 'CV²/2', difficulty: 'medium', tags: ['physics','electrostatics'], explanation: 'Energy stored = ½CV².' },
    { id: 'q-jee-5', examId: 'jee-main', text: 'The IUPAC name of CH3-CH(OH)-CH3 is:', options: ['1-propanol', '2-propanol', 'propanol', 'iso-propanol'], correct: '2-propanol', difficulty: 'medium', tags: ['chemistry','organic'], explanation: 'OH on 2nd carbon of 3-carbon chain = 2-propanol.' },
    { id: 'q-jee-6', examId: 'jee-main', text: 'If the roots of ax² + bx + c = 0 are equal, then discriminant is:', options: ['b² - 4ac > 0', 'b² - 4ac < 0', 'b² - 4ac = 0', 'b² + 4ac = 0'], correct: 'b² - 4ac = 0', difficulty: 'easy', tags: ['mathematics','quadratic'], explanation: 'For equal roots, discriminant D = b² - 4ac = 0.' },
    { id: 'q-jee-7', examId: 'jee-main', text: 'In photoelectric effect, increasing the intensity of incident light:', options: ['Increases the maximum KE of photoelectrons', 'Increases the number of photoelectrons emitted', 'Increases the threshold frequency', 'Decreases the stopping potential'], correct: 'Increases the number of photoelectrons emitted', difficulty: 'medium', tags: ['physics','modern-physics'], explanation: 'Intensity increases number of photons, hence more photoelectrons.' },
    { id: 'q-jee-8', examId: 'jee-main', text: 'The hybridization of carbon in diamond is:', options: ['sp', 'sp²', 'sp³', 'sp³d'], correct: 'sp³', difficulty: 'easy', tags: ['chemistry','bonding'], explanation: 'In diamond, carbon is sp³ hybridized in tetrahedral arrangement.' },
    { id: 'q-jee-9', examId: 'jee-main', text: 'The derivative of ln(x) with respect to x is:', options: ['1/x', 'x', 'ln(x)/x', '1/(x ln x)'], correct: '1/x', difficulty: 'easy', tags: ['mathematics','differentiation'], explanation: 'd/dx[ln(x)] = 1/x.' },
    { id: 'q-jee-10', examId: 'jee-main', text: 'Newton\'s second law of motion states that Force equals:', options: ['mass × velocity', 'mass × acceleration', 'mass × displacement', 'momentum × time'], correct: 'mass × acceleration', difficulty: 'easy', tags: ['physics','mechanics'], explanation: 'F = ma.' },

    // NEET (10 questions)
    { id: 'q-neet-1', examId: 'neet', text: 'Which organelle is called the "powerhouse of the cell"?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi apparatus'], correct: 'Mitochondria', difficulty: 'easy', tags: ['biology','cell-biology'], explanation: 'Mitochondria produce ATP through cellular respiration.' },
    { id: 'q-neet-2', examId: 'neet', text: 'The number of chromosomes in a normal human somatic cell is:', options: ['23', '44', '46', '48'], correct: '46', difficulty: 'easy', tags: ['biology','genetics'], explanation: 'Normal human somatic cells have 46 chromosomes (23 pairs).' },
    { id: 'q-neet-3', examId: 'neet', text: 'The process by which plants prepare their food using sunlight is called:', options: ['Respiration', 'Photosynthesis', 'Transpiration', 'Fermentation'], correct: 'Photosynthesis', difficulty: 'easy', tags: ['biology','plant-biology'], explanation: '6CO2 + 6H2O + light → C6H12O6 + 6O2.' },
    { id: 'q-neet-4', examId: 'neet', text: 'Which blood group is called the "Universal Donor"?', options: ['A', 'B', 'AB', 'O'], correct: 'O', difficulty: 'easy', tags: ['biology','blood'], explanation: 'Blood group O negative can be given to any patient.' },
    { id: 'q-neet-5', examId: 'neet', text: 'DNA replication is:', options: ['Conservative', 'Semi-conservative', 'Dispersive', 'Non-conservative'], correct: 'Semi-conservative', difficulty: 'medium', tags: ['biology','molecular-biology'], explanation: 'Proven by Meselson-Stahl experiment (1958). Each new DNA has one original and one new strand.' },
    { id: 'q-neet-6', examId: 'neet', text: 'The pH of human blood is approximately:', options: ['6.8-7.0', '7.0-7.2', '7.35-7.45', '7.8-8.0'], correct: '7.35-7.45', difficulty: 'medium', tags: ['biology','physiology'], explanation: 'Normal blood pH is 7.35-7.45 (slightly alkaline).' },
    { id: 'q-neet-7', examId: 'neet', text: 'Meiosis results in the formation of:', options: ['2 diploid cells', '4 haploid cells', '2 haploid cells', '4 diploid cells'], correct: '4 haploid cells', difficulty: 'medium', tags: ['biology','cell-division'], explanation: 'Meiosis produces 4 genetically unique haploid cells.' },
    { id: 'q-neet-8', examId: 'neet', text: 'Which element is present in chlorophyll but NOT in hemoglobin?', options: ['Nitrogen', 'Carbon', 'Magnesium', 'Hydrogen'], correct: 'Magnesium', difficulty: 'medium', tags: ['biology','biochemistry'], explanation: 'Chlorophyll has Mg at center; Hemoglobin has Fe at center.' },
    { id: 'q-neet-9', examId: 'neet', text: 'The functional unit of kidney is:', options: ['Neuron', 'Nephron', 'Alveolus', 'Islet of Langerhans'], correct: 'Nephron', difficulty: 'easy', tags: ['biology','excretory-system'], explanation: 'Nephron is the structural and functional unit of the kidney.' },
    { id: 'q-neet-10', examId: 'neet', text: 'The hormone responsible for "fight or flight" response is:', options: ['Insulin', 'Glucagon', 'Adrenaline (Epinephrine)', 'Thyroxine'], correct: 'Adrenaline (Epinephrine)', difficulty: 'easy', tags: ['biology','endocrine-system'], explanation: 'Adrenaline is secreted by adrenal medulla in response to stress.' },

    // CAT (10 questions)
    { id: 'q-cat-1', examId: 'cat', text: 'If 12 men can do a piece of work in 20 days, in how many days can 15 men do it?', options: ['14 days', '16 days', '18 days', '15 days'], correct: '16 days', difficulty: 'medium', tags: ['quant','time-work'], explanation: '12×20 = 15×D. D = 16 days.' },
    { id: 'q-cat-2', examId: 'cat', text: 'A shopkeeper marks 25% above cost and gives 10% discount. Profit% is:', options: ['10.5%', '12.5%', '15%', '17.5%'], correct: '12.5%', difficulty: 'medium', tags: ['quant','profit-loss'], explanation: 'CP=100, MP=125, SP=112.5. Profit=12.5%.' },
    { id: 'q-cat-3', examId: 'cat', text: '"The scientist\'s hypothesis was _____ by the experimental results."', options: ['refuted', 'corroborated', 'elaborated', 'diminished'], correct: 'corroborated', difficulty: 'medium', tags: ['english','vocabulary'], explanation: '"Corroborated" means confirmed or supported by evidence.' },
    { id: 'q-cat-4', examId: 'cat', text: 'In how many ways can the letters of "MISSISSIPPI" be arranged?', options: ['34650', '40020', '25200', '69300'], correct: '34650', difficulty: 'hard', tags: ['quant','permutations'], explanation: '11!/(1!×4!×4!×2!) = 34650.' },
    { id: 'q-cat-5', examId: 'cat', text: 'Sum of infinite GP is 15 and sum of squares is 45. Find first term.', options: ['3', '5', '6', '10'], correct: '5', difficulty: 'hard', tags: ['quant','series'], explanation: 'a/(1-r)=15, a²/(1-r²)=45. Solving: a=5, r=2/3.' },
    { id: 'q-cat-6', examId: 'cat', text: 'Which is closest in meaning to "Laconic"?', options: ['Talkative', 'Brief and concise', 'Melancholic', 'Luminous'], correct: 'Brief and concise', difficulty: 'medium', tags: ['english','vocabulary'], explanation: '"Laconic" means using very few words.' },
    { id: 'q-cat-7', examId: 'cat', text: 'A pipe fills tank in 6 hours, another empties in 10 hours. Both open: time to fill?', options: ['12 hours', '15 hours', '16 hours', '18 hours'], correct: '15 hours', difficulty: 'medium', tags: ['quant','pipes-cisterns'], explanation: 'Net rate = 1/6 - 1/10 = 1/15. Time = 15 hours.' },
    { id: 'q-cat-8', examId: 'cat', text: 'If log₂ 8 = x, then x equals:', options: ['2', '3', '4', '1/3'], correct: '3', difficulty: 'easy', tags: ['quant','logarithms'], explanation: 'log₂ 2³ = 3.' },
    { id: 'q-cat-9', examId: 'cat', text: 'A, B, C, D complete work in 6, 8, 12, 24 days. Fraction done by A and D in one day?', options: ['1/4', '5/24', '1/8', '5/12'], correct: '5/24', difficulty: 'medium', tags: ['quant','time-work'], explanation: '1/6 + 1/24 = 4/24 + 1/24 = 5/24.' },
    { id: 'q-cat-10', examId: 'cat', text: 'AI automates repetitive tasks: higher efficiency but raises job displacement concerns. Author\'s tone?', options: ['Wholly optimistic', 'Purely critical', 'Balanced and objective', 'Deeply pessimistic'], correct: 'Balanced and objective', difficulty: 'medium', tags: ['english','reading-comprehension'], explanation: 'Both positives and concerns are presented without taking sides.' },

    // Current Affairs (10 questions)
    { id: 'q-ca-1', examId: 'current-affairs', text: 'India\'s first underwater metro opened in which city?', options: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'], correct: 'Kolkata', difficulty: 'easy', tags: ['current-affairs','infrastructure'], explanation: 'India\'s first underwater metro tunnel was inaugurated in Kolkata in March 2024.' },
    { id: 'q-ca-2', examId: 'current-affairs', text: 'Who was appointed as the Chief Justice of India in 2024?', options: ['Justice D.Y. Chandrachud', 'Justice Sanjiv Khanna', 'Justice N.V. Ramana', 'Justice U.U. Lalit'], correct: 'Justice Sanjiv Khanna', difficulty: 'medium', tags: ['current-affairs','polity'], explanation: 'Justice Sanjiv Khanna was sworn in as the 51st CJI on November 11, 2024.' },
    { id: 'q-ca-3', examId: 'current-affairs', text: 'Chandrayaan-3 successfully landed on the Moon\'s south pole in which year?', options: ['2021', '2022', '2023', '2024'], correct: '2023', difficulty: 'easy', tags: ['current-affairs','space'], explanation: 'Chandrayaan-3 landed near the Moon\'s south pole on August 23, 2023.' },
    { id: 'q-ca-4', examId: 'current-affairs', text: 'The G20 Summit 2023 was hosted by India in:', options: ['Mumbai', 'New Delhi', 'Bangalore', 'Chennai'], correct: 'New Delhi', difficulty: 'easy', tags: ['current-affairs','international'], explanation: 'India hosted the G20 Summit 2023 in New Delhi, September 9-10, 2023.' },
    { id: 'q-ca-5', examId: 'current-affairs', text: 'Who won the FIFA Women\'s World Cup 2023?', options: ['USA', 'England', 'Spain', 'Australia'], correct: 'Spain', difficulty: 'medium', tags: ['current-affairs','sports'], explanation: 'Spain defeated England 1-0 in the final on August 20, 2023.' },
    { id: 'q-ca-6', examId: 'current-affairs', text: 'The Nobel Peace Prize 2023 was awarded to:', options: ['Narges Mohammadi', 'Greta Thunberg', 'Malala Yousafzai', 'UNICEF'], correct: 'Narges Mohammadi', difficulty: 'medium', tags: ['current-affairs','awards'], explanation: 'Narges Mohammadi, Iranian human rights activist, won Nobel Peace Prize 2023.' },
    { id: 'q-ca-7', examId: 'current-affairs', text: 'India\'s UPI crossed how many daily transactions milestone in 2023?', options: ['100 million', '400 million', '500 million', '1 billion'], correct: '500 million', difficulty: 'medium', tags: ['current-affairs','economy'], explanation: 'UPI crossed 500 million daily transactions in 2023.' },
    { id: 'q-ca-8', examId: 'current-affairs', text: 'Which Indian cricketer holds the record for 100 international centuries?', options: ['Virat Kohli', 'Sachin Tendulkar', 'Rohit Sharma', 'MS Dhoni'], correct: 'Sachin Tendulkar', difficulty: 'easy', tags: ['current-affairs','sports'], explanation: 'Sachin Tendulkar holds the unique record of 100 international centuries.' },
    { id: 'q-ca-9', examId: 'current-affairs', text: 'Operation Kaveri was launched by India in 2023 to evacuate nationals from:', options: ['Ukraine', 'Sudan', 'Afghanistan', 'Libya'], correct: 'Sudan', difficulty: 'medium', tags: ['current-affairs','geopolitics'], explanation: 'Operation Kaveri evacuated Indians from Sudan in April 2023.' },
    { id: 'q-ca-10', examId: 'current-affairs', text: 'Which country became the newest member of BRICS in 2024?', options: ['Saudi Arabia', 'Argentina', 'Iran', 'Ethiopia'], correct: 'Iran', difficulty: 'medium', tags: ['current-affairs','international'], explanation: 'Iran officially joined BRICS on January 1, 2024.' },

    // CDS (10 questions)
    { id: 'q-cds-1', examId: 'cds', text: 'What is the full form of CDS in the context of Indian Armed Forces?', options: ['Chief of Defence Staff', 'Combined Defence Services', 'Central Defence Squadron', 'Core Defence System'], correct: 'Chief of Defence Staff', difficulty: 'easy', tags: ['defence','general-knowledge'], explanation: 'Gen. Bipin Rawat became India\'s first CDS on January 1, 2020.' },
    { id: 'q-cds-2', examId: 'cds', text: 'Which of the following is the longest river in India?', options: ['Godavari', 'Yamuna', 'Ganga', 'Krishna'], correct: 'Ganga', difficulty: 'easy', tags: ['geography','rivers'], explanation: 'The Ganga is the longest river in India, stretching about 2,525 km.' },
    { id: 'q-cds-3', examId: 'cds', text: 'The Battle of Plassey was fought in:', options: ['1757', '1764', '1775', '1799'], correct: '1757', difficulty: 'medium', tags: ['history','british-india'], explanation: 'Battle of Plassey was fought on June 23, 1757 between British East India Company and Nawab of Bengal.' },
    { id: 'q-cds-4', examId: 'cds', text: 'If 2x + 3 = 15, then x equals:', options: ['4', '5', '6', '7'], correct: '6', difficulty: 'easy', tags: ['mathematics','algebra'], explanation: '2x = 12, x = 6.' },
    { id: 'q-cds-5', examId: 'cds', text: 'The Indian Military Academy is located at:', options: ['Pune', 'Dehradun', 'Khadakwasla', 'Bangalore'], correct: 'Dehradun', difficulty: 'easy', tags: ['defence','general-knowledge'], explanation: 'IMA is in Dehradun, Uttarakhand, established in 1932.' },
    { id: 'q-cds-6', examId: 'cds', text: 'Choose the correct spelling:', options: ['Accomodation', 'Accommodation', 'Acommodation', 'Accommodaton'], correct: 'Accommodation', difficulty: 'medium', tags: ['english','spelling'], explanation: '"Accommodation" with double c and double m.' },
    { id: 'q-cds-7', examId: 'cds', text: 'The Tropic of Cancer passes through which Indian state?', options: ['Kerala', 'Rajasthan', 'Karnataka', 'Tamil Nadu'], correct: 'Rajasthan', difficulty: 'medium', tags: ['geography','india'], explanation: 'Tropic of Cancer passes through 8 Indian states including Rajasthan.' },
    { id: 'q-cds-8', examId: 'cds', text: 'Operation Vijay (1999) refers to:', options: ['Bangladesh Liberation War', 'Kargil War', 'Siachen Operation', 'Indo-Chinese War'], correct: 'Kargil War', difficulty: 'medium', tags: ['defence','history'], explanation: 'Operation Vijay was India\'s operation to recapture positions during the 1999 Kargil War.' },
    { id: 'q-cds-9', examId: 'cds', text: 'The area of a circle with radius 7 cm (π=22/7):', options: ['44 cm²', '154 cm²', '176 cm²', '22 cm²'], correct: '154 cm²', difficulty: 'easy', tags: ['mathematics','mensuration'], explanation: 'Area = (22/7)×7² = 154 cm².' },
    { id: 'q-cds-10', examId: 'cds', text: 'Which of the following is a leap year?', options: ['1900', '2100', '2000', '1800'], correct: '2000', difficulty: 'medium', tags: ['mathematics','general'], explanation: 'Century year is leap year only if divisible by 400. 2000÷400=5.' },

    // AFCAT (10 questions)
    { id: 'q-afcat-1', examId: 'afcat', text: 'Which aircraft is the primary fighter jet of the Indian Air Force?', options: ['MiG-21', 'Sukhoi Su-30MKI', 'Rafale', 'Tejas Mk1A'], correct: 'Sukhoi Su-30MKI', difficulty: 'medium', tags: ['defence','air-force'], explanation: 'Sukhoi Su-30MKI is the primary multi-role fighter of IAF.' },
    { id: 'q-afcat-2', examId: 'afcat', text: 'The INS Vikrant is India\'s:', options: ['Submarine', 'Aircraft Carrier', 'Destroyer', 'Frigate'], correct: 'Aircraft Carrier', difficulty: 'easy', tags: ['defence','navy'], explanation: 'INS Vikrant is India\'s first indigenously built aircraft carrier.' },
    { id: 'q-afcat-3', examId: 'afcat', text: 'If A={1,2,3,4} and B={3,4,5,6}, find A∩B:', options: ['{1,2,5,6}', '{3,4}', '{1,2,3,4,5,6}', '{1,2}'], correct: '{3,4}', difficulty: 'easy', tags: ['mathematics','sets'], explanation: 'Intersection contains common elements: 3 and 4.' },
    { id: 'q-afcat-4', examId: 'afcat', text: 'The correct antonym of "Benevolent" is:', options: ['Generous', 'Kind', 'Malevolent', 'Charitable'], correct: 'Malevolent', difficulty: 'medium', tags: ['english','vocabulary'], explanation: '"Malevolent" means wishing evil to others.' },
    { id: 'q-afcat-5', examId: 'afcat', text: 'Agni-V is classified as a:', options: ['Cruise missile', 'Anti-aircraft missile', 'Intercontinental Ballistic Missile (ICBM)', 'Short-range missile'], correct: 'Intercontinental Ballistic Missile (ICBM)', difficulty: 'medium', tags: ['defence','science'], explanation: 'Agni-V is India\'s first ICBM with range over 5,000 km.' },
    { id: 'q-afcat-6', examId: 'afcat', text: 'Find the odd one out: Kolkata, Delhi, Mumbai, Chennai, Patna', options: ['Kolkata', 'Delhi', 'Patna', 'Chennai'], correct: 'Patna', difficulty: 'easy', tags: ['reasoning','odd-one-out'], explanation: 'Patna is not one of the four traditional metro cities of India.' },
    { id: 'q-afcat-7', examId: 'afcat', text: 'What is 15% of 480?', options: ['60', '72', '75', '80'], correct: '72', difficulty: 'easy', tags: ['mathematics','percentage'], explanation: '15/100 × 480 = 72.' },
    { id: 'q-afcat-8', examId: 'afcat', text: 'The International Court of Justice (ICJ) is located at:', options: ['New York', 'Geneva', 'The Hague', 'Brussels'], correct: 'The Hague', difficulty: 'medium', tags: ['general-awareness','international'], explanation: 'ICJ is at the Peace Palace in The Hague, Netherlands.' },
    { id: 'q-afcat-9', examId: 'afcat', text: 'In a class, 40% passed Math, 70% passed English, 20% failed both. What % passed both?', options: ['10%', '20%', '30%', '40%'], correct: '30%', difficulty: 'hard', tags: ['mathematics','percentages'], explanation: 'Passed at least one = 80%. By inclusion-exclusion: 40+70-x=80, x=30%.' },
    { id: 'q-afcat-10', examId: 'afcat', text: 'The Indian Air Force was established on:', options: ['August 8, 1932', 'October 8, 1932', 'January 26, 1950', 'August 15, 1947'], correct: 'October 8, 1932', difficulty: 'medium', tags: ['defence','air-force'], explanation: 'IAF was established on October 8, 1932 as Royal Indian Air Force.' },

    // JEE-ADVANCED (10 questions)
    { id: 'q-jeeadv-1', examId: 'jee-advanced', text: 'The number of solutions of |x² - x - 6| = x + 2 is:', options: ['2', '3', '4', '1'], correct: '3', difficulty: 'hard', tags: ['mathematics','equations'], explanation: 'Solutions x=4, x=-2, x=2. Count: 3.' },
    { id: 'q-jeeadv-2', examId: 'jee-advanced', text: 'A particle moves in circle of radius R. In half revolution, ratio of displacement to distance is:', options: ['π/2', '2/π', '1/π', 'π'], correct: '2/π', difficulty: 'hard', tags: ['physics','circular-motion'], explanation: 'Displacement=2R, distance=πR. Ratio=2/π.' },
    { id: 'q-jeeadv-3', examId: 'jee-advanced', text: 'The oxidation state of Cr in K₂Cr₂O₇ is:', options: ['+3', '+4', '+6', '+7'], correct: '+6', difficulty: 'medium', tags: ['chemistry','oxidation-state'], explanation: '2+2x-14=0, x=+6.' },
    { id: 'q-jeeadv-4', examId: 'jee-advanced', text: 'If matrix A = [[1,2],[3,4]], then det(A) equals:', options: ['-2', '2', '10', '-10'], correct: '-2', difficulty: 'medium', tags: ['mathematics','matrices'], explanation: '1×4 - 2×3 = -2.' },
    { id: 'q-jeeadv-5', examId: 'jee-advanced', text: 'In PCl₅ ⇌ PCl₃ + Cl₂, adding inert gas at constant volume will:', options: ['Increase dissociation', 'Decrease dissociation', 'No effect on equilibrium', 'Shift equilibrium left'], correct: 'No effect on equilibrium', difficulty: 'hard', tags: ['chemistry','equilibrium'], explanation: 'At constant volume, inert gas does not change partial pressures.' },
    { id: 'q-jeeadv-6', examId: 'jee-advanced', text: 'The value of lim(x→0) [sin x / x] is:', options: ['0', '∞', '1', 'undefined'], correct: '1', difficulty: 'easy', tags: ['mathematics','limits'], explanation: 'Fundamental limit in calculus.' },
    { id: 'q-jeeadv-7', examId: 'jee-advanced', text: 'Charges +q and -q at distance d. Electric potential at midpoint is:', options: ['kq/d', '-kq/d', '0', '2kq/d'], correct: '0', difficulty: 'hard', tags: ['physics','electrostatics'], explanation: 'Potential = 2kq/d + (-2kq/d) = 0.' },
    { id: 'q-jeeadv-8', examId: 'jee-advanced', text: 'The hybridization of central atom in SF₆ is:', options: ['sp³', 'sp³d', 'sp³d²', 'd²sp³'], correct: 'sp³d²', difficulty: 'hard', tags: ['chemistry','hybridization'], explanation: 'SF₆ has 6 bond pairs, octahedral geometry, sp³d².' },
    { id: 'q-jeeadv-9', examId: 'jee-advanced', text: 'For an adiabatic process (γ=Cp/Cv), which relationship holds?', options: ['PV = constant', 'TV^(γ-1) = constant', 'PV^γ = constant', 'Both B and C'], correct: 'Both B and C', difficulty: 'hard', tags: ['physics','thermodynamics'], explanation: 'Both PVγ=const and TV^(γ-1)=const hold for adiabatic process.' },
    { id: 'q-jeeadv-10', examId: 'jee-advanced', text: 'Number of electrons in outermost shell of Xenon (Z=54) is:', options: ['2', '6', '8', '18'], correct: '8', difficulty: 'medium', tags: ['chemistry','electronic-configuration'], explanation: 'Xe: [Kr] 4d¹⁰ 5s² 5p⁶. Outermost n=5 has 8 electrons.' },

    // CUET (10 questions)
    { id: 'q-cuet-1', examId: 'cuet', text: 'Sum of three consecutive integers is 48. The largest integer is:', options: ['15', '16', '17', '18'], correct: '17', difficulty: 'easy', tags: ['mathematics','algebra'], explanation: '3n=48, n=16. Largest=17.' },
    { id: 'q-cuet-2', examId: 'cuet', text: 'Which is NOT a Central University in India?', options: ['University of Delhi', 'Jawaharlal Nehru University', 'Savitribai Phule Pune University', 'Banaras Hindu University'], correct: 'Savitribai Phule Pune University', difficulty: 'medium', tags: ['education','general-knowledge'], explanation: 'Savitribai Phule Pune University is a state university.' },
    { id: 'q-cuet-3', examId: 'cuet', text: '"Vasudhaiva Kutumbakam" means:', options: ['One Nation, Many Cultures', 'The World is One Family', 'Unity in Diversity', 'India First'], correct: 'The World is One Family', difficulty: 'easy', tags: ['current-affairs','culture'], explanation: 'Sanskrit phrase from Maha Upanishad: The world is one family.' },
    { id: 'q-cuet-4', examId: 'cuet', text: 'A train travels 300 km at 60 km/h and 200 km at 40 km/h. Average speed?', options: ['50 km/h', '48 km/h', '52 km/h', '45 km/h'], correct: '50 km/h', difficulty: 'medium', tags: ['mathematics','speed-distance'], explanation: 'Total dist=500km. Time=5+5=10h. Avg=50km/h.' },
    { id: 'q-cuet-5', examId: 'cuet', text: 'Which Article of the Indian Constitution abolishes untouchability?', options: ['Article 14', 'Article 15', 'Article 17', 'Article 21'], correct: 'Article 17', difficulty: 'medium', tags: ['polity','constitution'], explanation: 'Article 17 abolishes untouchability.' },
    { id: 'q-cuet-6', examId: 'cuet', text: 'The synonym of "Eloquent" is:', options: ['Silent', 'Articulate', 'Confused', 'Awkward'], correct: 'Articulate', difficulty: 'easy', tags: ['english','vocabulary'], explanation: '"Eloquent" and "Articulate" both mean fluent and persuasive.' },
    { id: 'q-cuet-7', examId: 'cuet', text: 'Who wrote "Wings of Fire"?', options: ['Narendra Modi', 'APJ Abdul Kalam', 'Vikram Sarabhai', 'Homi Bhabha'], correct: 'APJ Abdul Kalam', difficulty: 'easy', tags: ['literature','general-knowledge'], explanation: '"Wings of Fire" is the autobiography of Dr. APJ Abdul Kalam.' },
    { id: 'q-cuet-8', examId: 'cuet', text: 'India\'s GDP is measured using which methods?', options: ['Production Method only', 'Income Method only', 'Expenditure Method only', 'All three methods'], correct: 'All three methods', difficulty: 'medium', tags: ['economics','gdp'], explanation: 'GDP measured by Production, Income, and Expenditure methods.' },
    { id: 'q-cuet-9', examId: 'cuet', text: 'The compound NaCl has which type of bonding?', options: ['Covalent', 'Metallic', 'Ionic', 'Hydrogen'], correct: 'Ionic', difficulty: 'easy', tags: ['chemistry','bonding'], explanation: 'NaCl (common salt) has ionic bonding between Na+ and Cl-.' },
    { id: 'q-cuet-10', examId: 'cuet', text: 'Which of the following is an example of a vector quantity?', options: ['Mass', 'Temperature', 'Speed', 'Velocity'], correct: 'Velocity', difficulty: 'easy', tags: ['physics','vectors'], explanation: 'Velocity has both magnitude and direction (vector).' },

    // Navy AA (10 questions)
    { id: 'q-navy-1', examId: 'navy-aa', text: 'Water has maximum density at:', options: ['0°C', '4°C', '100°C', '25°C'], correct: '4°C', difficulty: 'easy', tags: ['physics','properties'], explanation: 'Water has maximum density (1000 kg/m³) at 4°C.' },
    { id: 'q-navy-2', examId: 'navy-aa', text: 'The valency of oxygen is:', options: ['1', '2', '3', '4'], correct: '2', difficulty: 'easy', tags: ['chemistry','valency'], explanation: 'Oxygen needs 2 electrons to complete octet, so valency=2.' },
    { id: 'q-navy-3', examId: 'navy-aa', text: 'Perimeter of rectangle with length 8 cm and width 5 cm:', options: ['26 cm', '40 cm', '13 cm', '26 cm²'], correct: '26 cm', difficulty: 'easy', tags: ['mathematics','mensuration'], explanation: 'P = 2(8+5) = 26 cm.' },
    { id: 'q-navy-4', examId: 'navy-aa', text: 'Which vitamin is produced by human body when exposed to sunlight?', options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'], correct: 'Vitamin D', difficulty: 'easy', tags: ['biology','vitamins'], explanation: 'Vitamin D is synthesized in skin upon exposure to UVB sunlight.' },
    { id: 'q-navy-5', examId: 'navy-aa', text: 'Indian Navy Day is celebrated on:', options: ['August 15', 'December 4', 'October 8', 'January 15'], correct: 'December 4', difficulty: 'easy', tags: ['defence','navy'], explanation: 'Indian Navy Day is December 4, commemorating Operation Trident (1971).' },
    { id: 'q-navy-6', examId: 'navy-aa', text: 'Solve: 3x - 7 = 2x + 5', options: ['x = 10', 'x = 12', 'x = 8', 'x = 2'], correct: 'x = 12', difficulty: 'easy', tags: ['mathematics','algebra'], explanation: '3x - 2x = 5+7, x = 12.' },
    { id: 'q-navy-7', examId: 'navy-aa', text: 'The process of conversion of solid directly to gas is called:', options: ['Evaporation', 'Condensation', 'Sublimation', 'Fusion'], correct: 'Sublimation', difficulty: 'easy', tags: ['chemistry','states-of-matter'], explanation: 'Sublimation: solid to gas without liquid stage. E.g., dry ice, naphthalene.' },
    { id: 'q-navy-8', examId: 'navy-aa', text: 'Who was the first Chief of Naval Staff of independent India?', options: ['Admiral R.D. Katari', 'Vice Admiral R.D. Katari', 'Rear Admiral J.T.S. Hall', 'Admiral Sureesh Mehta'], correct: 'Vice Admiral R.D. Katari', difficulty: 'hard', tags: ['defence','history'], explanation: 'Vice Admiral R.D. Katari became first Indian CNS on April 22, 1958.' },
    { id: 'q-navy-9', examId: 'navy-aa', text: 'The speed of sound in air at room temperature is approximately:', options: ['300 m/s', '343 m/s', '3000 m/s', '150 m/s'], correct: '343 m/s', difficulty: 'medium', tags: ['physics','sound'], explanation: 'Speed of sound in dry air at 20°C ≈ 343 m/s.' },
    { id: 'q-navy-10', examId: 'navy-aa', text: 'The chemical symbol for Gold is:', options: ['Go', 'Gd', 'Au', 'Ag'], correct: 'Au', difficulty: 'easy', tags: ['chemistry','periodic-table'], explanation: 'Gold symbol Au from Latin "Aurum".' },

    // Army TES (10 questions)
    { id: 'q-armytes-1', examId: 'army-tes', text: 'The value of sin 30° + cos 60° is:', options: ['1', '0', '√3/2', '√2'], correct: '1', difficulty: 'easy', tags: ['mathematics','trigonometry'], explanation: 'sin30°=1/2, cos60°=1/2. Sum=1.' },
    { id: 'q-armytes-2', examId: 'army-tes', text: 'Which of the following has the highest energy photon?', options: ['Radio waves', 'Infrared', 'X-rays', 'Microwaves'], correct: 'X-rays', difficulty: 'medium', tags: ['physics','electromagnetic-spectrum'], explanation: 'X-rays have highest frequency among options, so highest energy.' },
    { id: 'q-armytes-3', examId: 'army-tes', text: 'The molecular formula of glucose is:', options: ['C6H12O6', 'C12H22O11', 'C6H6', 'CH2O'], correct: 'C6H12O6', difficulty: 'easy', tags: ['chemistry','organic'], explanation: 'Glucose (monosaccharide) = C6H12O6.' },
    { id: 'q-armytes-4', examId: 'army-tes', text: 'If a + b = 10 and ab = 21, find a² + b²:', options: ['58', '100', '42', '79'], correct: '58', difficulty: 'medium', tags: ['mathematics','algebra'], explanation: 'a²+b² = (a+b)² - 2ab = 100 - 42 = 58.' },
    { id: 'q-armytes-5', examId: 'army-tes', text: 'The phenomenon of total internal reflection is used in:', options: ['Mirrors', 'Optical fibres', 'Prisms', 'Magnifying glass'], correct: 'Optical fibres', difficulty: 'medium', tags: ['physics','optics'], explanation: 'Optical fibres use total internal reflection for data transmission.' },
    { id: 'q-armytes-6', examId: 'army-tes', text: 'The Indian Army\'s motto is:', options: ['Nabhah Sprusham Diptam', 'Service Before Self', 'Sam No Varunah', 'Na Sukham Asukham Vishati'], correct: 'Na Sukham Asukham Vishati', difficulty: 'hard', tags: ['defence','army'], explanation: 'Indian Army motto: "Na Sukham Asukham Vishati" — service before self.' },
    { id: 'q-armytes-7', examId: 'army-tes', text: 'Which acid is found in vinegar?', options: ['Citric acid', 'Acetic acid', 'Lactic acid', 'Formic acid'], correct: 'Acetic acid', difficulty: 'easy', tags: ['chemistry','acids'], explanation: 'Vinegar contains acetic acid (CH3COOH) at 5-8%.' },
    { id: 'q-armytes-8', examId: 'army-tes', text: 'Area of equilateral triangle with side 6 cm is:', options: ['9√3 cm²', '12√3 cm²', '18 cm²', '36 cm²'], correct: '9√3 cm²', difficulty: 'medium', tags: ['mathematics','geometry'], explanation: '(√3/4)×36 = 9√3 cm².' },
    { id: 'q-armytes-9', examId: 'army-tes', text: 'If R = 5Ω and I = 2A, voltage V equals:', options: ['2.5 V', '7 V', '10 V', '3 V'], correct: '10 V', difficulty: 'easy', tags: ['physics','electricity'], explanation: 'V = IR = 2×5 = 10 V.' },
    { id: 'q-armytes-10', examId: 'army-tes', text: 'RRB stands for:', options: ['Railway Recruitment Board', 'Road & Rail Bureau', 'Rural Railway Board', 'Railway Regulation Bureau'], correct: 'Railway Recruitment Board', difficulty: 'easy', tags: ['general-knowledge','railways'], explanation: 'RRB conducts recruitment exams for various Indian Railways posts.' },

    // RRB-NTPC (10 questions)
    { id: 'q-rrb-1', examId: 'rrb-ntpc', text: 'How many seconds are there in a day?', options: ['84600', '86400', '87600', '88400'], correct: '86400', difficulty: 'easy', tags: ['maths','time'], explanation: '24×60×60 = 86,400 seconds.' },
    { id: 'q-rrb-2', examId: 'rrb-ntpc', text: 'The headquarters of Indian Railways is in:', options: ['Mumbai', 'Kolkata', 'New Delhi', 'Chennai'], correct: 'New Delhi', difficulty: 'easy', tags: ['railways','general-knowledge'], explanation: 'Ministry of Railways headquarters is in New Delhi.' },
    { id: 'q-rrb-3', examId: 'rrb-ntpc', text: 'A number when multiplied by 13 gives 221. What is the number?', options: ['17', '19', '21', '23'], correct: '17', difficulty: 'easy', tags: ['maths','basic'], explanation: '221 ÷ 13 = 17.' },
    { id: 'q-rrb-4', examId: 'rrb-ntpc', text: 'The first railway in India ran between:', options: ['Delhi to Agra', 'Mumbai to Thane', 'Kolkata to Howrah', 'Chennai to Bangalore'], correct: 'Mumbai to Thane', difficulty: 'easy', tags: ['railways','history'], explanation: 'India\'s first railway: Bombay to Thane on April 16, 1853.' },
    { id: 'q-rrb-5', examId: 'rrb-ntpc', text: 'What is 20% of 650?', options: ['115', '120', '130', '140'], correct: '130', difficulty: 'easy', tags: ['maths','percentage'], explanation: '20% × 650 = 130.' },
    { id: 'q-rrb-6', examId: 'rrb-ntpc', text: 'Rajdhani Express trains connect New Delhi with:', options: ['All state capitals', 'Major metropolitan cities only', 'Tourist destinations', 'State capitals and major cities'], correct: 'State capitals and major cities', difficulty: 'medium', tags: ['railways','general'], explanation: 'Rajdhani Express connects New Delhi with state capitals and major cities.' },
    { id: 'q-rrb-7', examId: 'rrb-ntpc', text: 'If 8 men build a wall in 25 days, how many men can do it in 10 days?', options: ['16', '18', '20', '22'], correct: '20', difficulty: 'medium', tags: ['maths','time-work'], explanation: '8×25 = x×10. x = 20 men.' },
    { id: 'q-rrb-8', examId: 'rrb-ntpc', text: 'Indian Railways safety slogan is:', options: ['Safety First, Punctuality Next', 'Safe Journey, Safe Nation', 'Safety: Our Topmost Priority', 'Together Safe'], correct: 'Safety: Our Topmost Priority', difficulty: 'hard', tags: ['railways','general'], explanation: 'Indian Railways slogan: "Safety: Our Topmost Priority".' },
    { id: 'q-rrb-9', examId: 'rrb-ntpc', text: 'What does IRCTC stand for?', options: ['Indian Railway Central Tourism Corporation', 'Indian Railway Catering and Tourism Corporation', 'Indian Rail Commerce and Ticket Centre', 'Indian Rail Central Ticketing Corporation'], correct: 'Indian Railway Catering and Tourism Corporation', difficulty: 'easy', tags: ['railways','full-forms'], explanation: 'IRCTC handles catering, tourism, and online ticketing for Indian Railways.' },
    { id: 'q-rrb-10', examId: 'rrb-ntpc', text: 'The fastest train in India (as of 2024) is:', options: ['Rajdhani Express', 'Shatabdi Express', 'Vande Bharat Express', 'Duronto Express'], correct: 'Vande Bharat Express', difficulty: 'easy', tags: ['railways','current-affairs'], explanation: 'Vande Bharat Express can reach up to 180 km/h.' },

    // CLAT (10 questions)
    { id: 'q-clat-1', examId: 'clat', text: 'Which Article provides for the Right to Life and Personal Liberty?', options: ['Article 14', 'Article 19', 'Article 21', 'Article 22'], correct: 'Article 21', difficulty: 'easy', tags: ['legal-reasoning','constitution'], explanation: 'Article 21: No person shall be deprived of life except by procedure established by law.' },
    { id: 'q-clat-2', examId: 'clat', text: 'The term "Amicus Curiae" means:', options: ['Friend of the Court', 'Enemy of the State', 'Witness Protection', 'Court Order'], correct: 'Friend of the Court', difficulty: 'medium', tags: ['legal-reasoning','legal-terminology'], explanation: '"Amicus Curiae" = friend of the court (Latin).' },
    { id: 'q-clat-3', examId: 'clat', text: 'The Supreme Court of India has original jurisdiction in disputes between:', options: ['Centre and any State only', 'Two states only', 'Centre and States, and between States', 'Citizens and the Government'], correct: 'Centre and States, and between States', difficulty: 'medium', tags: ['legal-reasoning','judiciary'], explanation: 'Under Article 131, Supreme Court has exclusive original jurisdiction in Centre-State disputes.' },
    { id: 'q-clat-4', examId: 'clat', text: 'Which writ is issued to release a person from illegal detention?', options: ['Mandamus', 'Habeas Corpus', 'Certiorari', 'Quo Warranto'], correct: 'Habeas Corpus', difficulty: 'easy', tags: ['legal-reasoning','writs'], explanation: 'Habeas Corpus: "you shall have the body" — protects against unlawful detention.' },
    { id: 'q-clat-5', examId: 'clat', text: 'Who was the first woman Chief Justice of a High Court in India?', options: ['Justice Leila Seth', 'Justice Fatima Beevi', 'Justice Anna Chandy', 'Justice Sujata Manohar'], correct: 'Justice Leila Seth', difficulty: 'hard', tags: ['legal-reasoning','women-in-law'], explanation: 'Justice Leila Seth was first woman CJ of HP High Court in 1991.' },
    { id: 'q-clat-6', examId: 'clat', text: 'Directive Principles of State Policy are contained in which Part?', options: ['Part III', 'Part IV', 'Part IVA', 'Part V'], correct: 'Part IV', difficulty: 'easy', tags: ['polity','constitution'], explanation: 'DPSP in Part IV (Articles 36-51) of Indian Constitution.' },
    { id: 'q-clat-7', examId: 'clat', text: 'The precautionary principle in environmental law means:', options: ['Wait for complete scientific proof before acting', 'Prevent potential harm even without complete scientific certainty', 'Scientific proof is unnecessary', 'Government controls all industries'], correct: 'Prevent potential harm even without complete scientific certainty', difficulty: 'medium', tags: ['legal-reasoning','environmental-law'], explanation: 'Precautionary principle: take preventive action even without complete certainty.' },
    { id: 'q-clat-8', examId: 'clat', text: '"All students scoring above 90 got distinction. Ram got distinction." What can be inferred?', options: ['Ram scored above 90', 'Ram is a student', 'Ram may or may not have scored above 90', 'All students got distinction'], correct: 'Ram may or may not have scored above 90', difficulty: 'hard', tags: ['logical-reasoning','inference'], explanation: 'Affirming the consequent fallacy: Ram could have gotten distinction for other reasons.' },
    { id: 'q-clat-9', examId: 'clat', text: 'The concept of PIL in India was pioneered by:', options: ['Justice P.N. Bhagwati', 'Justice V.R. Krishna Iyer', 'Both A and B', 'Justice Y.V. Chandrachud'], correct: 'Both A and B', difficulty: 'medium', tags: ['legal-reasoning','judiciary'], explanation: 'PIL pioneered by both Justice P.N. Bhagwati and Justice V.R. Krishna Iyer.' },
    { id: 'q-clat-10', examId: 'clat', text: 'The Bar Council of India is established under:', options: ['Advocates Act, 1961', 'Legal Services Authorities Act, 1987', 'Supreme Court (Rules) Act', 'Indian Bar Councils Act, 1926'], correct: 'Advocates Act, 1961', difficulty: 'medium', tags: ['legal-reasoning','legal-profession'], explanation: 'Bar Council of India established under Advocates Act, 1961.' },
  ];

  const insertAll = db.transaction((qs) => {
    for (const q of qs) {
      insert.run(
        q.id, q.examId, q.text,
        JSON.stringify(q.options), q.correct,
        q.type || 'single', q.difficulty || 'medium',
        JSON.stringify(q.tags || []), q.explanation || ''
      );
    }
  });
  insertAll(questionsData);
  console.log(`✅ Seeded ${questionsData.length} questions`);
}

// ─── Start server ─────────────────────────────────────────────────────────────
seedExams();
seedQuestions();
app.listen(PORT, () => {
  console.log(`🚀 GreenGraph API server running on http://localhost:${PORT}`);
  console.log(`📊 Database: SQLite at ./data/greengraph.db`);
});
