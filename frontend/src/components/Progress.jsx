export default function Progress({ done, total }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done === total;

  return (
    <div className="gradient-border rounded-2xl bg-white/[0.03] p-5 backdrop-blur-xl">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Progreso</p>
          <p className="mt-1 font-display text-2xl font-bold">
            <span className="text-gradient">{done}</span>
            <span className="text-slate-400"> de {total}</span>
            <span className="ml-2 text-base font-medium text-slate-400">tareas completadas</span>
          </p>
        </div>
        <span
          className={`font-display text-3xl font-bold tabular-nums transition-colors duration-500 ${
            allDone ? 'text-neon-cyan drop-shadow-[0_0_12px_rgb(34_228_255/0.7)]' : 'text-slate-200'
          }`}
        >
          {pct}%
        </span>
      </div>
      <div
        className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/5"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Tareas completadas"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink shadow-[0_0_16px_rgb(139_92_246/0.8)] transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {allDone && (
        <p className="mt-3 animate-pop-in text-sm text-neon-cyan">🎉 ¡Todo listo! Lista despejada.</p>
      )}
    </div>
  );
}
