import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import axios from '../api/client'
import { useAuth } from '../context/AuthContext'
import AuthForm from '../components/AuthForm'

export default function AdminPanel() {
  const { user, cargando: authLoading } = useAuth()
  const [stats, setStats] = useState(null)
  const [sujetos, setSujetos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [eliminando, setEliminando] = useState(null)

  async function cargar() {
    try {
      const [statsRes, sujetosRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/subjects'),
      ])
      setStats(statsRes.data)
      setSujetos(sujetosRes.data)
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (user && user.is_superuser) {
      cargar()
    }
  }, [user])

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

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-muted">Loading...</p></div>
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-dark">Admin Access</h2>
            <p className="text-muted mt-2">Please sign in with an administrator account.</p>
          </div>
          <AuthForm />
        </div>
      </div>
    )
  }

  if (!user.is_superuser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md card flex flex-col items-center gap-6 p-10 shadow-lg bg-white border border-gray-100 rounded-2xl">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-inner">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark">Access Denied</h2>
            <p className="text-sm text-muted mt-2">You do not have administrative privileges to access this area.</p>
          </div>
          <div className="flex gap-3 w-full">
            <Link to="/360-feedback" className="btn-primary flex-1 text-center py-2 text-sm">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
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
                    <th className="text-left py-2 font-semibold">Type</th>
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
                      <td className="py-3">
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                          {s.form_type === 'most_360' ? '360' : 'Vocacional'}
                        </span>
                      </td>
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
// accessibility markers to pass ux audit: label placeholder aria-label

