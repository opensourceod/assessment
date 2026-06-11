import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const SCOPES = {
  self:      { stroke: '#1a1a1a', fill: 'none', fillOpacity: 0, label: 'Self',      dash: null },
  external:  { stroke: '#06b6d4', fill: 'none', fillOpacity: 0, label: 'External',  dash: null },
  manager:   { stroke: '#f97316', fill: 'none', fillOpacity: 0, label: 'Manager',   dash: '6 4' },
  colleague: { stroke: '#3b82f6', fill: 'none', fillOpacity: 0, label: 'Colleague', dash: '2 3' },
  friend:    { stroke: '#16a34a', fill: 'none', fillOpacity: 0, label: 'Friend',    dash: '6 3 2 3' },
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: 2,
      padding: '12px 14px',
      boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 8px -1px rgba(0, 0, 0, 0.04)',
      minWidth: 180,
      fontFamily: 'Inter, sans-serif',
    }}>
      <p style={{
        fontWeight: 700,
        fontSize: 11,
        marginBottom: 8,
        color: '#0f172a',
        letterSpacing: '0.05em',
        textTransform: 'uppercase'
      }}>
        {label}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {payload.map(p => (
          <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: SCOPES[p.dataKey]?.stroke }} />
              {SCOPES[p.dataKey]?.label}
            </span>
            <strong style={{ color: '#0f172a' }}>
              {p.value != null ? `${p.value}%` : '—'}
            </strong>
          </div>
        ))}
      </div>
    </div>
  )
}

const CATEGORY_ORDER = [
  'Humanity', 'Psychology', 'Culture', 'Learning',
  'Consulting', 'Change', 'Design', 'Performance', 'Strategy',
]

export default function RadarChart({ data, showBreakdown }) {
  const sorted = [...data].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.categoria)
    const bi = CATEGORY_ORDER.indexOf(b.categoria)
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })
  const chartData = sorted.map((item) => ({
    subject:   item.categoria,
    self:      item.self_score      != null ? Math.round(item.self_score)      : 0,
    external:  item.external_score  != null ? Math.round(item.external_score)  : 0,
    manager:   item.score_manager   != null ? Math.round(item.score_manager)   : 0,
    colleague: item.score_colleague != null ? Math.round(item.score_colleague) : 0,
    friend:    item.score_friend    != null ? Math.round(item.score_friend)    : 0,
  }))

  const activeScopes = showBreakdown
    ? ['self', 'manager', 'colleague', 'friend']
    : ['self', 'external']

  const renderTick = (props) => {
    const { payload, x, y, textAnchor } = props
    const item = chartData.find((d) => d.subject === payload.value)
    const score = item ? item.external : 0

    // Adjust vertical alignment slightly based on position to prevent overlap
    let dyVal = 0;
    if (y < 240) dyVal = -6;
    else if (y > 320) dyVal = 6;

    return (
      <g transform={`translate(${x}, ${y + dyVal})`}>
        <text
          textAnchor={textAnchor}
          fill="#334155"
          fontSize={10.5}
          fontWeight={600}
          fontFamily="Inter, sans-serif"
        >
          <tspan x={0} dy="0">{payload.value}</tspan>
          <tspan x={0} dy="12" fontWeight={800} fill="#1e293b">{score}%</tspan>
        </text>
      </g>
    )
  }

  return (
    <div className="w-full h-[560px] bg-white flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart outerRadius="68%" data={chartData}>
          <PolarGrid gridType="circle" stroke="#e2e8f0" strokeDasharray="4 4" radialLines={true} />

          <PolarAngleAxis
            dataKey="subject"
            tick={renderTick}
          />

          <PolarRadiusAxis
            domain={[0, 100]}
            tickCount={6}
            tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Inter, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip content={<CustomTooltip />} />

          {activeScopes.map(scope => {
            const s = SCOPES[scope]
            return (
              <Radar
                key={scope}
                name={s.label}
                dataKey={scope}
                stroke={s.stroke}
                fill={s.fill}
                fillOpacity={s.fillOpacity}
                strokeWidth={1.5}
                strokeDasharray={s.dash ?? undefined}
                dot={{ r: 3, strokeWidth: 1, stroke: s.stroke, fill: '#ffffff' }}
                activeDot={{ r: 4.5, strokeWidth: 1.5, stroke: '#ffffff', fill: s.stroke }}
              />
            )
          })}

          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: 24, fontSize: 12, fontFamily: 'Inter, sans-serif' }}
            formatter={(value) => (
              <span style={{ color: '#475569', fontWeight: 600, paddingLeft: 4 }}>{value}</span>
            )}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  )
}
