import { openDB, IDBPDatabase } from 'idb';
import { ExamSession, ExamResult } from '../types';

const DB_NAME = 'forever-university-db';
const DB_VERSION = 1;

let db: IDBPDatabase | null = null;

export async function getDB() {
  if (!db) {
    db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains('examSessions')) {
          database.createObjectStore('examSessions', { keyPath: 'sessionId' });
        }
        if (!database.objectStoreNames.contains('examResults')) {
          database.createObjectStore('examResults', { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains('courseCache')) {
          database.createObjectStore('courseCache', { keyPath: 'id' });
        }
      },
    });
  }
  return db;
}

export async function saveExamSession(session: ExamSession): Promise<void> {
  const database = await getDB();
  await database.put('examSessions', { ...session, _synced: false });
}

export async function getExamSession(sessionId: string): Promise<ExamSession | undefined> {
  const database = await getDB();
  return database.get('examSessions', sessionId);
}

export async function saveExamResult(result: ExamResult): Promise<void> {
  const database = await getDB();
  await database.put('examResults', { ...result, _synced: false });
}

export async function getUnsyncedResults(): Promise<ExamResult[]> {
  const database = await getDB();
  const all = await database.getAll('examResults');
  return all.filter((r: ExamResult & { _synced?: boolean }) => !r._synced);
}

export async function markResultSynced(id: string): Promise<void> {
  const database = await getDB();
  const result = await database.get('examResults', id);
  if (result) {
    await database.put('examResults', { ...result, _synced: true });
  }
}
