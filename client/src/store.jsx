import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './lib/api.js';

/*
  Two places to keep your list:
  - guest: this device only (localStorage). No account needed.
  - cloud: your account (MongoDB, through the API). A copy is kept on the device so the app opens offline.
*/

const K = {
  mode: 'slotline.mode',
  token: 'slotline.token',
  user: 'slotline.user',
  guest: 'slotline.guest.items',
  cloud: 'slotline.cloud.items',
};

const read = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v == null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked */
  }
};
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [mode, setMode] = useState(() => read(K.mode, null)); // null | 'guest' | 'cloud'
  const [token, setToken] = useState(() => read(K.token, null));
  const [user, setUser] = useState(() => read(K.user, null));
  const [guest, setGuest] = useState(() => read(K.guest, []));
  const [cloud, setCloud] = useState(() => read(K.cloud, []));
  const [sync, setSync] = useState('idle'); // idle | loading | offline | error
  const [toast, setToast] = useState(null);
  const [pendingUpload, setPendingUpload] = useState(false);

  useEffect(() => write(K.mode, mode), [mode]);
  useEffect(() => write(K.token, token), [token]);
  useEffect(() => write(K.user, user), [user]);
  useEffect(() => write(K.guest, guest), [guest]);
  useEffect(() => write(K.cloud, cloud), [cloud]);

  const items = mode === 'cloud' ? cloud : guest;
  const say = useCallback((text) => setToast({ id: Date.now(), text }), []);

  const signOutLocal = useCallback(() => {
    setToken(null);
    setUser(null);
    setCloud([]);
    setMode('guest');
    setSync('idle');
  }, []);

  const expire = useCallback(() => {
    signOutLocal();
    say('Your session expired. Sign in again to use cloud saving.');
  }, [signOutLocal, say]);

  /** Runs a cloud call and turns failures into { ok:false, error }. */
  const cloudCall = useCallback(
    async (fn) => {
      try {
        const data = await fn();
        setSync('idle');
        return { ok: true, data };
      } catch (e) {
        if (e.status === 401) expire();
        else if (e.status === 0) setSync('offline');
        return { ok: false, error: e.message };
      }
    },
    [expire]
  );

  const refresh = useCallback(async () => {
    if (mode !== 'cloud' || !token) return;
    setSync('loading');
    try {
      const data = await api('/mails', { token });
      setCloud(data.items);
      setSync('idle');
    } catch (e) {
      if (e.status === 401) expire();
      else setSync(e.status === 0 ? 'offline' : 'error');
    }
  }, [mode, token, expire]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const again = () => document.visibilityState !== 'hidden' && refresh();
    window.addEventListener('online', again);
    document.addEventListener('visibilitychange', again);
    return () => {
      window.removeEventListener('online', again);
      document.removeEventListener('visibilitychange', again);
    };
  }, [refresh]);

  /* ---------- mails ---------- */

  const saveMail = useCallback(
    async (data, id) => {
      const dup = items.some((x) => x.id !== id && x.mail.toLowerCase() === data.mail.toLowerCase());
      if (dup) return { ok: false, error: 'This mail id is already in your list. Tap it there to edit.' };
      if (mode === 'cloud') {
        const r = await cloudCall(() =>
          id ? api(`/mails/${id}`, { method: 'PUT', body: data, token }) : api('/mails', { method: 'POST', body: data, token })
        );
        if (!r.ok) return r;
        setCloud((l) => (id ? l.map((x) => (x.id === id ? r.data.item : x)) : [...l, r.data.item]));
        return { ok: true };
      }
      setGuest((l) => (id ? l.map((x) => (x.id === id ? { ...x, ...data } : x)) : [...l, { id: uid(), ...data }]));
      return { ok: true };
    },
    [items, mode, token, cloudCall]
  );

  const toggleProject = useCallback(
    async (item, name) => {
      const next = { ...item, projects: item.projects.map((p) => (p.name === name ? { ...p, active: !p.active } : p)) };
      const set = mode === 'cloud' ? setCloud : setGuest;
      set((l) => l.map((x) => (x.id === item.id ? next : x)));
      if (mode === 'cloud') {
        const r = await cloudCall(() => api(`/mails/${item.id}`, { method: 'PUT', body: next, token }));
        if (!r.ok) {
          set((l) => l.map((x) => (x.id === item.id ? item : x)));
          say(r.error);
        }
      }
    },
    [mode, token, cloudCall, say]
  );

  const deleteMail = useCallback(
    async (item) => {
      const set = mode === 'cloud' ? setCloud : setGuest;
      set((l) => l.filter((x) => x.id !== item.id));
      if (mode === 'cloud') {
        const r = await cloudCall(() => api(`/mails/${item.id}`, { method: 'DELETE', token }));
        if (!r.ok) {
          set((l) => [...l, item]);
          say(r.error);
        }
      }
    },
    [mode, token, cloudCall, say]
  );

  /* ---------- account ---------- */

  const authenticate = useCallback(
    async (kind, creds) => {
      try {
        const data = await api(`/auth/${kind}`, { method: 'POST', body: creds });
        setPendingUpload(guest.length > 0);
        setCloud([]);
        setToken(data.token);
        setUser(data.user);
        setMode('cloud');
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    },
    [guest.length]
  );

  const continueAsGuest = useCallback(() => setMode('guest'), []);

  const logout = useCallback(() => {
    signOutLocal();
    say('Signed out. Your device list is shown.');
  }, [signOutLocal, say]);

  const uploadGuest = useCallback(async () => {
    const r = await cloudCall(() => api('/mails/bulk', { method: 'POST', body: { items: guest }, token }));
    setPendingUpload(false);
    if (r.ok) {
      setCloud(r.data.items);
      setGuest([]);
      say(`Uploaded ${r.data.created} mail${r.data.created === 1 ? '' : 's'}${r.data.skipped ? `, skipped ${r.data.skipped} already in your account` : ''}.`);
    } else {
      say(r.error);
    }
  }, [guest, token, cloudCall, say]);

  const value = useMemo(
    () => ({
      mode, user, items, guestCount: guest.length, sync, toast, pendingUpload,
      saveMail, toggleProject, deleteMail, authenticate, continueAsGuest, logout, uploadGuest, refresh, say,
      dismissUpload: () => setPendingUpload(false),
      clearToast: () => setToast(null),
    }),
    [mode, user, items, guest.length, sync, toast, pendingUpload, saveMail, toggleProject, deleteMail, authenticate, continueAsGuest, logout, uploadGuest, refresh, say]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
