import { useState } from 'react';
import { useApp } from '../store.jsx';

/**
 * Sign in or create an account.
 * First launch: shown as the welcome screen with a skip link (`welcome`).
 * Later: opened from the Account tab with a back button (`onBack`).
 */
export default function AuthScreen({ welcome, initial = 'login', onBack }) {
  const { authenticate, continueAsGuest } = useApp();
  const [kind, setKind] = useState(initial);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const register = kind === 'register';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const r = await authenticate(kind, { email, password, name });
    setBusy(false);
    if (!r.ok) setError(r.error);
  };

  return (
    <div className={welcome ? 'auth welcome' : 'auth'}>
      {welcome ? (
        <header className="hero">
          <img src="/icons/icon.svg" alt="" width="72" height="72" />
          <h1>Slotline</h1>
          <p>Plan a start time for every mail and its projects.</p>
        </header>
      ) : (
        <button type="button" className="back" onClick={onBack}>&larr; Back</button>
      )}

      <div className="seg two" role="group" aria-label="Sign in or create account">
        <button type="button" className={!register ? 'on' : ''} onClick={() => setKind('login')}>Sign in</button>
        <button type="button" className={register ? 'on' : ''} onClick={() => setKind('register')}>Create account</button>
      </div>

      <form className="form" onSubmit={submit} noValidate>
        {register && (
          <div className="field">
            <label htmlFor="name">Name <span className="opt">(optional)</span></label>
            <input id="name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} />
          {register && <p className="hint">Use at least 8 characters.</p>}
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" className="btn primary big" disabled={busy}>
          {busy ? 'Please wait...' : register ? 'Create account' : 'Sign in'}
        </button>
      </form>

      {welcome && (
        <div className="skip">
          <button type="button" className="btn big ghost" onClick={continueAsGuest}>Continue without an account</button>
          <p className="hint">Your list stays on this device. You can sign in later from the Account tab.</p>
        </div>
      )}
    </div>
  );
}
