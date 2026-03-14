import PriceChart from './PriceChart.jsx'

const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  padding: '1.5rem',
  marginBottom: '1.5rem',
}

const cardLabel = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 10,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: 'var(--accent)',
  marginBottom: '1rem',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

function CardLabel({ children }) {
  return (
    <div style={cardLabel}>
      {children}
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}

function Metric({ label, value, sub, subColor }) {
  return (
    <div style={{ background: 'var(--surface)', padding: '18px 16px' }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 500, color: 'var(--text)', lineHeight: 1, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: subColor || 'var(--muted)' }}>{sub}</div>}
    </div>
  )
}

function ScoreBar({ label, value }) {
  const color = value >= 70 ? 'var(--green)' : value >= 45 ? 'var(--amber)' : 'var(--red)'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 500, fontFamily: "'DM Mono', monospace", color }}>{value}</span>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </div>
  )
}

export default function Report({ data: d }) {
  const isUp = d.change >= 0
  const changeColor = isUp ? 'var(--green)' : 'var(--red)'
  const ratingColor = d.rating === 'BUY' ? { bg: 'var(--green-dim)', color: 'var(--green)', border: 'rgba(77,219,142,0.2)' }
    : d.rating === 'SELL' ? { bg: 'var(--red-dim)', color: 'var(--red)', border: 'rgba(255,92,92,0.2)' }
    : { bg: 'rgba(240,168,48,0.1)', color: 'var(--amber)', border: 'rgba(240,168,48,0.2)' }

  const upside = d.priceTarget && d.price
    ? (((d.priceTarget - d.price) / d.price) * 100).toFixed(1)
    : null

  const divStr = d.dividendYield && d.dividendYield > 0
    ? `${(d.dividendYield * 100).toFixed(2)}%` : '—'

  return (
    <div>
      {/* Hero */}
      <div className="fade-in" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 400, lineHeight: 1.1, marginBottom: 8 }}>{d.companyName}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Tag accent>{d.ticker}</Tag>
            <Tag>{d.sector || 'N/A'}</Tag>
            {d.homepageUrl && <a href={d.homepageUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--muted)', textDecoration: 'none' }}>↗ website</a>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 500, color: 'var(--text)', lineHeight: 1, marginBottom: 6 }}>${d.price}</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: changeColor }}>{isUp ? '+' : ''}{d.change} ({isUp ? '+' : ''}{d.changePct}%)</div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: '1.5rem' }}>
        <Metric label="Market cap" value={d.marketCap} />
        <Metric label="P/E ratio" value={d.peRatio ?? 'N/A'} sub={`Fwd P/E ${d.forwardPE ?? 'N/A'}`} />
        <Metric label="Revenue TTM" value={`$${d.revenue}`} sub={d.revenueGrowth != null ? `${d.revenueGrowth >= 0 ? '+' : ''}${d.revenueGrowth}% YoY` : 'N/A'} subColor={d.revenueGrowth >= 0 ? 'var(--green)' : 'var(--red)'} />
        <Metric label="Gross margin" value={d.grossMargin} />
        <Metric label="EPS" value={d.eps != null ? `$${d.eps}` : 'N/A'} />
        <Metric label="52w range" value={`${d.fiftyTwoWeekLow ?? '—'} – ${d.fiftyTwoWeekHigh ?? '—'}`} />
        <Metric label="Beta" value={d.beta ?? 'N/A'} />
        <Metric label="Dividend" value={divStr} />
      </div>

      {/* Chart */}
      <div className="fade-in" style={card}>
        <CardLabel>price — 90 days</CardLabel>
        <PriceChart dates={d.chartDates} prices={d.chartPrices} isUp={isUp} />
      </div>

      {/* Rating & thesis */}
      <div className="fade-in" style={card}>
        <CardLabel>analyst verdict</CardLabel>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 3, background: ratingColor.bg, color: ratingColor.color, border: `1px solid ${ratingColor.border}`, fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500, letterSpacing: '0.08em', marginBottom: '1.5rem' }}>
          {d.rating}
          {d.priceTarget && <> · ${d.priceTarget} target</>}
          {upside && <> · {parseFloat(upside) >= 0 ? '+' : ''}{upside}% upside</>}
        </div>
        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, fontStyle: 'italic', lineHeight: 1.75, color: '#ccc8c0' }}>{d.summary}</p>
      </div>

      {/* Bull / Bear */}
      <div className="fade-in" style={card}>
        <CardLabel>bull / bear</CardLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <CaseColumn title="bull case" items={d.bullCase} color="var(--green)" />
          <CaseColumn title="bear case" items={d.bearCase} color="var(--red)" />
        </div>
      </div>

      {/* Scores + Catalysts */}
      <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={card}>
          <CardLabel>factor scores</CardLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(d.scores || {}).map(([k, v]) => <ScoreBar key={k} label={k} value={v} />)}
          </div>
        </div>
        <div style={card}>
          <CardLabel>catalysts & risks</CardLabel>
          <CatList items={d.catalysts || []} color="var(--green)" />
          <div style={{ height: 12 }} />
          <CatList items={d.risks || []} color="var(--red)" />
        </div>
      </div>

      {/* News */}
      <div className="fade-in" style={card}>
        <CardLabel>news & sentiment</CardLabel>
        {(d.news || []).map((n, i) => {
          const pillStyle = n.sentiment === 'positive'
            ? { bg: 'var(--green-dim)', color: 'var(--green)' }
            : n.sentiment === 'negative'
            ? { bg: 'var(--red-dim)', color: 'var(--red)' }
            : { bg: 'rgba(122,120,136,0.15)', color: 'var(--muted)' }
          return (
            <div key={i} style={{ padding: '12px 0', borderBottom: i < d.news.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, marginBottom: 4 }}>{n.headline}</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--muted)' }}>{n.source}</span>
                <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", padding: '2px 8px', borderRadius: 2, background: pillStyle.bg, color: pillStyle.color, letterSpacing: '0.05em' }}>{n.sentiment}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Tag({ children, accent }) {
  return (
    <span style={{
      fontFamily: "'DM Mono', monospace",
      fontSize: 11,
      padding: '3px 10px',
      borderRadius: 2,
      border: accent ? '1px solid rgba(200,240,96,0.25)' : '1px solid var(--border2)',
      color: accent ? 'var(--accent)' : 'var(--muted)',
      background: accent ? 'var(--accent-dim)' : 'transparent',
      letterSpacing: '0.05em',
    }}>{children}</span>
  )
}

function CaseColumn({ title, items, color }) {
  return (
    <div style={{ borderLeft: `2px solid ${color}`, paddingLeft: 16 }}>
      <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', color, marginBottom: 10 }}>{title}</div>
      <ul style={{ listStyle: 'none' }}>
        {(items || []).map((p, i) => (
          <li key={i} style={{ fontSize: 13, color: '#9996a6', lineHeight: 1.7, padding: '3px 0' }}>→ {p}</li>
        ))}
      </ul>
    </div>
  )
}

function CatList({ items, color }) {
  return (
    <ul style={{ listStyle: 'none' }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: 13, color: '#9996a6', lineHeight: 1.6, padding: '6px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, marginTop: 6, flexShrink: 0, display: 'inline-block' }} />
          {item}
        </li>
      ))}
    </ul>
  )
}
