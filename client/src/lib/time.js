export const pad = (n) => String(n).padStart(2, '0');

/** "14:30" -> "2:30 PM" */
export function fmt12(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`;
}

/** The next moment the clock shows this start time. At 10:00 PM, "2:00" means 2:00 AM tomorrow. */
export function nextAt(start) {
  const [h, m] = start.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
  return d.getTime();
}

/**
 * Where a mail stands right now.
 * phase: later (over 1 hour), soon (within 1 hour), near (within 15 minutes), active
 * tone: same as phase, except an active mail with no active projects is "idle"
 */
export function status(item, now) {
  let text;
  let phase;
  if (item.activeNow) {
    text = 'Active now';
    phase = 'active';
  } else {
    const d = Math.ceil((item.at - now) / 1000);
    if (d <= 0) {
      text = 'Active';
      phase = 'active';
    } else {
      const h = Math.floor(d / 3600);
      const m = Math.floor((d % 3600) / 60);
      const s = d % 60;
      text = d < 3600 ? `in ${m}m ${pad(s)}s` : `in ${h}h ${pad(m)}m ${pad(s)}s`;
      phase = d <= 900 ? 'near' : d <= 3600 ? 'soon' : 'later';
    }
  }
  const idle = phase === 'active' && !item.projects.some((p) => p.active);
  return { text, phase, tone: idle ? 'idle' : phase };
}

export const activeCount = (item) => item.projects.filter((p) => p.active).length;

export function sortItems(items, key) {
  const out = items.slice();
  out.sort((a, b) => {
    if (key === 'mail') return a.mail.toLowerCase().localeCompare(b.mail.toLowerCase());
    const byTime = (a.activeNow ? 0 : a.at) - (b.activeNow ? 0 : b.at);
    if (key === 'active') return activeCount(b) - activeCount(a) || byTime;
    return byTime;
  });
  return out;
}

/** Stable colour for a project name. */
export function hue(name) {
  let h = 0;
  for (const c of name.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}
