import axios, { AxiosError } from 'axios'

// Base URL falls back to relative '/api' in development (proxied by Vite)
const rawBaseUrl = import.meta.env.VITE_API_URL || '/api'
const API_BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cc_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle unauthenticated responses globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      // If unauthorized on a protected route, clear stale token
      if (localStorage.getItem('cc_token')) {
        localStorage.removeItem('cc_token')
        localStorage.removeItem('cc_user')
        window.dispatchEvent(new Event('cc_auth_reset'))
      }
    }
    return Promise.reject(error)
  }
)

export const extractErrorMessage = (error: any): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message
    }
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      return error.response.data.errors.map((e: any) => e.message).join(', ')
    }
    if (error.message) {
      return error.message
    }
  }
  return error?.message || 'An unexpected error occurred. Please try again.'
}

