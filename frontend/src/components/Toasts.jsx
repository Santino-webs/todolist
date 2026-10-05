import { CheckCircle2, Info, XCircle } from 'lucide-react';

const STYLES = {
  success: { icon: CheckCircle2, accent: 'text-neon-cyan', bar: 'from-neon-cyan to-neon-violet' },
  info: { icon: Info, accent: 'text-neon-violet', bar: 'from-neon-violet to-neon-blue' },
  error: { icon: XCircle, accent: 'text-neon-pink', bar: 'from-neon-pink to-orange-400' },
};

export default function Toasts({ toasts }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
    >
      {toasts.map((t) => {
        const { icon: Icon, accent, bar } = STYLES[t.type] ?? STYLES.info;
        return (
          <div
            key={t.id}
            className={`gradient-border pointer-events-auto relative flex w-full max-w-sm items-center gap-3 overflow-hidden rounded-xl bg-ink-800/90 px-4 py-3 shadow-2xl shadow-black/60 backdrop-blur-xl ${
              t.leaving ? 'animate-toast-out' : 'animate-toast-in'
            }`}
          >
            <span className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${bar}`} />
            <Icon className={`size-5 shrink-0 ${accent}`} />
            <p className="text-sm text-slate-200">{t.message}</p>
          </div>
        );
      })}
    </div>
  );
}
