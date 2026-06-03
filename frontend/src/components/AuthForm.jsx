import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthForm() {
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    departamento: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        await login(form.email, form.password)
      } else {
        await register(form.nombre, form.email, form.departamento, form.password)
      }
    } catch (err) {
      console.error(err)
      setError(
        err?.response?.data?.detail ||
        'Authentication failed. Please check your details.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50">
      {/* Tab Selectors */}
      <div className="flex bg-gray-100 p-1 rounded-full mb-8">
        <button
          type="button"
          onClick={() => { setIsLogin(true); setError(null); }}
          className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${isLogin ? 'bg-primary text-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setIsLogin(false); setError(null); }}
          className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${!isLogin ? 'bg-primary text-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Register
        </button>
      </div>

      <h2 className="text-2xl font-bold text-center mb-2">
        {isLogin ? 'Welcome Back!' : 'Create Your Account'}
      </h2>
      <p className="text-sm text-muted text-center mb-8">
        {isLogin
          ? 'Enter your credentials to access your 360 dashboard.'
          : 'Sign up to set up your 360 assessment.'}

      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {!isLogin && (
          <>
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
              <label className="label">Department</label>
              <input
                className="input"
                placeholder="e.g. Engineering, Sales..."
                value={form.departamento}
                onChange={e => setForm({ ...form, departamento: e.target.value })}
                required
              />
            </div>
          </>
        )}

        <div>
          <label className="label">Email address</label>
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
          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-1 text-center bg-red-50 py-2 px-3 rounded-lg border border-red-100">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn-primary w-full mt-4 py-3 font-semibold text-sm"
          disabled={loading}
        >
          {loading
            ? 'Processing...'
            : isLogin
              ? 'Sign In →'
              : 'Register and Begin →'}
        </button>
      </form>
    </div>
  )
}
