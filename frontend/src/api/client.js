/**
 * Centralized axios client.
 * In development, VITE_API_BASE_URL is empty so Vite's proxy handles /api/* routes.
 * In production (Vercel), VITE_API_BASE_URL points to the Railway backend URL.
 */
import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
})

export default client
