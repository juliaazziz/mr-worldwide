import { useState, useEffect } from 'react'
import Header from './components/Header.jsx'
import TabNav from './components/TabNav.jsx'
import StatsTab from './components/StatsTab.jsx'
import MapTab from './components/MapTab.jsx'
import ListTab from './components/ListTab.jsx'
import './App.css'

export default function App() {
  const [tab, setTab] = useState('stats')

  useEffect(() => {
    document.title = tab === 'stats'
      ? 'Mr. Worldwide — Stats'
      : tab === 'map'
      ? 'Mr. Worldwide — Map'
      : 'Mr. Worldwide — Books'
  }, [tab])

  return (
    <div className="app">
      <Header />
      <TabNav active={tab} onChange={setTab} />
      <main className="main-content">
        <div className={`tab-panel ${tab === 'stats' ? 'active' : ''}`}>
          <StatsTab />
        </div>
        <div className={`tab-panel ${tab === 'map' ? 'active' : ''}`}>
          {tab === 'map' && <MapTab />}
        </div>
        <div className={`tab-panel ${tab === 'list' ? 'active' : ''}`}>
          <ListTab />
        </div>
      </main>
      <footer className="site-footer">
        <span><a href="https://github.com/juliaazziz/mr-worldwide" target="_blank" rel="noopener">mr-worldwide</a> · 2026</span>
        <a href="https://www.goodreads.com/review/list/102139159-julia-azziz?shelf=mr-worldwide" target="_blank" rel="noopener">goodreads →</a>
      </footer>
    </div>
  )
}
