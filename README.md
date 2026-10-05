# Flow · To-Do List

Una lista de tareas con React + Vite + Tailwind en el frontend y Node.js + Express + SQLite (`better-sqlite3`) en el backend.

## Cómo ejecutarla

Necesitas Node.js 20 o superior. Abre dos terminales:

```bash
# Terminal 1: API en http://localhost:3001
cd backend
npm install
npm run dev
```

```bash
# Terminal 2: UI en http://localhost:5173
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173. El servidor de desarrollo de Vite redirige `/api/*` al backend, así que no hace falta configurar CORS ni variables de entorno.

## Estructura

```
backend/
  server.js     Rutas de Express y validación
  db.js         Esquema de SQLite y consultas (better-sqlite3)
  tasks.db      Se crea automáticamente la primera vez
frontend/
  src/App.jsx               Estado, sincronización y drag and drop (dnd-kit)
  src/api.js                Cliente REST
  src/components/           Tarjetas, input, progreso, toasts, skeleton
  src/index.css             Tema de Tailwind v4 y animaciones propias
```

## API

| Método | Ruta         | Body                                     | Respuesta                    |
| ------ | ------------ | ---------------------------------------- | ---------------------------- |
| GET    | `/tasks`     | –                                        | `Task[]` ordenado por `order` |
| POST   | `/tasks`     | `{ title }`                              | `201 Task`                   |
| PUT    | `/tasks/:id` | `{ title?, completed?, order? }`         | `{ task, tasks }`            |
| DELETE | `/tasks/:id` | –                                        | `204`                        |

Tabla `tasks`: `id`, `title`, `completed` (0/1), `order`.

Cuando envías `order` en el `PUT`, la tarea se mueve a esa posición (empezando en 0) y el resto de la lista se renumera dentro de una transacción, de modo que los órdenes siempre son contiguos. Por eso la respuesta incluye la lista completa (`tasks`).

## Sincronización

- Las acciones son optimistas: la UI se actualiza al instante y vuelve atrás si la API falla.
- La lista se vuelve a pedir cada 5 s (solo con la pestaña visible), al recuperar el foco y al reconectarse. Esta sincronización se pausa mientras arrastras una tarea o hay una petición en curso.

## Variables de entorno (opcionales)

| Variable       | Dónde    | Valor por defecto        |
| -------------- | -------- | ------------------------ |
| `PORT`         | backend  | `3001`                   |
| `DB_PATH`      | backend  | `backend/tasks.db`       |
| `API_TARGET`   | frontend | `http://localhost:3001`  |
| `VITE_API_URL` | frontend | `/api` (usa el proxy de Vite) |
