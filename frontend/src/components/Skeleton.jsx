export default function Skeleton() {
  return (
    <ul className="space-y-3" aria-label="Cargando tareas">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="h-[60px] animate-shimmer rounded-2xl bg-[linear-gradient(90deg,rgb(255_255_255/0.03)_0%,rgb(139_92_246/0.12)_50%,rgb(255_255_255/0.03)_100%)] bg-[length:200%_100%]"
          style={{ animationDelay: `${i * 120}ms`, opacity: 1 - i * 0.25 }}
        />
      ))}
    </ul>
  );
}
