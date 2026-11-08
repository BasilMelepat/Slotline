import { MailsIcon, PlusIcon, UserIcon } from './Icons.jsx';

const TABS = [
  { id: 'mails', label: 'Mails', Icon: MailsIcon },
  { id: 'add', label: 'Add', Icon: PlusIcon, primary: true },
  { id: 'account', label: 'Account', Icon: UserIcon },
];

export default function BottomNav({ tab, onTab, editing }) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {TABS.map(({ id, label, Icon, primary }) => (
        <button
          key={id}
          type="button"
          className={`nav-item${tab === id ? ' on' : ''}${primary ? ' primary' : ''}`}
          aria-current={tab === id ? 'page' : undefined}
          onClick={() => onTab(id)}
        >
          <span className="nav-ic"><Icon /></span>
          <span className="nav-lb">{id === 'add' && editing ? 'Edit' : label}</span>
        </button>
      ))}
    </nav>
  );
}
