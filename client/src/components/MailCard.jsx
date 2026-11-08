import { useEffect, useRef, useState } from 'react';
import ProjectChip from './ProjectChip.jsx';
import { activeCount, fmt12, status } from '../lib/time.js';

export default function MailCard({ item, now, onEdit, onToggle, onDelete }) {
  const s = status(item, now);
  const [armed, setArmed] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const showTime = s.phase !== 'active';
  const projects = [...item.projects].sort((a, b) => Number(b.active) - Number(a.active));

  const del = (e) => {
    e.stopPropagation();
    if (armed) {
      clearTimeout(timer.current);
      onDelete(item);
    } else {
      setArmed(true);
      timer.current = setTimeout(() => setArmed(false), 3000);
    }
  };

  return (
    <li
      className={`card tone-${s.tone}`}
      tabIndex={0}
      role="button"
      aria-label={`Edit ${item.mail}`}
      onClick={() => onEdit(item)}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onEdit(item);
        }
      }}
    >
      <div className="card-top">
        <span className="cd">{s.text}</span>
        {showTime && <span className="time">{fmt12(item.start)}</span>}
        <button type="button" className={`del${armed ? ' armed' : ''}`} onClick={del} aria-label={`Delete ${item.mail}`}>
          {armed ? 'Sure?' : '❌'}
        </button>
      </div>
      <div className="mail">{item.mail}</div>
      <div className="chips">
        {projects.length === 0 && <span className="muted">No projects</span>}
        {projects.map((p) => (
          <ProjectChip key={p.name} project={p} onToggle={() => onToggle(item, p.name)} />
        ))}
        {projects.length > 0 && (
          <span className="cnt">
            {activeCount(item)} of {projects.length} active
          </span>
        )}
      </div>
      {item.note && <p className="note">{item.note}</p>}
    </li>
  );
}
