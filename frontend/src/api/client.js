/**
 * Centralized axios client.
 * In development, VITE_API_BASE_URL is empty so Vite's proxy handles /api/* routes.
 * In production (Vercel), VITE_API_BASE_URL points to the Railway backend URL.
 */
import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
})

// Request interceptor to attach JWT token if present
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default client
