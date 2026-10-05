import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { CloudOff, RefreshCw } from 'lucide-react';
import { api } from './api.js';
import Progress from './components/Progress.jsx';
import TaskInput from './components/TaskInput.jsx';
import SortableTask from './components/SortableTask.jsx';
import TaskCard from './components/TaskCard.jsx';
import Toasts from './components/Toasts.jsx';
import Skeleton from './components/Skeleton.jsx';
import EmptyState from './components/EmptyState.jsx';

const POLL_MS = 5000;
const EXIT_MS = 280;

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [removing, setRemoving] = useState(() => new Set());
  const [activeId, setActiveId] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Number of in-flight mutations; background sync pauses while > 0 or while dragging
  // so a poll response can't clobber an optimistic update.
  const pending = useRef(0);
  const dragging = useRef(false);

  const toast = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t.slice(-3), { id, message, type }]);
    setTimeout(() => setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x))), 2400);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2700);
  }, []);

  const mutate = useCallback(async (fn) => {
    pending.current += 1;
    try {
      return await fn();
    } finally {
      pending.current -= 1;
    }
  }, []);

  const sync = useCallback(async ({ silent = true } = {}) => {
    if (pending.current > 0 || dragging.current) return;
    try {
      const data = await api.list();
      if (pending.current > 0 || dragging.current) return;
      setTasks(data);
      setOffline(false);
    } catch {
      setOffline(true);
      if (!silent) toast('No se pudo conectar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Initial load + automatic background sync (interval, tab focus, reconnect).
  useEffect(() => {
    sync({ silent: false });
    const interval = setInterval(() => document.visibilityState === 'visible' && sync(), POLL_MS);
    const onFocus = () => sync();
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onFocus);
    };
  }, [sync]);

  const addTask = async (title) => {
    try {
      const task = await mutate(() => api.create(title));
      setTasks((t) => [...t, task]);
      toast('Tarea creada');
      return true;
    } catch (err) {
      toast(err.message || 'No se pudo crear la tarea', 'error');
      return false;
    }
  };

  const toggleTask = async (task) => {
    const completed = !task.completed;
    setTasks((t) => t.map((x) => (x.id === task.id ? { ...x, completed } : x)));
    try {
      await mutate(() => api.update(task.id, { completed }));
      toast(completed ? '¡Tarea completada! ✨' : 'Tarea marcada como pendiente', completed ? 'success' : 'info');
    } catch (err) {
      setTasks((t) => t.map((x) => (x.id === task.id ? { ...x, completed: task.completed } : x)));
      toast(err.message || 'No se pudo actualizar', 'error');
    }
  };

  const deleteTask = async (task) => {
    setRemoving((s) => new Set(s).add(task.id));
    const unmark = () =>
      setRemoving((s) => {
        const next = new Set(s);
        next.delete(task.id);
        return next;
      });
    try {
      // Run the request and the exit animation in parallel; remove once both finish.
      await mutate(() => Promise.all([api.remove(task.id), new Promise((r) => setTimeout(r, EXIT_MS))]));
      setTasks((t) => t.filter((x) => x.id !== task.id));
      toast('Tarea eliminada', 'info');
    } catch (err) {
      toast(err.message || 'No se pudo eliminar', 'error');
    } finally {
      unmark();
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragStart = ({ active }) => {
    dragging.current = true;
    setActiveId(active.id);
  };

  const onDragCancel = () => {
    dragging.current = false;
    setActiveId(null);
  };

  const onDragEnd = async ({ active, over }) => {
    dragging.current = false;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const previous = tasks;
    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    setTasks(arrayMove(tasks, oldIndex, newIndex));

    try {
      const { tasks: fresh } = await mutate(() => api.update(active.id, { order: newIndex }));
      setTasks(fresh);
      toast('Orden guardado', 'info');
    } catch (err) {
      setTasks(previous);
      toast(err.message || 'No se pudo guardar el orden', 'error');
    }
  };

  const done = tasks.filter((t) => t.completed).length;
  const activeTask = tasks.find((t) => t.id === activeId);

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-32 size-[520px] animate-float rounded-full bg-neon-violet/25 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 size-[460px] animate-float rounded-full bg-neon-blue/20 blur-[120px] [animation-delay:-5s]" />
        <div className="absolute -bottom-40 left-1/4 size-[420px] animate-float rounded-full bg-neon-pink/15 blur-[120px] [animation-delay:-9s]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.06)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      </div>

      <main className="mx-auto w-full max-w-2xl px-4 pt-14 pb-24 sm:pt-24">
        {/* Hero */}
        <header className="animate-pop-in text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur">
            <span className={`size-2 rounded-full ${offline ? 'bg-neon-pink' : 'bg-neon-cyan shadow-[0_0_8px_var(--color-neon-cyan)]'}`} />
            {offline ? 'Sin conexión' : 'Sincronizado'}
          </span>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] font-bold tracking-tight sm:text-7xl">
            Organiza tu día
            <br />
            <span className="text-gradient">con flow.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-slate-400 sm:text-lg">
            Crea, arrastra y completa. Todo se guarda al instante.
          </p>
        </header>

        <section className="mt-10 space-y-6 sm:mt-12">
          <TaskInput onAdd={addTask} />

          {!loading && <Progress done={done} total={tasks.length} />}

          {offline && (
            <div className="flex animate-pop-in items-center gap-3 rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-4 py-3 text-sm text-pink-200">
              <CloudOff className="size-5 shrink-0" />
              <span className="flex-1">No hay conexión con la API. ¿Está corriendo el backend?</span>
              <button
                onClick={() => sync({ silent: false })}
                className="rounded-lg p-1.5 transition hover:bg-white/10"
                aria-label="Reintentar"
              >
                <RefreshCw className="size-4" />
              </button>
            </div>
          )}

          {loading ? (
            <Skeleton />
          ) : tasks.length === 0 ? (
            <EmptyState />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragCancel={onDragCancel}
            >
              <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <ul className="space-y-3">
                  {tasks.map((task) => (
                    <SortableTask
                      key={task.id}
                      task={task}
                      removing={removing.has(task.id)}
                      onToggle={() => toggleTask(task)}
                      onDelete={() => deleteTask(task)}
                    />
                  ))}
                </ul>
              </SortableContext>
              <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
                {activeTask ? <TaskCard task={activeTask} overlay /> : null}
              </DragOverlay>
            </DndContext>
          )}

          {!loading && tasks.length > 1 && (
            <p className="text-center text-xs text-slate-500">Arrastra desde ⋮⋮ para reordenar</p>
          )}
        </section>
      </main>

      <Toasts toasts={toasts} />
    </div>
  );
}
