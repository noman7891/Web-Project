import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'lost' | 'found' | 'pending' | 'approved' | 'rejected' | 'active' | 'claimed' | 'archived' | 'neutral'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const styles = {
    lost: 'bg-amber-100 text-amber-800 border-amber-200',
    found: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-800 border-rose-200',
    active: 'bg-blue-100 text-blue-800 border-blue-200',
    claimed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    archived: 'bg-slate-100 text-slate-700 border-slate-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  }[variant]

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wider ${styles} ${className}`}
    >
      {children}
    </span>
  )
}

