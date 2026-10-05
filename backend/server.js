import express from 'express';
import cors from 'cors';
import { getAllTasks, getTask, createTask, updateTask, deleteTask } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const parseId = (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid id' });
    return null;
  }
  return id;
};

app.get('/tasks', (_req, res) => {
  res.json(getAllTasks());
});

app.post('/tasks', (req, res) => {
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  if (!title) return res.status(400).json({ error: 'Title is required' });
  if (title.length > 200) return res.status(400).json({ error: 'Title is too long (max 200)' });
  res.status(201).json(createTask(title));
});

app.put('/tasks/:id', (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;
  if (!getTask(id)) return res.status(404).json({ error: 'Task not found' });

  const { title, completed, order } = req.body ?? {};
  const changes = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title must be a non-empty string' });
    }
    changes.title = title.trim();
  }
  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed must be a boolean' });
    }
    changes.completed = completed;
  }
  if (order !== undefined) {
    if (!Number.isInteger(order) || order < 0) {
      return res.status(400).json({ error: 'Order must be a non-negative integer' });
    }
    changes.order = order;
  }

  updateTask(id, changes);
  // Reordering shifts sibling tasks, so return the full list alongside the updated task.
  res.json({ task: getTask(id), tasks: getAllTasks() });
});

app.delete('/tasks/:id', (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;
  if (!deleteTask(id)) return res.status(404).json({ error: 'Task not found' });
  res.status(204).end();
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ API listening on http://localhost:${PORT}`);
});
