import { useMemo } from 'react'
import { BOOKS, TOTAL_COUNTRIES } from '../data/books.js'
import './Header.css'

export default function Header() {
  const { read, pct } = useMemo(() => {
    const read = BOOKS.filter(b => b.read).length
    return { read, pct: (read / TOTAL_COUNTRIES) * 100 }
  }, [])

  return (
    <header className="header">
      <div className="header-card">
        <div className="header-left">
          <div className="header-badge">2026 reading challenge</div>
          <h1 className="header-title">Mr. Worldwide</h1>
          <p className="header-sub">One book from every country on earth</p>
        </div>

        <div className="header-right">
          <div className="progress-label-row">
            <span className="progress-fraction">
              <span className="progress-big">{read}</span>
              <span className="progress-denom"> / {TOTAL_COUNTRIES}</span>
            </span>
            <span className="progress-pct">{pct.toFixed(1)}%</span>
          </div>
          <div className="progress-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="progress-caption">{TOTAL_COUNTRIES - read} countries remaining</p>
        </div>
      </div>
    </header>
  )
}
