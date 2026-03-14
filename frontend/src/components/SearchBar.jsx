import { useState } from 'react'

const s = {
  wrap: {
    display: 'flex',
    background: 'var(--surface)',
    border: '1px solid var(--border2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: '2.5rem',
    transition: 'border-color 0.2s',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    padding: '16px 20px',
    fontFamily: "'DM Mono', monospace",
    fontSize: 15,
    color: 'var(--text)',
    letterSpacing: '0.08em',
  },
  btn: {
    background: 'var(--accent)',
    border: 'none',
    padding: '16px 28px',
    fontFamily: "'Syne', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    color: '#0a0a0f',
    cursor: 'pointer',
    letterSpacing: '0.05em',
    transition: 'opacity 0.15s',
    opacity: 1,
  },
  btnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
}

export default function SearchBar({ onAnalyze, loading }) {
  const [val, setVal] = useState('')

  function submit() {
    if (!val.trim() || loading) return
    onAnalyze(val.trim().toUpperCase())
  }

  return (
    <div style={s.wrap}>
      <input
        style={s.input}
        placeholder="NVDA, AAPL, MSFT, TSLA..."
        value={val}
        onChange={e => setVal(e.target.value.toUpperCase())}
        onKeyDown={e => e.key === 'Enter' && submit()}
        maxLength={10}
      />
      <button
        style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
        onClick={submit}
        disabled={loading}
      >
        {loading ? '...' : 'ANALYZE →'}
      </button>
    </div>
  )
}
