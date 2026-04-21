import {
  RadarChart as ReRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const COLORES = {
  self: '#1a1a1a',
  external: '#29b8dc',
  manager: '#f97316',
  colleague: '#3b82f6',
  friend: '#22c55e',
}

/**
 * Gap Analysis Radar Chart.
 *
 * @param {Array} data - [{categoria, self_score, external_score, score_manager, score_colleague, score_friend}]
 * @param {boolean} showBreakdown - whether to show manager/colleague/friend lines
 */
export default function RadarChart({ data, showBreakdown = false }) {
  const chartData = data.map(d => ({
    subject: d.categoria,
    Self: d.self_score ?? 0,
    External: d.external_score ?? 0,
    ...(showBreakdown && {
      Manager: d.score_manager ?? 0,
      Colleague: d.score_colleague ?? 0,
      Friend: d.score_friend ?? 0,
    }),
  }))

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ReRadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 11, fill: '#1a1a1a', fontWeight: 500 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 5]}
          tickCount={6}
          tick={{ fontSize: 10, fill: '#999' }}
        />

        <Radar
          name="Self"
          dataKey="Self"
          stroke={COLORES.self}
          fill={COLORES.self}
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Radar
          name="External"
          dataKey="External"
          stroke={COLORES.external}
          fill={COLORES.external}
          fillOpacity={0.2}
          strokeWidth={2}
        />

        {showBreakdown && (
          <>
            <Radar
              name="Manager"
              dataKey="Manager"
              stroke={COLORES.manager}
              fill={COLORES.manager}
              fillOpacity={0.1}
              strokeWidth={1.5}
              strokeDasharray="5 3"
            />
            <Radar
              name="Colleague"
              dataKey="Colleague"
              stroke={COLORES.colleague}
              fill={COLORES.colleague}
              fillOpacity={0.1}
              strokeWidth={1.5}
              strokeDasharray="5 3"
            />
            <Radar
              name="Friend"
              dataKey="Friend"
              stroke={COLORES.friend}
              fill={COLORES.friend}
              fillOpacity={0.1}
              strokeWidth={1.5}
              strokeDasharray="5 3"
            />
          </>
        )}

        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
        />
        <Tooltip
          formatter={(value, name) => [value ? value.toFixed(2) : '—', name]}
          contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '12px' }}
        />
      </ReRadarChart>
    </ResponsiveContainer>
  )
}
