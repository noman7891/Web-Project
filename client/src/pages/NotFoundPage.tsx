import React from 'react'
import { Link } from 'react-router-dom'
import { Compass, Home, Search } from 'lucide-react'
import { Button } from '../components/common/Button'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center font-black text-3xl mb-6 shadow-inner">
        404
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
        Page Not Found
      </h1>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        The requested university portal address does not exist or has been relocated by
        administration.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to="/">
          <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
            Return Home
          </Button>
        </Link>
        <Link to="/listings">
          <Button variant="outline" leftIcon={<Search className="w-4 h-4" />}>
            Search Catalog
          </Button>
        </Link>
      </div>
    </div>
  )
}

