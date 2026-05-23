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

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const JWT_SECRET = process.env.JWT_SECRET || 'saltedhash_json_only_backend_secret_change_me';
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

function getTokenFromRequest(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  return auth.slice(7).trim();
}

async function loadUsersDocument() {
  const usersPath = safeFilePath('users');
  const payload = await readJsonFile(usersPath);
  if (!payload || !Array.isArray(payload.users)) {
    return { users: [] };
  }
  return payload;
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
      return res.status(400).json({
        error: 'Schema validation failed',
        details: validation.error,
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

          const passwordHash = await bcrypt.hash(password, 12);
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
            profile: { displayName: String(displayName).trim() },
          };

          const nextUsersDoc = { ...usersDoc, users: [...usersDoc.users, user] };
          const validation = validateDataPayload('users', nextUsersDoc);
          if (!validation.ok) {
            return res.status(400).json({ error: 'Schema validation failed', details: validation.error });
          }

          await writeJsonFileLocked(safeFilePath('users'), validation.data);
          const token = signSessionToken(user);
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
          const token = getTokenFromRequest(req);
          if (!token) return res.status(401).json({ error: 'Missing authorization token' });

          let payload;
          try {
            payload = jwt.verify(token, JWT_SECRET);
          } catch {
            return res.status(401).json({ error: 'Invalid token' });
          }

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
    }

    await writeJsonFileLocked(filePath, validation.data);
    return res.json({ ok: true, mode: 'atomic_write_locked' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to write JSON file', details: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`SALTEDHASH local JSON API running on port ${PORT}`);
});
