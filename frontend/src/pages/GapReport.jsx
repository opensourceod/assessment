import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import RadarChart from '../components/RadarChart'
import ReportPrint from '../components/ReportPrint'
import axios from '../api/client'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const TOTAL_PRINT_PAGES = 6

export default function GapReport() {
  const { subjectId } = useParams()

  const [reporte,       setReporte]       = useState(null)
  const [cargando,      setCargando]      = useState(true)
  const [error,         setError]         = useState(null)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [exporting,     setExporting]     = useState(false)

  const printRef = useRef(null)

  useEffect(() => {
    axios
      .get(`/api/reports/${subjectId}`)
      .then(res => setReporte(res.data))
      .catch(() => setError('Could not load report.'))
      .finally(() => setCargando(false))
  }, [subjectId])

  async function capturePageEl(el) {
    const saved = {
      position: el.style.position,
      top:      el.style.top,
      left:     el.style.left,
      zIndex:   el.style.zIndex,
    }

    el.style.position = 'fixed'
    el.style.top      = '0'
    el.style.left     = '0'
    el.style.zIndex   = '9999'

    await new Promise(r => setTimeout(r, 30))

    const canvas = await html2canvas(el, {
      scale:           2,
      useCORS:         true,
      allowTaint:      false,
      backgroundColor: '#ffffff',
      logging:         false,
    })

    Object.assign(el.style, saved)
    return canvas
  }

  async function exportPDF() {
    setExporting(true)
    try {
      const pdf    = new jsPDF('p', 'mm', 'a4')
      const pageW  = pdf.internal.pageSize.getWidth()
      const pageH  = pdf.internal.pageSize.getHeight()

      for (let i = 1; i <= TOTAL_PRINT_PAGES; i++) {
        const el = document.getElementById(`rp-${i}`)
        if (!el) continue

        const canvas  = await capturePageEl(el)
        const imgData = canvas.toDataURL('image/png')
        const imgH    = (canvas.height * pageW) / canvas.width

        if (i > 1) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, 0, pageW, Math.min(imgH, pageH))
      }

      pdf.save(`${reporte.nombre}-360-MOST-Report.pdf`)
    } catch (err) {
      console.error('PDF export error:', err)
    } finally {
      setExporting(false)
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">Loading report...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-sm text-center">
          <p className="text-red-500 text-sm">{error}</p>
          <Link to="/" className="btn-primary mt-4 inline-block text-sm">Go home</Link>
        </div>
      </div>
    )
  }

  if (!reporte) return null

  const tasa = reporte.total_evaluadores > 0
    ? Math.round((reporte.evaluadores_completados / reporte.total_evaluadores) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hidden print pages rendered off-screen */}
      <ReportPrint ref={printRef} reporte={reporte} />

      <div className="max-w-5xl mx-auto py-10 px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-1">
              Gap Analysis Report
            </p>
            <h1 className="text-2xl font-bold">{reporte.nombre}</h1>
            <p className="text-muted text-sm mt-1">{reporte.departamento}</p>
          </div>
          <Link to={`/dashboard/${subjectId}`} className="btn-secondary text-sm px-4 py-2 self-start">
            ← Back to dashboard
          </Link>
        </div>

        {/* Completion warning */}
        {reporte.evaluadores_completados === 0 && (
          <div className="card bg-cyan-50 border-cyan-200 mb-6">
            <p className="text-sm text-dark">
              No evaluator responses yet. The radar chart will appear once at least one evaluator
              completes the survey.
            </p>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Evaluators invited',   value: reporte.total_evaluadores        },
            { label: 'Responses received',   value: reporte.evaluadores_completados  },
            { label: 'Completion rate',      value: `${tasa}%`                       },
            { label: 'Dimensions assessed',  value: reporte.categorias.length        },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Radar chart */}
        {reporte.evaluadores_completados > 0 && (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold">Self vs External Perception</h2>
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="text-xs text-muted underline hover:text-dark transition-colors"
              >
                {showBreakdown ? 'Hide breakdown' : 'Show by relationship'}
              </button>
            </div>
            <RadarChart data={reporte.categorias} showBreakdown={showBreakdown} />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end mb-4">
          <button
            onClick={exportPDF}
            disabled={exporting}
            className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
          >
            {exporting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Generating PDF...
              </>
            ) : '↓ Download PDF'}
          </button>
        </div>

        {/* Category breakdown table */}
        <div className="card">
          <h2 className="font-bold mb-4">Scores by dimension</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 font-semibold text-dark">Dimension</th>
                  <th className="text-center py-2 font-semibold">Self</th>
                  <th className="text-center py-2 font-semibold">External</th>
                  <th className="text-center py-2 font-semibold">Gap</th>
                  <th className="text-center py-2 font-semibold text-orange-600">Manager</th>
                  <th className="text-center py-2 font-semibold text-blue-600">Colleague</th>
                  <th className="text-center py-2 font-semibold text-green-600">Friend</th>
                </tr>
              </thead>
              <tbody>
                {reporte.categorias.map(cat => {
                  const gap = cat.self_score != null && cat.external_score != null
                    ? (cat.self_score - cat.external_score).toFixed(2)
                    : null

                  const gapColor = gap == null
                    ? ''
                    : parseFloat(gap) > 0.5
                      ? 'text-red-500 font-semibold'
                      : parseFloat(gap) < -0.5
                        ? 'text-green-600 font-semibold'
                        : 'text-muted'

                  return (
                    <tr key={cat.categoria} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 font-medium text-dark">{cat.categoria}</td>
                      <td className="text-center py-3">{cat.self_score?.toFixed(2) ?? '—'}</td>
                      <td className="text-center py-3">{cat.external_score?.toFixed(2) ?? '—'}</td>
                      <td className={`text-center py-3 ${gapColor}`}>
                        {gap != null ? (parseFloat(gap) > 0 ? `+${gap}` : gap) : '—'}
                      </td>
                      <td className="text-center py-3 text-orange-600">{cat.score_manager?.toFixed(2) ?? '—'}</td>
                      <td className="text-center py-3 text-blue-600">{cat.score_colleague?.toFixed(2) ?? '—'}</td>
                      <td className="text-center py-3 text-green-600">{cat.score_friend?.toFixed(2) ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted mt-4">
            Gap = Self − External. Positive gap means you rate yourself higher than others do (potential blind spot).
          </p>
        </div>

      </div>
    </div>
  )
}
