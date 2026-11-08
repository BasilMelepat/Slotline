import { hue } from '../lib/time.js';

/** Filled chip = active project, outlined chip = inactive. Tap the chip to switch. */
export default function ProjectChip({ project, onToggle, onRemove }) {
  return (
    <span className={`chip${project.active ? ' on' : ''}`} style={{ '--h': hue(project.name) }}>
      <button
        type="button"
        className="chip-main"
        aria-pressed={project.active}
        title={project.active ? 'Active. Tap to make inactive.' : 'Inactive. Tap to make active.'}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        <span className="dot" />
        {project.name}
      </button>
      {onRemove && (
        <button type="button" className="chip-x" aria-label={`Remove ${project.name}`} onClick={onRemove}>
          ×
        </button>
      )}
    </span>
  );
}
