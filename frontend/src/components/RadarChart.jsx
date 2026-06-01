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
  self:      { stroke: '#1a1a1a', fill: '#1a1a1a', fillOpacity: 0.20, label: 'Self',      dash: null },
  external:  { stroke: '#06b6d4', fill: '#67e8f9', fillOpacity: 0.40, label: 'External',  dash: null },
  manager:   { stroke: '#f97316', fill: '#fed7aa', fillOpacity: 0.40, label: 'Manager',   dash: null },
  colleague: { stroke: '#3b82f6', fill: '#bfdbfe', fillOpacity: 0.40, label: 'Colleague', dash: null },
  friend:    { stroke: '#16a34a', fill: '#bbf7d0', fillOpacity: 0.40, label: 'Friend',    dash: null },
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: 10,
      padding: '10px 14px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
      minWidth: 160,
    }}>
      <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: '#111' }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: SCOPES[p.dataKey]?.stroke, fontSize: 13, margin: '3px 0' }}>
          {SCOPES[p.dataKey]?.label}:{' '}
          <strong>{p.value != null ? `${p.value}%` : '—'}</strong>
        </p>
      ))}
    </div>
  )
}

export default function RadarChart({ data, showBreakdown }) {
  const chartData = data.map((item) => ({
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

  return (
    <div className="w-full h-[560px] bg-white">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart outerRadius="65%" data={chartData}>
          <PolarGrid stroke="#d4d4d4" radialLines={true} />

          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 13, fill: '#444', fontWeight: 500 }}
          />

          <PolarRadiusAxis
            domain={[0, 100]}
            tickCount={6}
            tick={{ fontSize: 11, fill: '#aaa' }}
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
                strokeWidth={2}
                strokeDasharray={s.dash ?? undefined}
                dot={false}
                activeDot={{ r: 4, fill: s.stroke, strokeWidth: 0 }}
              />
            )
          })}

          <Legend
            wrapperStyle={{ paddingTop: 12, fontSize: 13 }}
            formatter={(value) => (
              <span style={{ color: '#333', fontWeight: 500 }}>{value}</span>
            )}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  )
}
