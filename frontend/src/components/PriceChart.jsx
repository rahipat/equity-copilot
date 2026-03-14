import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = new Date(label)
  const dateStr = isNaN(d) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return (
    <div style={{
      background: 'var(--surface2)',
      border: '1px solid var(--border2)',
      borderRadius: 4,
      padding: '8px 12px',
      fontFamily: "'DM Mono', monospace",
      fontSize: 12,
      color: 'var(--text)',
    }}>
      <div style={{ color: 'var(--muted)', marginBottom: 2 }}>{dateStr}</div>
      ${payload[0].value.toFixed(2)}
    </div>
  )
}

export default function PriceChart({ dates, prices, isUp }) {
  if (!dates?.length) return null

  const color = isUp ? '#4ddb8e' : '#ff5c5c'
  const data = dates.map((t, i) => ({ ts: t, price: prices[i] }))

  const tickFormatter = (ts) => {
    const d = new Date(ts)
    return isNaN(d) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div style={{ height: 200, marginTop: 8 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="ts"
            scale="time"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={tickFormatter}
            tick={{ fill: 'var(--muted)', fontSize: 10, fontFamily: "'DM Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            tickCount={5}
          />
          <YAxis
            orientation="right"
            domain={['auto', 'auto']}
            tick={{ fill: 'var(--muted)', fontSize: 10, fontFamily: "'DM Mono', monospace" }}
            tickFormatter={v => `$${v.toFixed(0)}`}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={1.5}
            fill="url(#priceGrad)"
            dot={false}
            activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
