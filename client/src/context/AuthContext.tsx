import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { User } from '../types'
import { authService, AuthResponse } from '../services/authService'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isStudent: boolean
  login: (credentials: { email: string; password: string }) => Promise<AuthResponse>
  register: (data: { name: string; email: string; password: string }) => Promise<AuthResponse>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cc_user')
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cc_token'))
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('cc_token')
    localStorage.removeItem('cc_user')
    setUser(null)
    setToken(null)
  }, [])

  // Verify and hydrate user profile on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('cc_token')
      if (storedToken) {
        try {
          const profile = await authService.getMe()
          setUser(profile)
          localStorage.setItem('cc_user', JSON.stringify(profile))
        } catch (error) {
          logout()
        }
      }
      setLoading(false)
    }

    initializeAuth()

    const handleAuthReset = () => {
      logout()
    }
    window.addEventListener('cc_auth_reset', handleAuthReset)
    return () => window.removeEventListener('cc_auth_reset', handleAuthReset)
  }, [logout])

  const login = async (credentials: { email: string; password: string }) => {
    const data = await authService.login(credentials)
    localStorage.setItem('cc_token', data.token)
    localStorage.setItem('cc_user', JSON.stringify(data.user))
    setUser(data.user)
    setToken(data.token)
    return data
  }

  const register = async (data: { name: string; email: string; password: string }) => {
    const res = await authService.register(data)
    localStorage.setItem('cc_token', res.token)
    localStorage.setItem('cc_user', JSON.stringify(res.user))
    setUser(res.user)
    setToken(res.token)
    return res
  }

  const refreshUser = async () => {
    try {
      const profile = await authService.getMe()
      setUser(profile)
      localStorage.setItem('cc_user', JSON.stringify(profile))
    } catch (err) {
      logout()
    }
  }

  const isAuthenticated = !!user && !!token
  const isAdmin = user?.role === 'admin'
  const isStudent = user?.role === 'student'

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isStudent,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

