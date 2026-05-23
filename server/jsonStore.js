import fs from 'fs/promises';
import path from 'path';

const writeLocks = new Map();

function withWriteLock(filePath, operation) {
  const previous = writeLocks.get(filePath) ?? Promise.resolve();
  const next = previous
    .catch(() => undefined)
    .then(operation);

  writeLocks.set(
    filePath,
    next.finally(() => {
      if (writeLocks.get(filePath) === next) {
        writeLocks.delete(filePath);
      }
    })
  );

  return next;
}

export async function readJsonFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

export async function writeJsonFileAtomic(filePath, payload) {
  const fileName = path.basename(filePath);
  const tempPath = path.join(
    path.dirname(filePath),
    `${fileName}.${process.pid}.${Date.now()}.tmp`
  );

  try {
    await fs.writeFile(tempPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');
    await fs.rename(tempPath, filePath);
  } catch (error) {
    try {
      await fs.unlink(tempPath);
    } catch {
      // Ignore cleanup errors when temp file was never written.
    }
    throw error;
  }
}

export async function writeJsonFileLocked(filePath, payload) {
  return withWriteLock(filePath, () => writeJsonFileAtomic(filePath, payload));
}

