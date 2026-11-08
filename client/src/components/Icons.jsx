const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const MailsIcon = () => (
  <svg {...base}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 8 8 6 8-6" /></svg>
);
export const PlusIcon = () => (
  <svg {...base} strokeWidth={2.2}><path d="M12 5v14M5 12h14" /></svg>
);
export const UserIcon = () => (
  <svg {...base}><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" /></svg>
);
export const CloudIcon = () => (
  <svg {...base} width={14} height={14}><path d="M7 18a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 8.5 4.75 4.75 0 0 1 17.5 18Z" /></svg>
);
export const PhoneIcon = () => (
  <svg {...base} width={14} height={14}><rect x="7" y="3" width="10" height="18" rx="2.5" /><path d="M11 18h2" /></svg>
);
export const ClockIcon = () => (
  <svg {...base} width={18} height={18}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
);
