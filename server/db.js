/**
 * SQLite database setup for GreenGraph / Forever University
 * All tables are created here with proper indices.
 */
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'greengraph.db');

// Ensure data directory exists
import { mkdirSync } from 'fs';
mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// --- Schema ---
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'student',
    avatar_url  TEXT,
    language    TEXT NOT NULL DEFAULT 'en',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS exams (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    full_name    TEXT NOT NULL,
    category     TEXT NOT NULL,
    icon         TEXT,
    color        TEXT,
    description  TEXT,
    vacancies    TEXT,
    exam_date    TEXT,
    difficulty   TEXT NOT NULL DEFAULT 'medium',
    question_count INTEGER NOT NULL DEFAULT 0,
    session_id   TEXT,
    topics       TEXT NOT NULL DEFAULT '[]',
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id        TEXT PRIMARY KEY,
    user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exam_id   TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, exam_id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exam_id    TEXT REFERENCES exams(id) ON DELETE SET NULL,
    title      TEXT NOT NULL,
    message    TEXT NOT NULL,
    type       TEXT NOT NULL DEFAULT 'info',
    read       INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS exam_results (
    id               TEXT PRIMARY KEY,
    user_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exam_id          TEXT NOT NULL,
    score            REAL NOT NULL,
    accuracy         REAL NOT NULL,
    time_taken_sec   INTEGER NOT NULL,
    topic_breakdown  TEXT NOT NULL DEFAULT '{}',
    created_at       TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS course_progress (
    id           TEXT PRIMARY KEY,
    user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id    TEXT NOT NULL,
    stage_id     TEXT NOT NULL,
    completed    INTEGER NOT NULL DEFAULT 0,
    score        REAL,
    completed_at TEXT,
    UNIQUE(user_id, course_id, stage_id)
  );

  CREATE TABLE IF NOT EXISTS enrollments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    email TEXT NOT NULL,
    enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, course_id)
  );

  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL,
    text TEXT NOT NULL,
    options TEXT NOT NULL DEFAULT '[]',
    correct TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'single',
    difficulty TEXT NOT NULL DEFAULT 'medium',
    tags TEXT NOT NULL DEFAULT '[]',
    explanation TEXT NOT NULL DEFAULT '',
    trick TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
  CREATE INDEX IF NOT EXISTS idx_results_user ON exam_results(user_id);
  CREATE INDEX IF NOT EXISTS idx_progress_user ON course_progress(user_id);
  CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
  CREATE INDEX IF NOT EXISTS idx_questions_exam ON questions(exam_id);
`);

export default db;
