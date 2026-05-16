import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

const allowedFiles = new Set([
  'users',
  'fundamentals_concepts',
  'fundamentals_questions',
  'exam_questions',
  'exam_results',
  'projects',
  'resume_templates',
  'job_descriptions',
]);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const routeBuckets = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 120;

function rateLimit(req, res, next) {
  const key = `${req.ip}:${req.method}:${req.path}`;
  const now = Date.now();
  const bucket = routeBuckets.get(key) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }

  bucket.count += 1;
  routeBuckets.set(key, bucket);

  if (bucket.count > RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  return next();
}

function safeFilePath(name) {
  if (!allowedFiles.has(name)) return null;
  return path.join(DATA_DIR, `${name}.json`);
}

app.get('/api/data/:name', rateLimit, async (req, res) => {
  const filePath = safeFilePath(req.params.name);
  if (!filePath) return res.status(400).json({ error: 'Invalid data file' });

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return res.json(JSON.parse(content));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to read JSON file', details: err.message });
  }
});

app.post('/api/data/:name', rateLimit, async (req, res) => {
  const filePath = safeFilePath(req.params.name);
  if (!filePath) return res.status(400).json({ error: 'Invalid data file' });

  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return res.status(400).json({ error: 'Payload must be a JSON object' });
    }

    const serialized = `${JSON.stringify(payload, null, 2)}\n`;
    await fs.writeFile(filePath, serialized, 'utf-8');
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to write JSON file', details: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`SALTEDHASH local JSON API running on port ${PORT}`);
});
