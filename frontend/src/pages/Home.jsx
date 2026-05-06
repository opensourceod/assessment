import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import axios from '../api/client'

export default function Home() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    departamento: '',
    form_type: 'most_360'
  })
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setCargando(true)
    setError(null)
    try {
      const { data } = await axios.post('/api/subjects/', form)
      // MOST 2.0: go directly to questions (no evaluators needed)
      // MOST 360: go through dashboard to invite evaluators
      if (data.form_type === 'most_2.0') {
        navigate(`/self/${data.self_token}`)
      } else {
        navigate(`/dashboard/${data.id}`)
      }
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
          MOST<br />Assessments
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Discover insights about your professional profile and interpersonal impact.
          Scalable, data-driven assessments for modern organizations.
        </p>
      </div>

      {/* How it works */}
      <div className="max-w-4xl mx-auto py-16 px-6 border-t border-gray-100">
        <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Register', desc: 'Select the assessment type and enter your details.' },
            { step: '02', title: 'Invite evaluators', desc: 'Add colleagues or friends (for 360) or proceed to your own self-assessment.' },
            { step: '03', title: 'See your report', desc: 'Once data is collected, view your interactive analysis and gap reports.' },
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
            Select your assessment type and enter your details to begin.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Form Type Selector */}
            <div className="flex flex-col gap-3 mb-2">
              <label className="label">Assessment Type</label>
              <div className="grid grid-cols-1 gap-3">
                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${form.form_type === 'most_360' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                  <input
                    type="radio"
                    name="form_type"
                    value="most_360"
                    checked={form.form_type === 'most_360'}
                    onChange={e => setForm({ ...form, form_type: e.target.value })}
                    className="mt-1 w-4 h-4 text-primary"
                  />
                  <div>
                    <p className="text-sm font-bold text-dark">360 Feedback</p>
                    <p className="text-xs text-muted mt-0.5">Comprehensive 360° feedback from peers and managers.</p>
                  </div>
                </label>
                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${form.form_type === 'most_2.0' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                  <input
                    type="radio"
                    name="form_type"
                    value="most_2.0"
                    checked={form.form_type === 'most_2.0'}
                    onChange={e => setForm({ ...form, form_type: e.target.value })}
                    className="mt-1 w-4 h-4 text-primary"
                  />
                  <div>
                    <p className="text-sm font-bold text-dark">MOST 2.0</p>
                    <p className="text-xs text-muted mt-0.5">Specialized for talent development.</p>
                  </div>
                </label>
              </div>
            </div>

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

            <button type="submit" className="btn-primary w-full mt-2 py-3" disabled={cargando}>
              {cargando ? 'Creating assessment...' : 'Get started →'}
            </button>
          </form>
        </div>
      </div>

    </div>
  )
}
