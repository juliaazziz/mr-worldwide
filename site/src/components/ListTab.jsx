import { useState, useMemo } from 'react'
import { BOOKS } from '../data/books.js'
import './ListTab.css'

const REGION_COLORS = {
  Africa:   '#d4694a',
  Asia:     '#c9a84c',
  Europe:   '#5a9e72',
  Americas: '#4a7fa8',
  Oceania:  '#8a6bb5',
}

function stars(n) {
  if (!n) return null
  return '★'.repeat(Math.floor(n)) + (n % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(n))
}

export default function ListTab() {
  const [query,  setQuery]  = useState('')
  const [region, setRegion] = useState('')
  const [filter, setFilter] = useState('all') // all | read | unread
  const [sort,   setSort]   = useState('country')

  const filtered = useMemo(() => {
    let list = BOOKS.filter(b => b.title) // only countries with a book

    if (query) {
      const q = query.toLowerCase()
      list = list.filter(b =>
        b.country.toLowerCase().includes(q) ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q)
      )
    }
    if (region) list = list.filter(b => b.region === region)
    if (filter === 'read')   list = list.filter(b => b.read)
    if (filter === 'unread') list = list.filter(b => !b.read)

    list = [...list].sort((a, b) => {
      if (sort === 'country') return a.country.localeCompare(b.country)
      if (sort === 'rating')  return (b.rating || 0) - (a.rating || 0)
      if (sort === 'title')   return a.title.localeCompare(b.title)
      if (sort === 'date') {
        if (!a.date && !b.date) return 0
        if (!a.date) return 1
        if (!b.date) return -1
        const parseDate = d => {
          const [day, mon, yr] = d.split('/')
          return new Date(yr, mon-1, day)
        }
        return parseDate(b.date) - parseDate(a.date)
      }
      return 0
    })

    return list
  }, [query, region, filter, sort])

  const readCount   = BOOKS.filter(b => b.read).length
  const titledCount = BOOKS.filter(b => b.title).length

  return (
    <div className="list-tab">
      <div className="list-header">
        <div className="list-counts">
          <span className="count-read">{readCount} read</span>
          <span className="count-sep">·</span>
          <span className="count-lined">{titledCount - readCount} lined up</span>
          <span className="count-sep">·</span>
          <span className="count-total">{195 - titledCount} TBD</span>
        </div>
      </div>

      <div className="list-controls">
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, author, country…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className="search-clear" onClick={() => setQuery('')}>×</button>
          )}
        </div>

        <div className="controls-row">
          <div className="filter-pills">
            {['all', 'read', 'unread'].map(f => (
              <button
                key={f}
                className={`pill ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'read' ? '✓ Read' : '○ To read'}
              </button>
            ))}
          </div>

          <select
            className="select-control"
            value={region}
            onChange={e => setRegion(e.target.value)}
          >
            <option value="">All regions</option>
            {['Africa','Asia','Europe','Americas','Oceania'].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <select
            className="select-control"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option value="country">A–Z Country</option>
            <option value="title">A–Z Title</option>
            <option value="rating">Rating ↓</option>
            <option value="date">Date read ↓</option>
          </select>
        </div>
      </div>

      <div className="results-count">
        {filtered.length} {filtered.length === 1 ? 'book' : 'books'}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-globe">🌐</div>
          <p>No books found</p>
        </div>
      ) : (
        <div className="books-grid">
          {filtered.map((book, i) => (
            <BookCard key={book.country} book={book} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

function BookCard({ book, index }) {
  const regionColor = REGION_COLORS[book.region] || '#666'
  const s = stars(book.rating)

  return (
    <div
      className={`book-card ${book.read ? 'read' : 'unread'}`}
      style={{ animationDelay: `${Math.min(index, 20) * 30}ms` }}
    >
      <div className="card-top">
        <div className="card-region" style={{ color: regionColor }}>
          <span className="region-dot-sm" style={{ background: regionColor }} />
          {book.region}
        </div>
        {book.read && <div className="card-read-badge">read</div>}
      </div>

      <div className="card-country">{book.country}</div>
      <div className="card-title">{book.title}</div>
      <div className="card-author">by {book.author}</div>

      {book.genres?.length > 0 && (
        <div className="card-genres">
          {book.genres.slice(0, 2).map(g => (
            <span className="genre-tag" key={g}>{g}</span>
          ))}
        </div>
      )}

      <div className="card-footer">
        {s ? (
          <div className="card-stars" style={{ color: book.rating >= 4 ? '#c9a84c' : book.rating <= 2 ? '#d4694a' : '#5a9e72' }}>
            {s}
            <span className="card-rating-num">{book.rating}</span>
          </div>
        ) : (
          <div className="card-no-rating">{book.read ? 'not rated' : book.language || ''}</div>
        )}
        {book.date && <div className="card-date">{book.date}</div>}
      </div>
    </div>
  )
}
