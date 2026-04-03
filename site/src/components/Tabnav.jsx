import './TabNav.css'

const TABS = [
  { id: 'stats', label: 'Stats',    icon: '◈' },
  { id: 'map',   label: 'Map',      icon: '◉' },
  { id: 'list',  label: 'All Books',icon: '≡' },
]

export default function TabNav({ active, onChange }) {
  return (
    <nav className="tabnav">
      <div className="tabnav-inner">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tabnav-btn ${active === t.id ? 'active' : ''}`}
            onClick={() => onChange(t.id)}
          >
            <span className="tabnav-icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
