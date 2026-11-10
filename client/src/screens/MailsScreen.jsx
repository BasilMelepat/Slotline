import { useMemo, useState } from 'react';
import MailCard from '../components/MailCard.jsx';
import { MailsSkeleton } from '../components/Loader.jsx';
import { useApp } from '../store.jsx';
import { useNow } from '../hooks.js';
import { activeCount, sortItems } from '../lib/time.js';

const SORTS = [
  ['active', 'Active'],
  ['time', 'Start time'],
  ['mail', 'Mail id'],
];

export default function MailsScreen({ onEdit, onAdd }) {
  const { items, toggleProject, deleteMail, sync } = useApp();
  const now = useNow();
  const [sort, setSort] = useState('active');

  const shown = useMemo(() => sortItems(items, sort), [items, sort]);
  const totalActive = items.reduce((n, it) => n + activeCount(it), 0);

  if (!items.length && sync === 'loading') return <MailsSkeleton />;

  if (!items.length) {
    return (
      <div className="empty">
        <div className="empty-art" aria-hidden="true" />
        <h2>No mails yet</h2>
        <p>Add a mail id with a start time and its projects. Tap a project later to mark it active.</p>
        <button type="button" className="btn primary big" onClick={onAdd}>Add your first mail</button>
      </div>
    );
  }

  return (
    <>
      <div className="toolbar">
        <div className="seg" role="group" aria-label="Order by">
          {SORTS.map(([id, label]) => (
            <button key={id} type="button" className={sort === id ? 'on' : ''} aria-pressed={sort === id} onClick={() => setSort(id)}>
              {label}
            </button>
          ))}
        </div>
        <p className="summary">
          {items.length} mail{items.length > 1 ? 's' : ''} · {totalActive} active project{totalActive === 1 ? '' : 's'}
        </p>
      </div>
      <ul className="list">
        {shown.map((it) => (
          <MailCard key={it.id} item={it} now={now} onEdit={onEdit} onToggle={toggleProject} onDelete={deleteMail} />
        ))}
      </ul>
      <p className="legend">
        <span><i className="lg later" />Over 1 hour</span>
        <span><i className="lg soon" />Within 1 hour</span>
        <span><i className="lg near" />Within 15 minutes</span>
        <span><i className="lg active" />Active</span>
      </p>
    </>
  );
}
