const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  list: () => request('/tasks'),
  create: (title) => request('/tasks', { method: 'POST', body: JSON.stringify({ title }) }),
  update: (id, changes) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(changes) }),
  remove: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};
