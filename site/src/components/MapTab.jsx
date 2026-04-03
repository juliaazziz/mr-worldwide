import { useMemo, useRef, useEffect, useState } from 'react'
import { BOOKS } from '../data/books.js'
import './MapTab.css'

const REGION_COLORS = {
  Africa:   '#d4694a',
  Asia:     '#c9a84c',
  Europe:   '#5a9e72',
  Americas: '#4a7fa8',
  Oceania:  '#8a6bb5',
}

function ratingColor(rating) {
  if (!rating) return '#4a7fa8'
  if (rating >= 4.5) return '#c9a84c'
  if (rating >= 3.5) return '#5a9e72'
  if (rating >= 2.5) return '#4a7fa8'
  return '#d4694a'
}

function stars(n) {
  if (!n) return '—'
  return '★'.repeat(Math.floor(n)) + (n % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(n))
}

export default function MapTab() {
  const mapRef    = useRef(null)
  const leafletRef = useRef(null)
  const [colorBy, setColorBy] = useState('rating')
  const [selected, setSelected] = useState(null)
  const markersRef = useRef([])

  const readBooks = useMemo(() => BOOKS.filter(b => b.read && b.lat != null), [])

  useEffect(() => {
    if (leafletRef.current) return
    import('leaflet').then(L => {
      const map = L.map(mapRef.current, {
        center: [20, 10],
        zoom: 2,
        zoomControl: true,
        scrollWheelZoom: true,
        minZoom: 1,
        maxZoom: 10,
      })

      // Dark CartoDB tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      leafletRef.current = { map, L }
      renderMarkers(L, map, 'rating')
    })
    return () => {
      if (leafletRef.current) {
        leafletRef.current.map.remove()
        leafletRef.current = null
      }
    }
  }, [])

  function renderMarkers(L, map, mode) {
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    readBooks.forEach(book => {
      const color = mode === 'region'
        ? REGION_COLORS[book.region] || '#666'
        : ratingColor(book.rating)

      const size = book.rating >= 4.5 ? 14 : book.rating >= 3.5 ? 11 : 9

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:${color};
          border:2px solid rgba(255,255,255,0.25);
          box-shadow:0 0 ${size}px ${color}88, 0 2px 6px rgba(0,0,0,0.5);
          cursor:pointer;
          transition:transform 0.15s;
        " class="map-pin"></div>`,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2],
      })

      const marker = L.marker([book.lat, book.lng], { icon })
        .addTo(map)
        .on('click', () => setSelected(book))

      markersRef.current.push(marker)
    })
  }

  useEffect(() => {
    if (!leafletRef.current) return
    const { L, map } = leafletRef.current
    renderMarkers(L, map, colorBy)
  }, [colorBy])

  return (
    <div className="map-tab">
      <div className="map-controls">
        <div className="map-controls-left">
          <span className="map-count">{readBooks.length} countries mapped</span>
        </div>
        <div className="map-controls-right">
          <span className="control-label">colour by</span>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${colorBy === 'rating' ? 'active' : ''}`}
              onClick={() => setColorBy('rating')}
            >rating</button>
            <button
              className={`toggle-btn ${colorBy === 'region' ? 'active' : ''}`}
              onClick={() => setColorBy('region')}
            >region</button>
          </div>
        </div>
      </div>

      <div className="map-wrap">
        <div ref={mapRef} className="map-container" />

        {selected && (
          <div className="map-popup" onClick={() => setSelected(null)}>
            <div className="popup-card" onClick={e => e.stopPropagation()}>
              <button className="popup-close" onClick={() => setSelected(null)}>×</button>
              <div className="popup-region" style={{ color: REGION_COLORS[selected.region] }}>
                {selected.region}
              </div>
              <div className="popup-country">{selected.country}</div>
              <div className="popup-title">{selected.title}</div>
              <div className="popup-author">by {selected.author}</div>
              {selected.rating && (
                <div className="popup-stars" style={{ color: ratingColor(selected.rating) }}>
                  {stars(selected.rating)}
                  <span className="popup-rating-num">{selected.rating}</span>
                </div>
              )}
              {selected.genres?.length > 0 && (
                <div className="popup-genres">
                  {selected.genres.slice(0,3).map(g => (
                    <span className="genre-pill" key={g}>{g}</span>
                  ))}
                </div>
              )}
              {selected.date && (
                <div className="popup-date">read {selected.date}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="map-legend">
        {colorBy === 'rating' ? (
          <>
            <div className="legend-title">rating</div>
            {[
              { color: '#c9a84c', label: '4.5 – 5★' },
              { color: '#5a9e72', label: '3.5 – 4★' },
              { color: '#4a7fa8', label: '2.5 – 3★' },
              { color: '#d4694a', label: '1 – 2★' },
            ].map(l => (
              <div className="legend-item" key={l.label}>
                <span className="legend-dot" style={{ background: l.color }} />
                <span>{l.label}</span>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="legend-title">region</div>
            {Object.entries(REGION_COLORS).map(([r, c]) => (
              <div className="legend-item" key={r}>
                <span className="legend-dot" style={{ background: c }} />
                <span>{r}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
