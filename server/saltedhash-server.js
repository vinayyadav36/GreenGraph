import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { readJsonFile, writeJsonFileLocked } from './jsonStore.js';
import { validateDataPayload } from './jsonSchemas.js';
import { SaasAutomationEngine } from './aiAutomationEngine.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required for SALTEDHASH auth.');
}
const BCRYPT_ROUNDS = 12;
const ALLOWED_ORIGINS = new Set(['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000']);

const allowedFiles = new Set([
  'users',
  'fundamentals_concepts',
  'fundamentals_questions',
  'exam_questions',
  'exam_results',
  'projects',
  'resume_templates',
  'job_descriptions',
  'issues',
  'resources',
  'members',
  'threads',
  'events',
  'sponsors',
  'taxonomy',
  'moderation',
  'audit',
  'students',
  'lessons',
  'concepts',
  'budgets',
  'scenarios',
  'quiz_attempts',
  'progress',
  'guidance_rules',
]);

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin not allowed'));
    },
  })
);
app.use(express.json({ limit: '1mb' }));

const ioLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' },
});

function safeFilePath(name) {
  if (!allowedFiles.has(name)) return null;
  return path.join(DATA_DIR, `${name}.json`);
}

function signSessionToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function readCookieValue(rawCookie, key) {
  if (!rawCookie) return null;
  const entries = rawCookie.split(';').map((v) => v.trim());
  const hit = entries.find((entry) => entry.startsWith(`${key}=`));
  if (!hit) return null;
  return decodeURIComponent(hit.slice(key.length + 1));
}

function getTokenFromRequest(req) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
  return readCookieValue(req.headers.cookie || '', 'saltedhash_session');
}

function extractSessionUser(req, res) {
  const token = getTokenFromRequest(req);
  if (!token) {
    res.status(401).json({ error: 'Missing authorization token' });
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }
}

async function loadUsersDocument() {
  const usersPath = safeFilePath('users');
  const payload = await readJsonFile(usersPath);
  if (!payload || !Array.isArray(payload.users)) {
    return { users: [] };
  }
  return payload;
}

function setSessionCookie(res, token) {
  res.cookie('saltedhash_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

app.get('/api/data/:name', ioLimiter, async (req, res) => {
  const filePath = safeFilePath(req.params.name);
  if (!filePath) return res.status(400).json({ error: 'Invalid data file' });

  try {
    const content = await readJsonFile(filePath);
    return res.json(content);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to read JSON file', details: err.message });
  }
});

app.post('/api/data/:name', ioLimiter, async (req, res) => {
  const filePath = safeFilePath(req.params.name);
  if (!filePath) return res.status(400).json({ error: 'Invalid data file' });

  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return res.status(400).json({ error: 'Payload must be a JSON object' });
    }

    const validation = validateDataPayload(req.params.name, payload);
    if (!validation.ok) {
      return res.status(400).json({ error: 'Schema validation failed', details: validation.error });
    }

    await writeJsonFileLocked(filePath, validation.data);
    return res.json({ ok: true, mode: 'atomic_write_locked' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to write JSON file', details: err.message });
  }
});

app.post('/api/auth/register', ioLimiter, async (req, res) => {
  try {
    const { email, password, displayName } = req.body ?? {};
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'email, password, and displayName are required' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const usersDoc = await loadUsersDocument();
    const existing = usersDoc.users.find((u) => String(u.email).toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = {
      id: `usr_${randomUUID().slice(0, 12)}`,
      email: normalizedEmail,
      passwordHash,
      role: 'student',
      grade_level: '',
      country: '',
      created_at: new Date().toISOString(),
      progress: { fundamentals: {}, exam: {} },
      resumes: [],
      profile: {
        displayName: String(displayName).trim(),
        declaredStudentDebt: 0,
        targetProfessionalSalary: 0,
        totalSimulationsExecuted: 0,
        resourceDownloadsCount: 0,
        premiumContentGatedViews: 0,
      },
    };

    const nextUsersDoc = { ...usersDoc, users: [...usersDoc.users, user] };
    const validation = validateDataPayload('users', nextUsersDoc);
    if (!validation.ok) {
      return res.status(400).json({ error: 'Schema validation failed', details: validation.error });
    }

    await writeJsonFileLocked(safeFilePath('users'), validation.data);

    const token = signSessionToken(user);
    setSessionCookie(res, token);

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
        profile: user.profile,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to register user', details: err.message });
  }
});

app.post('/api/auth/login', ioLimiter, async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const usersDoc = await loadUsersDocument();
    const user = usersDoc.users.find((u) => String(u.email).toLowerCase() === normalizedEmail);
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signSessionToken(user);
    setSessionCookie(res, token);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role || 'student',
        createdAt: user.created_at,
        profile: user.profile || { displayName: user.name || '' },
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to login user', details: err.message });
  }
});

app.get('/api/auth/me', ioLimiter, async (req, res) => {
  try {
    const payload = extractSessionUser(req, res);
    if (!payload) return;

    const usersDoc = await loadUsersDocument();
    const user = usersDoc.users.find((u) => u.id === payload.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({
      id: user.id,
      email: user.email,
      role: user.role || 'student',
      createdAt: user.created_at,
      profile: user.profile || { displayName: user.name || '' },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user session', details: err.message });
  }
});

app.post('/api/auth/logout', ioLimiter, (_req, res) => {
  res.clearCookie('saltedhash_session');
  return res.json({ ok: true });
});

app.post('/api/automation/generate-advisory-matrix', ioLimiter, async (req, res) => {
  try {
    const sessionUser = extractSessionUser(req, res);
    if (!sessionUser) return;

    const usersDoc = await loadUsersDocument();
    const activeUserRecord = usersDoc.users.find((u) => u.id === sessionUser.id);
    if (!activeUserRecord) {
      return res.status(404).json({ status: 'ERR_PROFILE_NOT_FOUND', msg: 'Context profile missing.' });
    }

    const profile = activeUserRecord.profile || {};
    const historicalSnapshots =
      Array.isArray(activeUserRecord.metricsHistoryLogs) && activeUserRecord.metricsHistoryLogs.length > 0
        ? activeUserRecord.metricsHistoryLogs
        : [
            { netBalance: Number(profile.targetProfessionalSalary || 0) * 0.05 },
            { netBalance: Number(profile.targetProfessionalSalary || 0) * 0.07 },
            { netBalance: Number(profile.targetProfessionalSalary || 0) * 0.06 },
          ];

    const mathematicalRunRateForecast = SaasAutomationEngine.generatePredictiveRunRate(historicalSnapshots, 6);

    const referenceClassificationProfiles = [
      {
        simulationsCount: 12,
        downloadsCount: 8,
        gatedViewsCount: 15,
        assignedCategoryClassification: 'HIGH_ENGAGEMENT_FOUNDER',
      },
      {
        simulationsCount: 2,
        downloadsCount: 1,
        gatedViewsCount: 0,
        assignedCategoryClassification: 'PASSIVE_RETAINED_STUDENT',
      },
      {
        simulationsCount: 25,
        downloadsCount: 4,
        gatedViewsCount: 30,
        assignedCategoryClassification: 'POWER_RESEARCH_USER',
      },
    ];

    const userBehavioralClassification = SaasAutomationEngine.categorizeMemberPersona(
      {
        totalSimulationsExecuted: Number(profile.totalSimulationsExecuted || 0),
        resourceDownloadsCount: Number(profile.resourceDownloadsCount || 0),
        premiumContentGatedViews: Number(profile.premiumContentGatedViews || 0),
      },
      referenceClassificationProfiles
    );

    const fullyCompiledPromptPayload = SaasAutomationEngine.synthesizeContextualPromptPayload(
      profile,
      mathematicalRunRateForecast
    );

    return res.json({
      status: 'SUCCESS',
      automationExecutionMetrics: {
        predictiveForecast: mathematicalRunRateForecast,
        behavioralCategorization: userBehavioralClassification,
        llmPromptOrchestrationPackage: fullyCompiledPromptPayload,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: 'ERR_AUTOMATION_FAULT', msg: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`SALTEDHASH local JSON API running on port ${PORT}`);
});
