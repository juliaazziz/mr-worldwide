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
      <div className="header-inner">
        <div className="header-text">
          <p className="header-eyebrow">2025 reading challenge</p>
          <h1 className="header-title">
            Mr. <em>Worldwide</em>
          </h1>
          <p className="header-sub">
            One book from every country on earth
          </p>
        </div>

        <div className="header-progress">
          <div className="progress-numbers">
            <span className="progress-big">{read}</span>
            <span className="progress-denom">/ {TOTAL_COUNTRIES}</span>
            <span className="progress-pct">{pct.toFixed(1)}%</span>
          </div>
          <div className="progress-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="progress-fill"
              style={{ width: `${pct}%` }}
            />
            <div className="progress-glow" style={{ left: `${pct}%` }} />
          </div>
          <p className="progress-label">{TOTAL_COUNTRIES - read} countries to go</p>
        </div>
      </div>

      <div className="header-divider">
        <span className="divider-line" />
        <span className="divider-globe">🌍</span>
        <span className="divider-line" />
      </div>
    </header>
  )
}
