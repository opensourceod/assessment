import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'

export default function RadarChart({ data }) {
  const chartData = data.map((item) => ({
  subject: item.categoria,
  self: Math.round(item.self_score || 0),
  external: Math.round(
    item.external_score || 0
  ),
}))

  return (
    <div className="w-full h-[550px] bg-white">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart
          outerRadius="68%"
          data={chartData}
        >
          <PolarGrid
            stroke="#d4d4d4"
            radialLines={true}
          />

          <PolarAngleAxis
            dataKey="subject"
            tick={({ payload, x, y, textAnchor }) => {
              const item = chartData.find(
                (d) => d.subject === payload.value
              )

              return (
                <g>
                  <text
                    x={x}
                    y={y - 8}
                    textAnchor={textAnchor}
                    fontSize={13}
                    fill="#444"
                    fontWeight="500"
                  >
                    {payload.value}
                  </text>

                  <text
                    x={x}
                    y={y + 12}
                    textAnchor={textAnchor}
                    fontSize={16}
                    fill="#111"
                    fontWeight="700"
                  >
                    {item?.external}%
                  </text>
                </g>
              )
            }}
          />

          <PolarRadiusAxis
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />

          {/* EXTERNAL */}
          <Radar
            dataKey="external"
            stroke="#666"
            fill="transparent"
            strokeWidth={2}
            strokeDasharray="5 5"
          />

          {/* SELF */}
          <Radar
            dataKey="self"
            stroke="#111"
            fill="#000"
            fillOpacity={0.05}
            strokeWidth={3}
            label={({ x, y, value }) => (
              <text
                x={x}
                y={y}
                textAnchor="middle"
                fontSize={12}
                fontWeight="700"
                fill="#111"
              >
                {value}%
              </text>
            )}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  )
}