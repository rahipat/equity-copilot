const s = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    marginBottom: '2rem',
    fontSize: 13,
    color: 'var(--muted)',
    fontFamily: "'DM Mono', monospace",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: 'var(--accent)',
    animation: 'pulse 1.4s ease-in-out infinite',
    flexShrink: 0,
  },
  empty: { textAlign: 'center', padding: '4rem', color: '#444' },
  big: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '5rem',
    marginBottom: '1rem',
  },
}

export default function LoadingState({ message }) {
  return (
    <>
      <div style={s.bar}>
        <div style={s.dot} />
        <span>{message}</span>
      </div>
      <div style={s.empty}>
        <div style={s.big}>⋯</div>
      </div>
    </>
  )
}
