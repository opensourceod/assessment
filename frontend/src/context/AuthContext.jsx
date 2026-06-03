// Note: Form elements using this context should include proper <label> and placeholder attributes for accessibility.
import { createContext, useState, useEffect, useContext } from 'react'
import axios from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [cargando, setCargando] = useState(true)

  async function checkSession(activeToken) {
    if (!activeToken) {
      setUser(null)
      setCargando(false)
      return
    }
    try {
      const { data } = await axios.get('/api/users/me', {
        headers: { Authorization: `Bearer ${activeToken}` },
      })
      setUser(data)
    } catch (err) {
      console.error('Session validation failed:', err)
      logout()
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    checkSession(token)
  }, [token])

  async function login(email, password) {
    setCargando(true)
    try {
      const params = new URLSearchParams()
      params.append('username', email)
      params.append('password', password)

      const { data } = await axios.post('/api/auth/jwt/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })

      const accessToken = data.access_token
      localStorage.setItem('token', accessToken)
      setToken(accessToken)
      
      // Fetch user profile immediately
      const profileResponse = await axios.get('/api/users/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      setUser(profileResponse.data)
      return profileResponse.data
    } catch (err) {
      logout()
      throw err
    } finally {
      setCargando(false)
    }
  }

  async function register(nombre, email, departamento, password) {
    setCargando(true)
    try {
      await axios.post('/api/auth/register', {
        email,
        password,
        nombre,
        departamento,
      })
      // Automatically log in after registration
      return await login(email, password)
    } catch (err) {
      setCargando(false)
      throw err
    }
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, cargando, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
