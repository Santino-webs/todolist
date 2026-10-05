import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard.jsx';

export default function SortableTask({ task, removing, onToggle, onDelete }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, disabled: removing });

  // The outer <li> carries dnd-kit's transform; the inner div owns the enter/exit
  // keyframes so the animations never fight over the same `transform` property.
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="relative list-none"
    >
      <div className={removing ? 'animate-pop-out overflow-hidden' : 'animate-pop-in'}>
        {isDragging ? (
          <div className="flex min-h-[60px] items-center justify-center rounded-2xl border-2 border-dashed border-neon-cyan/50 bg-neon-cyan/[0.06] shadow-[inset_0_0_24px_rgb(34_228_255/0.12)]">
            <span className="text-xs font-medium uppercase tracking-widest text-neon-cyan/70">Suelta aquí</span>
          </div>
        ) : (
          <TaskCard
            task={task}
            onToggle={onToggle}
            onDelete={onDelete}
            handleProps={{ ref: setActivatorNodeRef, ...attributes, ...listeners }}
          />
        )}
      </div>
    </li>
  );
}
