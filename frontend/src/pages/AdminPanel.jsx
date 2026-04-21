import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import axios from 'axios'

export default function AdminPanel() {
  const [stats, setStats] = useState(null)
  const [sujetos, setSujetos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [eliminando, setEliminando] = useState(null)

  async function cargar() {
    const [statsRes, sujetosRes] = await Promise.all([
      axios.get('/api/admin/stats'),
      axios.get('/api/admin/subjects'),
    ])
    setStats(statsRes.data)
    setSujetos(sujetosRes.data)
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  async function eliminar(id, nombre) {
    if (!window.confirm(`Delete ${nombre} and all their data? This cannot be undone.`)) return
    setEliminando(id)
    try {
      await axios.delete(`/api/admin/subjects/${id}`)
      await cargar()
    } catch {
      alert('Failed to delete subject.')
    } finally {
      setEliminando(null)
    }
  }

  if (cargando) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-muted">Loading...</p></div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto py-10 px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <span className="text-xs text-muted bg-white border border-gray-200 px-3 py-1 rounded">Local access</span>
        </div>

        {/* Global stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total subjects', value: stats.total_sujetos },
            { label: 'Total evaluators', value: stats.total_evaluadores },
            { label: 'Responses received', value: stats.evaluadores_completados },
            { label: 'Completion rate', value: `${stats.tasa_completitud}%` },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Subjects table */}
        <div className="card">
          <h2 className="font-bold mb-4">All subjects ({sujetos.length})</h2>
          {sujetos.length === 0 ? (
            <p className="text-muted text-sm">No subjects yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 font-semibold">Name</th>
                    <th className="text-left py-2 font-semibold">Email</th>
                    <th className="text-left py-2 font-semibold">Department</th>
                    <th className="text-center py-2 font-semibold">Self</th>
                    <th className="text-center py-2 font-semibold">Created</th>
                    <th className="text-center py-2 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sujetos.map(s => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 font-medium">{s.nombre}</td>
                      <td className="py-3 text-muted">{s.email}</td>
                      <td className="py-3 text-muted">{s.departamento}</td>
                      <td className="text-center py-3">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          s.self_completado ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {s.self_completado ? 'Done' : 'Pending'}
                        </span>
                      </td>
                      <td className="text-center py-3 text-muted">
                        {new Date(s.creado_en).toLocaleDateString()}
                      </td>
                      <td className="text-center py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Link to={`/dashboard/${s.id}`}
                            className="text-xs text-dark underline hover:text-primary">
                            Dashboard
                          </Link>
                          <Link to={`/report/${s.id}`}
                            className="text-xs text-dark underline hover:text-primary">
                            Report
                          </Link>
                          <button
                            onClick={() => eliminar(s.id, s.nombre)}
                            disabled={eliminando === s.id}
                            className="text-xs text-red-500 underline hover:text-red-700 disabled:opacity-50">
                            {eliminando === s.id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
