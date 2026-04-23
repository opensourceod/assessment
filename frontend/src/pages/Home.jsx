import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import axios from '../api/client'

export default function Home() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', email: '', departamento: '' })
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setCargando(true)
    setError(null)
    try {
      const { data } = await axios.post('/api/subjects/', form)
      navigate(`/dashboard/${data.id}`)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Something went wrong. Please try again.')
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-dark text-white py-20 px-6 text-center">
        <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">
          Open Source OD Framework
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          360 MOST<br/>Assessment
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Discover the gap between how you see yourself and how others see you.
          Invite your manager, colleagues, and friends to complete the assessment.
        </p>
      </div>

      {/* How it works */}
      <div className="max-w-4xl mx-auto py-16 px-6">
        <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Register', desc: 'Enter your name, email, and department to create your assessment.' },
            { step: '02', title: 'Invite evaluators', desc: 'Add your manager, colleagues, and friends. They receive an email with a unique survey link.' },
            { step: '03', title: 'See your report', desc: 'Once responses come in, view your Gap Analysis radar chart showing blind spots and strengths.' },
          ].map(item => (
            <div key={item.step} className="card text-center">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 font-bold text-dark">
                {item.step}
              </div>
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Registration form */}
      <div className="bg-white border-t border-gray-100 py-16 px-6">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-2 text-center">Start your assessment</h2>
          <p className="text-muted text-sm text-center mb-8">
            You'll receive a self-assessment link by email.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="label">Full name</label>
              <input
                className="input"
                placeholder="Jane Doe"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="jane@company.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Department</label>
              <input
                className="input"
                placeholder="e.g. Engineering, Marketing..."
                value={form.departamento}
                onChange={e => setForm({ ...form, departamento: e.target.value })}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button type="submit" className="btn-primary w-full" disabled={cargando}>
              {cargando ? 'Creating assessment...' : 'Get started →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
