import { useState } from 'react'
import SearchBar from './components/SearchBar.jsx'
import EmptyState from './components/EmptyState.jsx'
import Report from './components/Report.jsx'
import LoadingState from './components/LoadingState.jsx'

const styles = {
  app: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 980,
    margin: '0 auto',
    padding: '3rem 2rem',
  },
  header: { marginBottom: '2.5rem' },
  eyebrow: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    letterSpacing: '0.15em',
    color: 'var(--accent)',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  h1: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 400,
    lineHeight: 1.1,
    color: 'var(--text)',
    marginBottom: 10,
  },
  em: { fontStyle: 'italic', color: 'var(--accent)' },
  sub: {
    fontSize: 14,
    color: 'var(--muted)',
    lineHeight: 1.7,
    maxWidth: 420,
  },
}

export default function App() {
  const [state, setState] = useState('idle') // idle | loading | done | error
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loadingMsg, setLoadingMsg] = useState('')

  async function analyze(ticker) {
    setState('loading')
    setLoadingMsg(`Fetching data for ${ticker}...`)
    try {
      const res = await fetch(`/api/analyze/${ticker}`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Unknown error')
      }
      const json = await res.json()
      setData(json)
      setState('done')
    } catch (e) {
      setError(e.message)
      setState('error')
    }
  }

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <div style={styles.eyebrow}>// equity research copilot</div>
        <h1 style={styles.h1}>
          Analyst-grade reports,<br />
          <em style={styles.em}>in seconds.</em>
        </h1>
        <p style={styles.sub}>
          Real financials from Polygon · AI-powered thesis generation · 90-day price chart.
        </p>
      </div>

      <SearchBar onAnalyze={analyze} loading={state === 'loading'} />

      {state === 'idle' && <EmptyState onSelect={analyze} />}
      {state === 'loading' && <LoadingState message={loadingMsg} />}
      {state === 'error' && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--red)', fontSize: 14 }}>
          {error}
        </div>
      )}
      {state === 'done' && data && <Report data={data} />}
    </div>
  )
}
