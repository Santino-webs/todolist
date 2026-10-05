import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';

export default function TaskInput({ onAdd }) {
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = title.trim();
    if (!value || submitting) return;
    setSubmitting(true);
    const ok = await onAdd(value);
    setSubmitting(false);
    if (ok) setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="group relative">
      {/* glow halo that intensifies on hover / focus */}
      <div className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink opacity-30 blur-md transition duration-500 group-hover:opacity-60 group-focus-within:opacity-90" />
      <div className="relative flex items-center gap-2 rounded-2xl bg-ink-900/95 p-2 shadow-2xl shadow-black/50 ring-1 ring-white/10">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder="¿Qué necesitas hacer hoy?"
          aria-label="Nueva tarea"
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none sm:text-lg"
        />
        <button
          type="submit"
          disabled={!title.trim() || submitting}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-violet px-4 py-3 font-semibold text-white shadow-lg shadow-neon-violet/30 transition duration-300 hover:-translate-y-0.5 hover:shadow-neon-violet/60 hover:brightness-110 active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 sm:px-5"
        >
          {submitting ? <Loader2 className="size-5 animate-spin" /> : <Plus className="size-5" strokeWidth={2.5} />}
          <span className="hidden sm:inline">Añadir</span>
        </button>
      </div>
    </form>
  );
}
