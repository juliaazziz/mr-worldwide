import { useMemo } from 'react'
import { BOOKS, TOTAL_COUNTRIES } from '../data/books.js'
import StatCard from './StatCard.jsx'
import BarChart from './BarChart.jsx'
import './StatsTab.css'

const REGION_COLORS = {
  Africa:   '#d4694a',
  Asia:     '#c9a84c',
  Europe:   '#5a9e72',
  Americas: '#4a7fa8',
  Oceania:  '#8a6bb5',
}

const REGION_TOTALS = {
  Africa: 54, Asia: 48, Europe: 44, Americas: 35, Oceania: 14,
}

function stars(n) {
  if (!n) return '—'
  return '★'.repeat(Math.floor(n)) + (n % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(n))
}

export default function StatsTab() {
  const stats = useMemo(() => {
    const read   = BOOKS.filter(b => b.read)
    const rated  = read.filter(b => b.rating != null)
    const avgRating = rated.length
      ? rated.reduce((s, b) => s + b.rating, 0) / rated.length
      : null
    const femalePct = read.length
      ? (read.filter(b => b.femaleAuthor).length / read.length) * 100
      : 0
    const langCounts = {}
    read.forEach(b => { langCounts[b.language || 'Unknown'] = (langCounts[b.language || 'Unknown'] || 0) + 1 })

    // Regions
    const regionRead = {}
    read.forEach(b => { regionRead[b.region] = (regionRead[b.region] || 0) + 1 })
    const regionRatings = {}
    rated.forEach(b => {
      if (!regionRatings[b.region]) regionRatings[b.region] = []
      regionRatings[b.region].push(b.rating)
    })

    // Genres
    const genreCounts = {}
    read.forEach(b => {
      b.genres.forEach(g => { genreCounts[g] = (genreCounts[g] || 0) + 1 })
    })

    // Timeline
    const byMonth = {}
    read.forEach(b => {
      if (!b.date) return
      const parts = b.date.split('/')
      if (parts.length < 2) return
      const month = parseInt(parts[1])
      const key = `${parts[2]}-${String(month).padStart(2,'0')}`
      byMonth[key] = (byMonth[key] || 0) + 1
    })

    // Ratings distribution
    const ratingBuckets = { '5★': 0, '4★': 0, '3★': 0, '2★': 0, '1★': 0 }
    rated.forEach(b => {
      const r = Math.round(b.rating)
      ratingBuckets[`${r}★`] = (ratingBuckets[`${r}★`] || 0) + 1
    })

    // Best + worst
    const sorted = [...rated].sort((a,b) => b.rating - a.rating)
    const best  = sorted[0]
    const worst = sorted[sorted.length - 1]

    return {
      read, rated, avgRating, femalePct, langCounts,
      regionRead, regionRatings, genreCounts, byMonth,
      ratingBuckets, best, worst,
      totalRead: read.length,
    }
  }, [])

  const regionBarData = Object.entries(REGION_COLORS).map(([r, color]) => ({
    label: r,
    value: stats.regionRead[r] || 0,
    max: REGION_TOTALS[r],
    color,
    pct: ((stats.regionRead[r] || 0) / REGION_TOTALS[r]) * 100,
  })).sort((a,b) => b.pct - a.pct)

  const ratingBarData = Object.entries(stats.ratingBuckets).reverse().map(([k, v]) => ({
    label: k,
    value: v,
    max: Math.max(...Object.values(stats.ratingBuckets), 1),
    color: 'var(--gold)',
  }))

  const genreBarData = Object.entries(stats.genreCounts)
    .sort((a,b) => b[1] - a[1]).slice(0, 10)
    .map(([k,v]) => ({ label: k, value: v, max: Object.values(stats.genreCounts)[0], color: 'var(--blue)' }))

  const regionRatingData = Object.entries(REGION_COLORS)
    .filter(([r]) => stats.regionRatings[r])
    .map(([r, color]) => {
      const arr = stats.regionRatings[r]
      return { label: r, value: arr.reduce((s,v)=>s+v,0)/arr.length, max: 5, color, decimal: true }
    }).sort((a,b) => b.value - a.value)

  const femaleCount = stats.read.filter(b => b.femaleAuthor).length
  const maleCount   = stats.totalRead - femaleCount

  return (
    <div className="stats-tab">

      {/* Top stat cards */}
      <div className="stat-cards">
        <StatCard
          value={stats.totalRead}
          label="books read"
          sub={`of ${TOTAL_COUNTRIES} countries`}
          accent="gold"
        />
        <StatCard
          value={stats.avgRating ? stats.avgRating.toFixed(2) : '—'}
          label="avg rating"
          sub={stats.avgRating ? stars(stats.avgRating) : 'no ratings yet'}
          accent="coral"
        />
        <StatCard
          value={`${stats.femalePct.toFixed(0)}%`}
          label="female authors"
          sub={`${femaleCount} of ${stats.totalRead} books`}
          accent="purple"
        />
        <StatCard
          value={stats.langCounts['Español'] || 0}
          label="in Spanish"
          sub={`${stats.langCounts['Inglés'] || 0} in English`}
          accent="green"
        />
      </div>

      {/* Best + worst */}
      {(stats.best || stats.worst) && (
        <div className="highlights-row">
          {stats.best && (
            <div className="highlight-card highlight-best">
              <div className="highlight-badge">★ favourite</div>
              <div className="highlight-country">{stats.best.country}</div>
              <div className="highlight-title">{stats.best.title}</div>
              <div className="highlight-author">by {stats.best.author}</div>
              <div className="highlight-rating">{stars(stats.best.rating)}</div>
            </div>
          )}
          {stats.worst && stats.worst !== stats.best && (
            <div className="highlight-card highlight-worst">
              <div className="highlight-badge">lowest rated</div>
              <div className="highlight-country">{stats.worst.country}</div>
              <div className="highlight-title">{stats.worst.title}</div>
              <div className="highlight-author">by {stats.worst.author}</div>
              <div className="highlight-rating">{stars(stats.worst.rating)}</div>
            </div>
          )}
        </div>
      )}

      {/* Charts grid */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Coverage by Region</h3>
          <p className="chart-sub">% of each region's countries read</p>
          <div className="region-bars">
            {regionBarData.map(r => (
              <div className="region-row" key={r.label}>
                <div className="region-label">
                  <span className="region-dot" style={{ background: r.color }} />
                  {r.label}
                </div>
                <div className="region-track">
                  <div
                    className="region-fill"
                    style={{ width: `${r.pct}%`, background: r.color }}
                  />
                </div>
                <div className="region-count">{r.value}<span className="region-total">/{REGION_TOTALS[r.label]}</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Ratings Breakdown</h3>
          <p className="chart-sub">distribution of your ratings</p>
          <BarChart data={ratingBarData} horizontal />
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Avg Rating by Region</h3>
          <p className="chart-sub">which regions rate highest</p>
          <BarChart data={regionRatingData} horizontal showValue decimal />
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Top Genres</h3>
          <p className="chart-sub">from books you've finished</p>
          <BarChart data={genreBarData} horizontal />
        </div>
      </div>

      {/* Author gender donut */}
      <div className="gender-section">
        <div className="chart-card gender-card">
          <h3 className="chart-title">Author Gender</h3>
          <p className="chart-sub">of books you've read</p>
          <div className="gender-vis">
            <div className="donut-wrap">
              <svg viewBox="0 0 120 120" className="donut-svg">
                <circle cx="60" cy="60" r="48" fill="none" stroke="var(--bg3)" strokeWidth="16" />
                <circle
                  cx="60" cy="60" r="48" fill="none"
                  stroke="var(--coral)"
                  strokeWidth="16"
                  strokeDasharray={`${(femaleCount / Math.max(stats.totalRead,1)) * 301.6} 301.6`}
                  strokeDashoffset="75.4"
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              </svg>
              <div className="donut-center">
                <span className="donut-pct">{stats.femalePct.toFixed(0)}%</span>
                <span className="donut-label">women</span>
              </div>
            </div>
            <div className="gender-legend">
              <div className="gender-item">
                <span className="gender-dot" style={{ background: 'var(--coral)' }} />
                <div>
                  <div className="gender-count">{femaleCount}</div>
                  <div className="gender-name">Female authors</div>
                </div>
              </div>
              <div className="gender-item">
                <span className="gender-dot" style={{ background: 'var(--blue)' }} />
                <div>
                  <div className="gender-count">{maleCount}</div>
                  <div className="gender-name">Male / unknown</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Language split */}
        <div className="chart-card">
          <h3 className="chart-title">Reading Language</h3>
          <p className="chart-sub">original vs translation</p>
          <div className="lang-bars">
            {Object.entries(stats.langCounts)
              .sort((a,b) => b[1]-a[1])
              .map(([lang, count]) => (
              <div className="lang-row" key={lang}>
                <div className="lang-name">{lang === 'Inglés' ? 'English' : lang === 'Español' ? 'Spanish' : lang}</div>
                <div className="lang-track">
                  <div
                    className="lang-fill"
                    style={{
                      width: `${(count/stats.totalRead)*100}%`,
                      background: lang === 'Español' ? 'var(--coral)' : 'var(--blue)'
                    }}
                  />
                </div>
                <div className="lang-count">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
