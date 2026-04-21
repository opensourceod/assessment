import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import axios from 'axios'

const RELACIONES = [
  { value: 'manager', label: 'Manager / Supervisor' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'friend', label: 'Friend' },
]

export default function SubjectDashboard() {
  const { subjectId } = useParams()
  const [sujeto, setSujeto] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [form, setForm] = useState({ nombre: '', email: '', relacion: 'colleague', departamento: '' })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(null)

  async function cargar() {
    try {
      const { data } = await axios.get(`/api/subjects/${subjectId}`)
      setSujeto(data)
    } catch {
      setError('Could not load dashboard.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [subjectId])

  async function agregarEvaluador(e) {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    setExito(null)
    try {
      await axios.post(`/api/subjects/${subjectId}/evaluators`, form)
      setExito(`Invitation sent to ${form.email}!`)
      setForm({ nombre: '', email: '', relacion: 'colleague', departamento: '' })
      await cargar()
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to add evaluator.')
    } finally {
      setEnviando(false)
    }
  }

  const completados = sujeto?.evaluadores?.filter(e => e.completado).length ?? 0
  const total = sujeto?.evaluadores?.length ?? 0

  if (cargando) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto py-10 px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">{sujeto?.nombre}'s Dashboard</h1>
            <p className="text-muted text-sm mt-1">{sujeto?.departamento} · {sujeto?.email}</p>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={cargar}
              title="Refresh"
              className="btn-ghost text-sm px-4 py-2 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M3 21v-5h5"/>
              </svg>
              Refresh
            </button>
            {sujeto?.self_completado ? (
              <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                ✓ Self-assessment done
              </span>
            ) : (
              <Link
                to={`/self/${sujeto?.self_token}`}
                className="btn-primary text-sm px-4 py-2"
              >
                Complete self-assessment →
              </Link>
            )}
            {completados > 0 && (
              <Link
                to={`/report/${subjectId}`}
                className="btn-secondary text-sm px-4 py-2"
              >
                View report →
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Evaluators invited', value: total },
            { label: 'Responses received', value: completados },
            { label: 'Completion rate', value: total > 0 ? `${Math.round(completados / total * 100)}%` : '—' },
          ].map(stat => (
            <div key={stat.label} className="card text-center">
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Add evaluator form */}
          <div className="card">
            <h2 className="font-bold mb-4">Invite an evaluator</h2>
            <form onSubmit={agregarEvaluador} className="flex flex-col gap-4">
              <div>
                <label className="label">Full name</label>
                <input className="input" placeholder="John Smith" value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" placeholder="john@company.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="label">Relationship</label>
                <select className="input" value={form.relacion}
                  onChange={e => setForm({ ...form, relacion: e.target.value })}>
                  {RELACIONES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Department (optional)</label>
                <input className="input" placeholder="e.g. HR, Finance..." value={form.departamento}
                  onChange={e => setForm({ ...form, departamento: e.target.value })} />
              </div>

              {exito && <p className="text-green-600 text-sm">{exito}</p>}
              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button type="submit" className="btn-primary" disabled={enviando}>
                {enviando ? 'Sending...' : 'Send invitation →'}
              </button>
            </form>
          </div>

          {/* Evaluators list */}
          <div className="card">
            <h2 className="font-bold mb-4">Evaluators ({total})</h2>
            {sujeto?.evaluadores?.length === 0 ? (
              <p className="text-muted text-sm">No evaluators yet. Invite someone to get started.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {sujeto.evaluadores.map(ev => (
                  <li key={ev.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{ev.nombre}</p>
                      <p className="text-xs text-muted">{ev.email} · {ev.relacion}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      ev.completado
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {ev.completado ? 'Done' : 'Pending'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
