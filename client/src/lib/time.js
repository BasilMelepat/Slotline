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

/** "10 Nov, 3:30 PM" - always with the date. */
export function fmtClock(ms) {
  const d = new Date(ms);
  const t = `${d.getHours() % 12 || 12}:${pad(d.getMinutes())} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
  return `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}, ${t}`;
}

/** "just now", "25m", "2h 05m", "1d 3h" */
export function elapsed(ms) {
  const m = Math.floor(Math.max(0, ms) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${pad(m % 60)}m`;
  return `${Math.floor(h / 24)}d ${h % 24}h`;
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
  // When it became active: the end of the countdown, or the moment "Active now" was saved
  const since = phase !== 'active' ? 0 : item.activeNow ? item.activeSince || 0 : item.at;
  return { text, phase, tone: idle ? 'idle' : phase, since };
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

// Project pill colours: reds, oranges, blues, purples and pinks. No greens, so a pill never
// looks like the green "active" signal on a card.
const PILL_HUES = [4, 22, 38, 195, 210, 225, 245, 265, 285, 305, 325, 345];

/** Stable colour for a project name. */
export function hue(name) {
  let h = 0;
  for (const c of name.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) % 9973;
  return PILL_HUES[h % PILL_HUES.length];
}
