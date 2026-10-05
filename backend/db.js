import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, 'tasks.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    title     TEXT    NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    "order"   INTEGER NOT NULL DEFAULT 0
  )
`);

const toTask = (row) => row && { ...row, completed: Boolean(row.completed) };

const stmts = {
  all: db.prepare('SELECT * FROM tasks ORDER BY "order" ASC, id ASC'),
  get: db.prepare('SELECT * FROM tasks WHERE id = ?'),
  maxOrder: db.prepare('SELECT COALESCE(MAX("order"), -1) AS max FROM tasks'),
  insert: db.prepare('INSERT INTO tasks (title, completed, "order") VALUES (?, 0, ?)'),
  setTitle: db.prepare('UPDATE tasks SET title = ? WHERE id = ?'),
  setCompleted: db.prepare('UPDATE tasks SET completed = ? WHERE id = ?'),
  setOrder: db.prepare('UPDATE tasks SET "order" = ? WHERE id = ?'),
  remove: db.prepare('DELETE FROM tasks WHERE id = ?'),
};

export function getAllTasks() {
  return stmts.all.all().map(toTask);
}

export function getTask(id) {
  return toTask(stmts.get.get(id));
}

export function createTask(title) {
  const { max } = stmts.maxOrder.get();
  const { lastInsertRowid } = stmts.insert.run(title, max + 1);
  return getTask(lastInsertRowid);
}

// Moves a task to `newIndex` and renumbers the whole list so orders stay contiguous (0..n-1).
const moveTask = db.transaction((id, newIndex) => {
  const ids = stmts.all.all().map((t) => t.id).filter((tid) => tid !== id);
  const index = Math.max(0, Math.min(newIndex, ids.length));
  ids.splice(index, 0, id);
  ids.forEach((tid, i) => stmts.setOrder.run(i, tid));
});

export const updateTask = db.transaction((id, { title, completed, order }) => {
  if (title !== undefined) stmts.setTitle.run(title, id);
  if (completed !== undefined) stmts.setCompleted.run(completed ? 1 : 0, id);
  if (order !== undefined) moveTask(id, order);
  return getTask(id);
});

export const deleteTask = db.transaction((id) => {
  const { changes } = stmts.remove.run(id);
  if (changes) stmts.all.all().forEach((t, i) => stmts.setOrder.run(i, t.id));
  return changes > 0;
});
