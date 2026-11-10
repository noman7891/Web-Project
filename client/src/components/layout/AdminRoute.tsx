import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Loader2, ShieldAlert } from 'lucide-react'
import { Button } from '../common/Button'
import { Link } from 'react-router-dom'

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
        <p className="text-sm text-slate-500">Verifying administrative permissions...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Access Restricted</h2>
        <p className="mt-2 text-sm text-slate-600 max-w-md">
          This portal section requires elevated campus security administrator privileges. Ordinary
          student accounts cannot access administrative functions.
        </p>
        <div className="mt-6">
          <Link to="/dashboard">
            <Button variant="primary">Return to Student Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

