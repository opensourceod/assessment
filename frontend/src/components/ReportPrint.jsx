import { forwardRef } from 'react'
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts'

const STRENGTH_DIMS = ['Social OD', 'Technical', 'OD Competencies Influence']

const DOMAIN_INFO = {
  'Social OD': {
    color: '#ef4444',
    bg: '#fee2e2',
    label: 'Social',
    icon: '🧠',
    description:
      'OD practitioners integrate behavioral science knowledge and psychological insights, cultural pattern recognition, and human-centered ethics to drive meaningful change. The social domain also includes exploring how individual and group behaviors, shaped by biases and motivations, interact with underlying cultural assumptions and values.',
    competencies: [
      'Helping leaders identify and address characteristics of organizational culture aligned with vision, mission, and values.',
      'Creating a safe space for employees to discuss tough issues and suggest creative solutions without fear of retribution.',
      'Addressing common anxieties and attachments that inhibit organizational health and effectiveness.',
      'Drawing from social psychology to help motivate employees, address resistance to change, and inspire peak performance.',
      'Developing high-performing, cohesive, and adaptive teams with clear charters, boundaries, authority, and roles.',
      'Addressing dysfunctional characteristics of groups including scapegoating and anti-task behaviors.',
      'Inspiring, developing, and sustaining genuine and measurable diversity, equity, and inclusion.',
      'Cultivating a mindful and ethical workplace marked by ethical decision making and citizenship.',
      'Cultivating meaningful work by aligning individual and team purpose with the organization\'s mission.',
    ],
  },
  Technical: {
    color: '#3b82f6',
    bg: '#dbeafe',
    label: 'Technical',
    icon: '⚙️',
    description:
      'OD practitioners play a crucial role in aligning resources and strategies with an organization\'s vision and values, refining systems, and enhancing collaborative design that empowers employees. They focus on continuous improvement and data-driven interventions, aligning technical needs with social dynamics that foster a healthy, high-performing organization.',
    competencies: [
      'Developing a clear, widely understood vision, mission, strategic initiatives, and resource allocation.',
      'Implementing a transparent strategic change process with benchmarks aligning talent, IT, HR, and budgets.',
      'Continuously inviting stakeholder feedback, adjusting the plan, and rewarding success.',
      'Designing agile organizational systems that respond effectively to internal and external changes.',
      'Utilizing effective organization design principles including span of control and talent career ladders.',
      'Improving efficiency and effectiveness of organizational processes by assessing inputs and outputs.',
      'Using surveys, focus groups, and interviews to formulate valid data and insights on performance.',
      'Developing new performance indicators and reward systems that balance strategic and cultural imperatives.',
      'Demonstrating, monitoring, and managing the impact of organizational interventions over time.',
      'Helping employees create a strong case for change through dialogue and consensus around data.',
      'Analyzing resistance and mobilizing influential stakeholders committed to the change process.',
      'Cultivating momentum by celebrating progress toward benchmarks and building on initial successes.',
    ],
  },
  'OD Competencies Influence': {
    color: '#f59e0b',
    bg: '#fef3c7',
    label: 'Influence',
    icon: '🎯',
    description:
      'OD practitioners engage in influencing and transforming organizational habits of mind, fostering learning, sense-making, and truth-telling. Their strategic and ethical approach promotes deep reflection and builds consensus, aligning individual and team perspectives with organizational goals.',
    competencies: [
      'Understanding how strategy, systems, structures, culture, and teams contribute to organizational health.',
      'Sensing client needs, contracting, diagnosing, developing and evaluating OD interventions.',
      'Familiarity with OD values: awareness, integrity, courageous leadership, diversity and inclusion.',
      'Facilitating regular inquiry, dialogue, creative thinking, and experimentation to advance strategy.',
      'Creating learning opportunities grounded in adult learning theory for the organization\'s future workforce.',
      'Helping leaders manage unexpected challenges through dialogue and informal coaching.',
    ],
  },
}

const PAGE_BASE = {
  width: 794,
  minHeight: 1123,
  background: '#ffffff',
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  color: '#1a1a1a',
  padding: '56px 64px 80px',
  boxSizing: 'border-box',
  position: 'relative',
}

function PageFooter({ page }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 28,
      left: 64,
      right: 64,
      display: 'flex',
      justifyContent: 'space-between',
      borderTop: '1px solid #e5e7eb',
      paddingTop: 10,
    }}>
      <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700 }}>MOST</span>
      <span style={{ fontSize: 10, color: '#9ca3af' }}>© 2024 Transformative Learning Institute LLC</span>
      <span style={{ fontSize: 10, color: '#9ca3af' }}>{page}</span>
    </div>
  )
}

function OsodHeader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#29b8dc' }}>OSOD</div>
        <div style={{ fontSize: 9, color: '#9ca3af' }}>OpenSourceOD.com</div>
      </div>
    </div>
  )
}

const PRINT_SCOPES = {
  self:      { stroke: '#1a1a1a', fill: '#1a1a1a', fillOpacity: 0.18, label: 'Self'      },
  external:  { stroke: '#06b6d4', fill: '#67e8f9', fillOpacity: 0.40, label: 'External'  },
  manager:   { stroke: '#f97316', fill: '#fed7aa', fillOpacity: 0.40, label: 'Manager'   },
  colleague: { stroke: '#3b82f6', fill: '#bfdbfe', fillOpacity: 0.40, label: 'Colleague' },
  friend:    { stroke: '#16a34a', fill: '#bbf7d0', fillOpacity: 0.40, label: 'Friend'    },
}

function PrintRadarChart({ categorias }) {
  const data = categorias.map(item => ({
    subject:   item.categoria,
    self:      item.self_score      != null ? Math.round(item.self_score)      : 0,
    external:  item.external_score  != null ? Math.round(item.external_score)  : 0,
    manager:   item.score_manager   != null ? Math.round(item.score_manager)   : 0,
    colleague: item.score_colleague != null ? Math.round(item.score_colleague) : 0,
    friend:    item.score_friend    != null ? Math.round(item.score_friend)    : 0,
  }))

  return (
    <RechartsRadarChart width={660} height={440} outerRadius="62%" data={data}>
      <PolarGrid stroke="#d4d4d4" />
      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#444', fontWeight: 500 }} />
      <PolarRadiusAxis domain={[0, 100]} tickCount={6} tick={{ fontSize: 10, fill: '#aaa' }} axisLine={false} tickLine={false} />
      <Tooltip />
      {Object.entries(PRINT_SCOPES).map(([key, s]) => (
        <Radar
          key={key}
          name={s.label}
          dataKey={key}
          stroke={s.stroke}
          fill={s.fill}
          fillOpacity={s.fillOpacity}
          strokeWidth={2}
          dot={false}
        />
      ))}
      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
    </RechartsRadarChart>
  )
}

function ScoreBar({ label, value, color }) {
  const pct = value != null ? Math.round(value) : null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <span style={{ fontSize: 11, color: '#555', minWidth: 80 }}>{label}</span>
      <div style={{ flex: 1, background: '#e5e7eb', borderRadius: 3, height: 7, overflow: 'hidden' }}>
        {pct != null && (
          <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: 3 }} />
        )}
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, minWidth: 42, textAlign: 'right', color: '#111' }}>
        {pct != null ? `${pct}%` : '—'}
      </span>
    </div>
  )
}

const ReportPrint = forwardRef(function ReportPrint({ reporte }, ref) {
  if (!reporte) return null

  const cats = reporte.categorias ?? []
  const getScore = (catName) => cats.find(c => c.categoria === catName)

  const domainData = STRENGTH_DIMS.map(dim => ({
    dim,
    info: DOMAIN_INFO[dim],
    score: getScore(dim),
  }))

  return (
    <div ref={ref} style={{ position: 'absolute', top: -99999, left: 0, zIndex: -1 }}>

      {/* ══════════ PAGE 1: Domains Overview ══════════ */}
      <div id="rp-1" style={{ ...PAGE_BASE }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#29b8dc', margin: 0 }}>Domains</h1>
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
              360 MOST Assessment · {reporte.nombre} · {reporte.departamento}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {domainData.map(({ dim, info, score }) => (
              <div key={dim} style={{
                background: info.color,
                color: 'white',
                padding: '10px 14px',
                textAlign: 'center',
                fontWeight: 700,
                borderRadius: 8,
                minWidth: 72,
              }}>
                <div style={{ fontSize: 10, opacity: 0.9, marginBottom: 4 }}>{info.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>
                  {score?.external_score != null ? `${Math.round(score.external_score)}%` : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12.5, lineHeight: 1.9, color: '#374151', marginBottom: 32, maxWidth: 560 }}>
          To engage in genuine Organization Development, a practitioner must utilize at least one of the 27 competency
          clusters in each domain (Social, Technical, Influence) in a collaborative and caring way, where outcomes
          include both the prosperity of the organization as well as the well-being of internal and/or external
          stakeholders.
        </p>

        {domainData.map(({ dim, info, score }) => (
          <div key={dim} style={{ display: 'flex', gap: 28, marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: info.color, fontWeight: 700, fontSize: 15, margin: '0 0 6px' }}>
                {info.label}:
              </h3>
              <p style={{ fontSize: 12, lineHeight: 1.8, color: '#374151', margin: 0 }}>{info.description}</p>
            </div>
            <div style={{ minWidth: 170, flexShrink: 0 }}>
              <p style={{ color: '#29b8dc', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, margin: '0 0 5px' }}>
                Your Scores
              </p>
              <p style={{ fontSize: 12, color: '#374151', margin: '0 0 12px' }}>
                Strength:{' '}
                <strong>{score?.self_score != null ? `${score.self_score.toFixed(2)}%` : '—'}</strong>
              </p>
              <p style={{ color: '#374151', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, margin: '0 0 5px' }}>
                Average
              </p>
              <p style={{ fontSize: 12, color: '#374151', margin: 0 }}>
                Strength:{' '}
                <strong>{score?.external_score != null ? `${score.external_score.toFixed(2)}%` : '—'}</strong>
              </p>
            </div>
          </div>
        ))}

        <PageFooter page="1" />
      </div>

      {/* ══════════ PAGE 2: Radar Chart ══════════ */}
      <div id="rp-2" style={{ ...PAGE_BASE }}>
        <OsodHeader />

        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
          Self vs External Perception
        </h2>
        <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 24 }}>
          360 MOST Assessment · {reporte.nombre}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <PrintRadarChart categorias={cats} />
        </div>

        <p style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 16, textAlign: 'center' }}>
          Scores represent averages per dimension (0–100). Self = personal assessment; External = average of all evaluators.
        </p>

        <PageFooter page="2" />
      </div>

      {/* ══════════ PAGES 3-5: Domain Detail Pages ══════════ */}
      {domainData.map(({ dim, info, score }, idx) => (
        <div key={dim} id={`rp-${idx + 3}`} style={{ ...PAGE_BASE }}>
          <OsodHeader />

          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>
            {info.label} Competency Scores
          </h2>

          {/* Domain description row */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 28 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: info.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, flexShrink: 0,
            }}>
              {info.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 13, margin: '0 0 5px' }}>
                <span style={{ color: info.color }}>{info.label}:</span>
              </p>
              <p style={{ fontSize: 11.5, lineHeight: 1.75, color: '#374151', margin: 0 }}>
                {info.description}
              </p>
            </div>
          </div>

          {/* Score blocks */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1, background: '#f9fafb', borderRadius: 10, padding: '14px 18px' }}>
              <p style={{ color: '#29b8dc', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 10px' }}>
                Your {info.label} Scores
              </p>
              <ScoreBar label="Strength" value={score?.self_score} color={info.color} />
            </div>
            <div style={{ flex: 1, background: '#f9fafb', borderRadius: 10, padding: '14px 18px' }}>
              <p style={{ color: '#374151', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 10px' }}>
                Average {info.label} Scores
              </p>
              <ScoreBar label="Strength" value={score?.external_score} color="#6b7280" />
            </div>
          </div>

          {/* Evaluator breakdown */}
          <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 18px', marginBottom: 28 }}>
            <p style={{ fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 12px', color: '#374151' }}>
              Score by Evaluator Type
            </p>
            <ScoreBar label="Manager"   value={score?.score_manager}   color="#f97316" />
            <ScoreBar label="Colleague" value={score?.score_colleague} color="#3b82f6" />
            <ScoreBar label="Friend"    value={score?.score_friend}    color="#16a34a" />
          </div>

          {/* Competencies list */}
          <div>
            <p style={{ fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 10px', color: '#374151' }}>
              Competencies Assessed
            </p>
            {info.competencies.map((comp, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: info.color, color: 'white',
                  fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 1,
                }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: 11, lineHeight: 1.65, color: '#374151', margin: 0 }}>{comp}</p>
              </div>
            ))}
          </div>

          <PageFooter page={String(idx + 3)} />
        </div>
      ))}

      {/* ══════════ PAGE 6: Scores Table ══════════ */}
      <div id="rp-6" style={{ ...PAGE_BASE }}>
        <OsodHeader />

        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 22 }}>Scores by Dimension</h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr>
              {[
                { label: 'Dimension',  color: '#f3f4f6', textColor: '#111', align: 'left'   },
                { label: 'Self',       color: '#f3f4f6', textColor: '#111', align: 'center' },
                { label: 'External',   color: '#f3f4f6', textColor: '#111', align: 'center' },
                { label: 'Manager',    color: '#f97316', textColor: '#fff', align: 'center' },
                { label: 'Colleague',  color: '#3b82f6', textColor: '#fff', align: 'center' },
                { label: 'Friend',     color: '#16a34a', textColor: '#fff', align: 'center' },
              ].map(col => (
                <th key={col.label} style={{
                  padding: '10px 14px',
                  textAlign: col.align,
                  fontWeight: 700,
                  background: col.color,
                  color: col.textColor,
                  borderBottom: '2px solid #e5e7eb',
                }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {domainData.map(({ dim, info, score }, i) => (
              <tr key={dim} style={{ background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                <td style={{ padding: '12px 14px', fontWeight: 600, color: info.color, borderBottom: '1px solid #f3f4f6' }}>
                  {dim}
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>
                  {score?.self_score?.toFixed(2) ?? '—'}
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>
                  {score?.external_score?.toFixed(2) ?? '—'}
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'center', borderBottom: '1px solid #f3f4f6', color: '#f97316', fontWeight: 600 }}>
                  {score?.score_manager?.toFixed(2) ?? '—'}
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'center', borderBottom: '1px solid #f3f4f6', color: '#3b82f6', fontWeight: 600 }}>
                  {score?.score_colleague?.toFixed(2) ?? '—'}
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'center', borderBottom: '1px solid #f3f4f6', color: '#16a34a', fontWeight: 600 }}>
                  {score?.score_friend?.toFixed(2) ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 14 }}>
          Strength scores only. Self = personal assessment; External = average of all evaluators.
          Gap = Self − External. Positive gap means you rate yourself higher than others do (potential blind spot).
        </p>

        <PageFooter page="6" />
      </div>

    </div>
  )
})

export default ReportPrint
