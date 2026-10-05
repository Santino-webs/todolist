import { Check, GripVertical, Trash2 } from 'lucide-react';

/**
 * Pure visual card. Used both inside the sortable list and in the drag overlay.
 */
export default function TaskCard({ task, onToggle, onDelete, handleProps, overlay = false }) {
  const { title, completed } = task;

  return (
    <div
      className={`gradient-border group relative flex items-center gap-3 rounded-2xl px-3 py-3.5 backdrop-blur-xl transition-all duration-300 sm:px-4 ${
        overlay
          ? 'scale-[1.03] rotate-1 bg-ink-800/95 shadow-[0_20px_60px_-10px_rgb(139_92_246/0.6)] ring-2 ring-neon-cyan/60'
          : completed
            ? 'bg-white/[0.02] hover:bg-white/[0.04]'
            : 'bg-gradient-to-br from-white/[0.07] to-white/[0.02] hover:-translate-y-0.5 hover:from-neon-violet/[0.12] hover:to-neon-cyan/[0.05] hover:shadow-[0_12px_40px_-12px_rgb(139_92_246/0.55)]'
      }`}
    >
      <button
        type="button"
        {...handleProps}
        aria-label="Arrastrar para reordenar"
        className={`touch-none rounded-lg p-1 text-slate-500 transition hover:bg-white/5 hover:text-neon-cyan focus-visible:outline-2 focus-visible:outline-neon-cyan ${
          overlay ? 'cursor-grabbing text-neon-cyan' : 'cursor-grab'
        }`}
      >
        <GripVertical className="size-5" />
      </button>

      <button
        type="button"
        onClick={onToggle}
        aria-pressed={completed}
        aria-label={completed ? 'Marcar como pendiente' : 'Marcar como completada'}
        className={`grid size-7 shrink-0 place-items-center rounded-full border-2 transition-all duration-300 ${
          completed
            ? 'border-transparent bg-gradient-to-br from-neon-cyan to-neon-violet shadow-[0_0_14px_rgb(34_228_255/0.6)]'
            : 'border-slate-500 hover:scale-110 hover:border-neon-cyan hover:shadow-[0_0_12px_rgb(34_228_255/0.5)]'
        }`}
      >
        {completed && <Check className="size-4 animate-check text-ink-950" strokeWidth={3.5} />}
      </button>

      <span
        className={`min-w-0 flex-1 break-words text-[15px] leading-snug transition-all duration-300 sm:text-base ${
          completed ? 'text-slate-500 line-through decoration-neon-pink/70 decoration-2' : 'text-slate-100'
        }`}
      >
        {title}
      </span>

      <button
        type="button"
        onClick={onDelete}
        aria-label="Eliminar tarea"
        className="rounded-lg p-2 text-slate-500 transition duration-300 hover:scale-110 hover:bg-neon-pink/10 hover:text-neon-pink sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
      >
        <Trash2 className="size-[18px]" />
      </button>
    </div>
  );
}
