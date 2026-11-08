import { useEffect, useState } from 'react';
import BottomNav from './components/BottomNav.jsx';
import MailsScreen from './screens/MailsScreen.jsx';
import AddScreen from './screens/AddScreen.jsx';
import AccountScreen from './screens/AccountScreen.jsx';
import AuthScreen from './screens/AuthScreen.jsx';
import { CloudIcon, PhoneIcon } from './components/Icons.jsx';
import { Splash } from './components/Loader.jsx';
import { useApp } from './store.jsx';

function startTab() {
  const t = new URLSearchParams(window.location.search).get('tab');
  return t === 'add' || t === 'account' ? t : 'mails';
}

function Toast() {
  const { toast, clearToast } = useApp();
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(clearToast, 3500);
    return () => clearTimeout(t);
  }, [toast, clearToast]);
  if (!toast) return null;
  return <div className="toast" role="status" aria-live="polite">{toast.text}</div>;
}

function UploadPrompt() {
  const { pendingUpload, guestCount, uploadGuest, dismissUpload } = useApp();
  if (!pendingUpload) return null;
  return (
    <div className="backdrop">
      <div className="sheet" role="dialog" aria-label="Move your list to the cloud">
        <h2>Move your list to the cloud?</h2>
        <p className="muted">
          You have {guestCount} mail{guestCount === 1 ? '' : 's'} saved on this device. Upload them to your account so they appear on every device.
        </p>
        <div className="sheet-foot stack">
          <button type="button" className="btn primary big" onClick={uploadGuest}>Upload to my account</button>
          <button type="button" className="btn big" onClick={dismissUpload}>Not now, keep them on this device</button>
        </div>
      </div>
    </div>
  );
}

const SPLASH_KEY = 'slotline.splash';
const splashSeen = () => {
  try {
    return sessionStorage.getItem(SPLASH_KEY) === '1';
  } catch {
    return false;
  }
};

/** Shows the splash once per visit, then fades it out. */
function useSplash() {
  const [phase, setPhase] = useState(() => (splashSeen() ? 'gone' : 'show'));
  useEffect(() => {
    if (phase === 'gone') return undefined;
    const leave = setTimeout(() => setPhase('leave'), 1500);
    const done = setTimeout(() => {
      setPhase('gone');
      try {
        sessionStorage.setItem(SPLASH_KEY, '1');
      } catch {
        /* private mode */
      }
    }, 1900);
    return () => {
      clearTimeout(leave);
      clearTimeout(done);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return phase === 'gone' ? null : <Splash leaving={phase === 'leave'} />;
}

export default function App() {
  const { mode, sync } = useApp();
  const splash = useSplash();
  const [tab, setTab] = useState(startTab);
  const [editing, setEditing] = useState(null);
  const [auth, setAuth] = useState(null); // null | 'login' | 'register' while signing in from the Account tab

  // Leaving the auth form once the account is active
  useEffect(() => {
    if (mode === 'cloud') setAuth(null);
  }, [mode]);

  if (mode === null) {
    return (
      <div className="app">
        <main className="screen"><AuthScreen welcome /></main>
        <Toast />
        {splash}
      </div>
    );
  }

  const go = (next) => {
    setEditing(null);
    setAuth(null);
    setTab(next);
  };
  const edit = (item) => {
    setEditing(item);
    setTab('add');
  };

  const title = auth ? (auth === 'register' ? 'Create account' : 'Sign in') : { mails: 'Mails', add: editing ? 'Edit mail' : 'Add mail', account: 'Account' }[tab];
  const cloud = mode === 'cloud';
  const badge = sync === 'offline' ? 'Offline' : sync === 'loading' ? 'Syncing' : cloud ? 'Cloud' : 'This device';

  return (
    <div className="app">
      <header className="topbar">
        <img src="/icons/icon.svg" alt="" width="28" height="28" />
        <div className="titles">
          <span className="app-name">Slotline</span>
          <h1>{title}</h1>
        </div>
        <span className={`badge ${sync === 'offline' ? 'warn' : ''}`}>
          {cloud ? <CloudIcon /> : <PhoneIcon />} {badge}
        </span>
      </header>

      <main className="screen">
        {auth ? (
          <AuthScreen initial={auth} onBack={() => setAuth(null)} />
        ) : tab === 'mails' ? (
          <MailsScreen onEdit={edit} onAdd={() => go('add')} />
        ) : tab === 'add' ? (
          <AddScreen key={editing?.id || 'new'} item={editing} onDone={() => go('mails')} onCancel={() => go('mails')} />
        ) : (
          <AccountScreen onSignIn={setAuth} />
        )}
      </main>

      <BottomNav tab={tab} onTab={go} editing={!!editing} />
      <UploadPrompt />
      <Toast />
      {splash}
    </div>
  );
}
