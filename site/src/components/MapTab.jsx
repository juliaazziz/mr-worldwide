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

// Map GeoJSON country names → our CSV country names where they differ
const NAME_ALIASES = {
  'United States of America':                  'United States',
  'Russian Federation':                         'Russia',
  'South Korea':                                'Korea South',
  'North Korea':                                'Korea North',
  'Czechia':                                    'Czech Republic',
  'Democratic Republic of the Congo':           'Congo {Democratic Rep}',
  'Republic of Congo':                          'Congo',
  "Côte d'Ivoire":                              'Ivory Coast',
  'Bosnia and Herzegovina':                     'Bosnia Herzegovina',
  'North Macedonia':                            'Macedonia',
  'United Republic of Tanzania':                'Tanzania',
  "Lao People's Democratic Republic":           'Laos',
  'Syrian Arab Republic':                       'Syria',
  'Iran (Islamic Republic of)':                 'Iran',
  'Venezuela (Bolivarian Republic of)':         'Venezuela',
  'Bolivia (Plurinational State of)':           'Bolivia',
  'Republic of Moldova':                        'Moldova',
  'United Kingdom of Great Britain and Northern Ireland': 'United Kingdom',
  'Viet Nam':                                   'Vietnam',
  'Myanmar':                                    'Myanmar',
  'eSwatini':                                   'Swaziland',
  'Holy See':                                   'Vatican City',
  'Guinea-Bissau':                              'Guinea-Bissau',
  'Timor-Leste':                                'East Timor',
  'Korea, Democratic People\'s Republic of':   'Korea North',
  'Korea, Republic of':                         'Korea South',
  'Taiwan, Province of China':                  'Taiwan',
  'Palestine, State of':                        'Palestine',
  'Burkina Faso':                               'Burkina',
}

function ratingToColor(rating) {
  if (rating >= 4.5) return '#2d8a6e'
  if (rating >= 4.0) return '#43b08a'
  if (rating >= 3.5) return '#72c4a4'
  if (rating >= 3.0) return '#a8d9c4'
  if (rating >= 2.5) return '#f2c27a'
  if (rating >= 2.0) return '#e8916a'
  return '#d4594a'
}

function stars(n) {
  if (!n) return '—'
  return '★'.repeat(Math.floor(n)) + (n % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(n))
}

// Simple named GeoJSON — one reliable source
const GEOJSON_URL =
  'https://cdn.jsdelivr.net/gh/datasets/geo-countries/data/countries.geojson'

export default function MapTab() {
  const mapRef      = useRef(null)
  const leafletRef  = useRef(null)
  const layerRef    = useRef(null)
  const geojsonRef  = useRef(null)
  const [colorBy,  setColorBy]  = useState('rating')
  const [selected, setSelected] = useState(null)
  const [loading,  setLoading]  = useState(true)

  // Build lookup: lowercase name → book
  const bookByName = useMemo(() => {
    const map = {}
    BOOKS.forEach(b => { if (b.title) map[b.country.toLowerCase()] = b })
    return map
  }, [])

  function resolveBook(geoName) {
    if (!geoName) return null
    const alias = NAME_ALIASES[geoName]
    const key = (alias !== undefined ? alias : geoName).toLowerCase()
    return bookByName[key] || null
  }

  function styleFeature(feature, mode) {
    const book = resolveBook(feature.properties.ADMIN || feature.properties.name)
    if (!book) {
      return { fillColor: '#dedad4', fillOpacity: 0.25, color: '#fff', weight: 0.5 }
    }
    if (!book.read) {
      // Has a book lined up but not yet read
      return { fillColor: '#c8c4bc', fillOpacity: 0.45, color: '#fff', weight: 0.5 }
    }
    const color = mode === 'region'
      ? (REGION_COLORS[book.region] || '#aaa')
      : ratingToColor(book.rating)
    return { fillColor: color, fillOpacity: 0.82, color: '#fff', weight: 0.6 }
  }

  function buildLayer(L, geojson, mode) {
    if (layerRef.current) {
      layerRef.current.remove()
      layerRef.current = null
    }
    const layer = L.geoJSON(geojson, {
      style: f => styleFeature(f, mode),
      onEachFeature(feature, lyr) {
        const book = resolveBook(feature.properties.ADMIN || feature.properties.name)
        lyr.on({
          mouseover(e) {
            if (book?.read) {
              e.target.setStyle({ fillOpacity: 1, weight: 1.2 })
              e.target.bringToFront()
            }
          },
          mouseout(e) { e.target.setStyle(styleFeature(feature, mode)) },
          click()     { if (book) setSelected(book) },
        })
      },
    })
    layer.addTo(L.map ? L : leafletRef.current.map)
    return layer
  }

  useEffect(() => {
    if (leafletRef.current) return
    let cancelled = false

    Promise.all([
      import('leaflet'),
      fetch(GEOJSON_URL).then(r => r.json()),
    ]).then(([L, geojson]) => {
      if (cancelled) return

      const map = L.map(mapRef.current, {
        center: [20, 15],
        zoom: 2,
        zoomControl: true,
        scrollWheelZoom: true,
        minZoom: 1,
        maxZoom: 8,
        zoomSnap: 0.5,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      geojsonRef.current     = geojson
      leafletRef.current     = { map, L }

      // Build initial layer manually so we have map in scope
      if (layerRef.current) layerRef.current.remove()
      const layer = L.geoJSON(geojson, {
        style: f => styleFeature(f, 'rating'),
        onEachFeature(feature, lyr) {
          const book = resolveBook(feature.properties.ADMIN || feature.properties.name)
          lyr.on({
            mouseover(e) {
              if (book?.read) { e.target.setStyle({ fillOpacity: 1, weight: 1.2 }); e.target.bringToFront() }
            },
            mouseout(e) { e.target.setStyle(styleFeature(feature, 'rating')) },
            click()     { if (book) setSelected(book) },
          })
        },
      }).addTo(map)
      layerRef.current = layer
      setLoading(false)
    }).catch(err => {
      console.error('Map error', err)
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
      if (leafletRef.current) { leafletRef.current.map.remove(); leafletRef.current = null }
    }
  }, [])

  // Re-render layer when colorBy changes
  useEffect(() => {
    if (!leafletRef.current || !geojsonRef.current) return
    const { map, L } = leafletRef.current
    if (layerRef.current) layerRef.current.remove()
    const mode = colorBy
    const layer = L.geoJSON(geojsonRef.current, {
      style: f => styleFeature(f, mode),
      onEachFeature(feature, lyr) {
        const book = resolveBook(feature.properties.ADMIN || feature.properties.name)
        lyr.on({
          mouseover(e) {
            if (book?.read) { e.target.setStyle({ fillOpacity: 1, weight: 1.2 }); e.target.bringToFront() }
          },
          mouseout(e) { e.target.setStyle(styleFeature(feature, mode)) },
          click()     { if (book) setSelected(book) },
        })
      },
    }).addTo(map)
    layerRef.current = layer
  }, [colorBy])

  const readCount = useMemo(() => BOOKS.filter(b => b.read).length, [])

  return (
    <div className="map-tab">
      <div className="map-controls">
        <span className="map-count">{readCount} countries read</span>
        <div className="map-controls-right">
          <span className="control-label">colour by</span>
          <div className="toggle-group">
            <button className={`toggle-btn ${colorBy === 'rating' ? 'active' : ''}`} onClick={() => setColorBy('rating')}>rating</button>
            <button className={`toggle-btn ${colorBy === 'region' ? 'active' : ''}`} onClick={() => setColorBy('region')}>region</button>
          </div>
        </div>
      </div>

      <div className="map-wrap">
        {loading && <div className="map-loading"><span>Loading map…</span></div>}
        <div ref={mapRef} className="map-container" style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.4s' }} />

        {selected && (
          <div className="map-popup" onClick={() => setSelected(null)}>
            <div className="popup-card" onClick={e => e.stopPropagation()}>
              <button className="popup-close" onClick={() => setSelected(null)}>×</button>
              <div className="popup-region" style={{ color: REGION_COLORS[selected.region] }}>{selected.region}</div>
              <div className="popup-country">{selected.country}</div>
              <div className="popup-title">{selected.title}</div>
              <div className="popup-author">by {selected.author}</div>
              {selected.rating != null && (
                <div className="popup-stars" style={{ color: ratingToColor(selected.rating) }}>
                  {stars(selected.rating)}
                  <span className="popup-rating-num">{selected.rating}</span>
                </div>
              )}
              {selected.genres?.length > 0 && (
                <div className="popup-genres">
                  {selected.genres.slice(0, 3).map(g => <span className="genre-pill" key={g}>{g}</span>)}
                </div>
              )}
              {selected.date && <div className="popup-date">read {selected.date}</div>}
            </div>
          </div>
        )}
      </div>

      <div className="map-legend">
        {colorBy === 'rating' ? (
          <>
            <div className="legend-title">rating</div>
            {[
              { color: '#2d8a6e', label: '4.5 – 5 ★' },
              { color: '#43b08a', label: '4.0 – 4.5' },
              { color: '#72c4a4', label: '3.5 – 4.0' },
              { color: '#a8d9c4', label: '3.0 – 3.5' },
              { color: '#f2c27a', label: '2.5 – 3.0' },
              { color: '#e8916a', label: '2.0 – 2.5' },
              { color: '#d4594a', label: '< 2.0' },
              { color: '#c8c4bc', label: 'lined up' },
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
