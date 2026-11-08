/** The app icon as a loader: the ring draws itself, the hands run like time-lapse, the green dot pops and pings. */
export function ClockLoader({ size = 96 }) {
  return (
    <svg className="loader" width={size} height={size} viewBox="0 0 512 512" aria-hidden="true">
      <rect width="512" height="512" rx="112" className="ld-bg" />
      <circle className="ld-ring" cx="240" cy="276" r="140" pathLength="100" transform="rotate(-90 240 276)" />
      <g className="ld-hr"><path d="M240 276 L298 310" /></g>
      <g className="ld-min"><path d="M240 276 V176" /></g>
      <circle cx="240" cy="276" r="16" className="ld-hub" />
      <circle className="ld-ping" cx="378" cy="142" r="52" />
      <circle className="ld-dot" cx="378" cy="142" r="52" />
    </svg>
  );
}

/** Full screen splash shown once per visit. */
export function Splash({ leaving }) {
  return (
    <div className={`splash${leaving ? ' leave' : ''}`} role="status" aria-label="Loading Slotline">
      <ClockLoader size={112} />
      <h1>Slotline</h1>
      <p>Every mail, right on time.</p>
    </div>
  );
}

/** Placeholder cards while the cloud list loads. */
export function MailsSkeleton() {
  return (
    <div className="sk" role="status" aria-label="Loading your mails">
      <div className="sk-head">
        <ClockLoader size={40} />
        <span>Loading your mails</span>
      </div>
      {[0, 1, 2].map((i) => (
        <div className="sk-card" key={i} style={{ '--i': i }}>
          <i className="w40" />
          <i className="w70" />
          <i className="w55" />
        </div>
      ))}
    </div>
  );
}
