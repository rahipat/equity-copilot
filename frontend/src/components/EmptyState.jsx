const suggestions = ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'AMZN', 'META', 'GOOGL', 'JPM']

const s = {
  wrap: { textAlign: 'center', padding: '5rem 2rem', color: 'var(--muted)' },
  big: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '6rem',
    opacity: 0.05,
    marginBottom: '1rem',
    color: 'var(--text)',
    lineHeight: 1,
  },
  p: { fontSize: 14, lineHeight: 1.7, marginBottom: '1.5rem' },
  row: { display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
  chip: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 12,
    padding: '5px 14px',
    border: '1px solid var(--border2)',
    borderRadius: 3,
    cursor: 'pointer',
    color: 'var(--muted)',
    background: 'none',
    transition: 'all 0.15s',
  },
}

export default function EmptyState({ onSelect }) {
  return (
    <div style={s.wrap}>
      <div style={s.big}>$</div>
      <p style={s.p}>Enter a ticker to generate a full research report<br />with real financials and AI analysis.</p>
      <div style={s.row}>
        {suggestions.map(t => (
          <button
            key={t}
            style={s.chip}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.color = 'var(--muted)' }}
            onClick={() => onSelect(t)}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  )
}
