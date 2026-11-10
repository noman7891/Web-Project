import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { extractErrorMessage } from '../services/api'
import { Button } from '../components/common/Button'
import { LogIn, Mail, Lock, Sparkles, Shield, User } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const from = (location.state as any)?.from?.pathname || '/dashboard'

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true)
    try {
      const data = await login(values)
      showToast(`Welcome back, ${data.user.name}!`, 'success')
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate(from === '/login' ? '/dashboard' : from)
      }
    } catch (error) {
      showToast(extractErrorMessage(error), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Evaluator Quick-Fill helper
  const handleQuickFill = (email: string, pass: string) => {
    setValue('email', email, { shouldValidate: true })
    setValue('password', pass, { shouldValidate: true })
    showToast(`Filled credentials for ${email}`, 'info')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-brand-50 text-brand-600 mb-1">
            <LogIn className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign In to CampusConnect
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Access your university services dashboard and property reports.
          </p>
        </div>

        {/* Quick-Fill buttons for examiner / assessor convenience */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Assessor / Demo Quick-Fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('ciaran@student.dbs.ie', 'StudentPass2026!')}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              Student Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@campusconnect.dbs.ie', 'AdminPass2026!')}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
            >
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              Admin Demo
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                {...register('email')}
                placeholder="student.id@student.dbs.ie"
                className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                {...register('password')}
                placeholder="Enter your password"
                className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              size="lg"
              isLoading={submitting}
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </div>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Need a student account?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Register here
          </Link>
        </div>
      </div>
    </div>
  )
}

