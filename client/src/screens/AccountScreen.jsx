import { CloudIcon, PhoneIcon } from '../components/Icons.jsx';
import { useApp } from '../store.jsx';
import { useInstall } from '../hooks.js';

export default function AccountScreen({ onSignIn }) {
  const { mode, user, items, sync, logout, refresh, say } = useApp();
  const { canInstall, installed, install } = useInstall();
  const cloud = mode === 'cloud';

  const exportJson = () => {
    try {
      const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'slotline-mails.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch {
      say('Could not export the list.');
    }
  };

  return (
    <div className="account">
      <section className="panel">
        <div className="where">
          <span className={`where-ic ${cloud ? 'cloud' : ''}`}>{cloud ? <CloudIcon /> : <PhoneIcon />}</span>
          <div>
            <h2>{cloud ? user?.name || user?.email : 'Saved on this device'}</h2>
            <p className="muted">
              {cloud
                ? `${user?.email}${sync === 'offline' ? ' · Offline, showing the last copy' : ''}`
                : 'No account. Your list stays in this browser and is not backed up.'}
            </p>
          </div>
        </div>
        {cloud ? (
          <div className="row-actions">
            <button type="button" className="btn" onClick={refresh}>{sync === 'loading' ? 'Syncing...' : 'Sync now'}</button>
            <button type="button" className="btn" onClick={logout}>Sign out</button>
          </div>
        ) : (
          <>
            <p className="hint">Sign in to save to the cloud and open your list on any device.</p>
            <div className="row-actions">
              <button type="button" className="btn primary" onClick={() => onSignIn('login')}>Sign in</button>
              <button type="button" className="btn" onClick={() => onSignIn('register')}>Create account</button>
            </div>
          </>
        )}
      </section>

      <section className="panel">
        <h3>Your data</h3>
        <p className="muted">{items.length} mail{items.length === 1 ? '' : 's'} {cloud ? 'in your account' : 'on this device'}.</p>
        <div className="row-actions">
          <button type="button" className="btn" onClick={exportJson} disabled={!items.length}>Export as JSON</button>
        </div>
      </section>

      <section className="panel">
        <h3>App</h3>
        {installed ? (
          <p className="muted">Slotline is installed on this device.</p>
        ) : canInstall ? (
          <div className="row-actions"><button type="button" className="btn primary" onClick={install}>Install Slotline</button></div>
        ) : (
          <p className="muted">To install, use your browser menu and choose Add to Home Screen.</p>
        )}
        <p className="about"><img src="/icons/icon.svg" alt="" width="22" height="22" /> Slotline 1.0</p>
      </section>
    </div>
  );
}
