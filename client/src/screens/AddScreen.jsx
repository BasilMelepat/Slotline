import { useState } from 'react';
import ProjectChip from '../components/ProjectChip.jsx';
import ClockSheet from '../components/ClockSheet.jsx';
import { ClockIcon } from '../components/Icons.jsx';
import { useApp } from '../store.jsx';
import { fmt12, nextAt } from '../lib/time.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Add a mail, or edit one when `item` is given. */
export default function AddScreen({ item, onDone, onCancel }) {
  const { saveMail, say } = useApp();
  const [mail, setMail] = useState(item?.mail || '');
  const [start, setStart] = useState(item ? item.start : '');
  const [activeNow, setActiveNow] = useState(!!item?.activeNow);
  const [projects, setProjects] = useState(() => (item ? item.projects.map((p) => ({ ...p })) : []));
  const [draft, setDraft] = useState('');
  const [note, setNote] = useState(item?.note || '');
  const [clock, setClock] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const addProjects = () => {
    const names = draft.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    if (!names.length) return projects;
    const next = [...projects];
    names.forEach((name) => {
      if (!next.some((p) => p.name.toLowerCase() === name.toLowerCase())) next.push({ name, active: false });
    });
    setProjects(next);
    setDraft('');
    return next;
  };

  const submit = async (e) => {
    e.preventDefault();
    const list = addProjects();
    const id = mail.trim();
    if (!EMAIL_RE.test(id)) return setError('Enter a full mail id, like name@company.com.');
    if (!activeNow && !start) return setError('Pick a start time, or turn on Active now.');
    if (!list.length) return setError('Add at least one project.');
    setError('');

    const data = {
      mail: id,
      start: activeNow ? '' : start,
      activeNow,
      at: activeNow ? 0 : item && item.start === start && item.at ? item.at : nextAt(start),
      note: note.trim(),
      projects: list,
    };
    setSaving(true);
    const r = await saveMail(data, item?.id);
    setSaving(false);
    if (!r.ok) return setError(r.error);
    if (item) {
      onDone();
    } else {
      say(`Added ${id}${activeNow ? ' as active now' : ` at ${fmt12(start)}`}.`);
      setMail('');
      setStart('');
      setActiveNow(false);
      setProjects([]);
      setNote('');
    }
  };

  return (
    <form className="form" onSubmit={submit} noValidate autoComplete="off">
      <div className="field">
        <label htmlFor="mail">Mail id</label>
        <input id="mail" type="email" inputMode="email" autoCapitalize="none" placeholder="name@company.com" value={mail} onChange={(e) => setMail(e.target.value)} />
      </div>

      <div className="field">
        <span className="lbl" id="start-lbl">Start time</span>
        <button
          type="button"
          className="input-btn"
          aria-labelledby="start-lbl"
          aria-haspopup="dialog"
          disabled={activeNow}
          onClick={() => setClock(true)}
        >
          <ClockIcon />
          <span className={start ? '' : 'ph'}>{activeNow ? 'Not needed' : start ? fmt12(start) : 'Tap to pick a time'}</span>
        </button>
        <label className="switch">
          <input type="checkbox" checked={activeNow} onChange={(e) => setActiveNow(e.target.checked)} />
          <span className="track" aria-hidden="true" />
          <span>Active now. No start time needed.</span>
        </label>
      </div>

      <div className="field">
        <label htmlFor="project">Projects</label>
        <div className="inline">
          <input
            id="project"
            type="text"
            placeholder="Project name, or several with commas"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addProjects();
              }
            }}
          />
          <button type="button" className="btn" onClick={addProjects}>Add</button>
        </div>
        <div className="chips">
          {projects.length === 0 && <span className="muted">No projects added yet.</span>}
          {projects.map((p, i) => (
            <ProjectChip
              key={p.name}
              project={p}
              onToggle={() => setProjects((l) => l.map((x, j) => (j === i ? { ...x, active: !x.active } : x)))}
              onRemove={() => setProjects((l) => l.filter((_, j) => j !== i))}
            />
          ))}
        </div>
        <p className="hint">Tap a project to mark it active. Projects start inactive.</p>
      </div>

      <div className="field">
        <label htmlFor="note">Note <span className="opt">(optional)</span></label>
        <textarea id="note" rows={3} maxLength={500} placeholder="Anything to remember about this mail" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      <div className="actions">
        <button type="submit" className="btn primary big" disabled={saving}>
          {saving ? 'Saving...' : item ? 'Save changes' : 'Add mail'}
        </button>
        {item && <button type="button" className="btn big" onClick={onCancel}>Cancel</button>}
      </div>

      {clock && (
        <ClockSheet
          value={start}
          onClose={() => setClock(false)}
          onSet={(t) => {
            setStart(t);
            setClock(false);
          }}
        />
      )}
    </form>
  );
}
