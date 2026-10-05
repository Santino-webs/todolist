import { Sparkles } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="animate-pop-in rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-neon-violet/20 to-neon-cyan/10 ring-1 ring-white/10">
        <Sparkles className="size-7 text-neon-cyan" />
      </div>
      <p className="mt-4 font-display text-lg font-bold text-slate-200">Tu lista está vacía</p>
      <p className="mt-1 text-sm text-slate-500">Añade tu primera tarea y empieza a fluir.</p>
    </div>
  );
}
