import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Compass,
  PlusCircle,
  FolderHeart,
  FileCheck2,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  LayoutDashboard,
} from 'lucide-react'
import { Button } from '../common/Button'

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  const navLinkClass = (path: string) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive(path)
        ? 'bg-brand-50 text-brand-700 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-navy-900 flex items-center justify-center text-white font-black text-xl shadow-md">
                CC
              </div>
              <div>
                <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                  CampusConnect
                  <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-brand-100 text-brand-800 rounded">
                    DBS
                  </span>
                </span>
                <span className="block text-[11px] text-slate-500 font-medium -mt-1">
                  Student Services Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/listings" className={navLinkClass('/listings')}>
              <Compass className="w-4 h-4" />
              Browse Listings
            </Link>

            {isAuthenticated && (
              <>
                <Link to="/create-listing" className={navLinkClass('/create-listing')}>
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  Report Item
                </Link>

                {!isAdmin ? (
                  <>
                    <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link to="/my-listings" className={navLinkClass('/my-listings')}>
                      <FolderHeart className="w-4 h-4" />
                      My Listings
                    </Link>
                    <Link to="/my-claims" className={navLinkClass('/my-claims')}>
                      <FileCheck2 className="w-4 h-4" />
                      My Claims
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/admin/dashboard" className={navLinkClass('/admin/dashboard')}>
                      <ShieldCheck className="w-4 h-4 text-brand-600" />
                      Admin Console
                    </Link>
                    <Link to="/admin/listings" className={navLinkClass('/admin/listings')}>
                      Moderate Listings
                    </Link>
                    <Link to="/admin/claims" className={navLinkClass('/admin/claims')}>
                      Review Claims
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          {/* Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                      {user.name}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                        isAdmin
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/listings"
            onClick={() => setMobileMenuOpen(false)}
            className={navLinkClass('/listings')}
          >
            <Compass className="w-4 h-4" />
            Browse Listings
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/create-listing"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClass('/create-listing')}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                Report Item
              </Link>
              {!isAdmin ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={navLinkClass('/dashboard')}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/my-listings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={navLinkClass('/my-listings')}
                  >
                    <FolderHeart className="w-4 h-4" />
                    My Listings
                  </Link>
                  <Link
                    to="/my-claims"
                    onClick={() => setMobileMenuOpen(false)}
                    className={navLinkClass('/my-claims')}
                  >
                    <FileCheck2 className="w-4 h-4" />
                    My Claims
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={navLinkClass('/admin/dashboard')}
                  >
                    <ShieldCheck className="w-4 h-4 text-brand-600" />
                    Admin Console
                  </Link>
                  <Link
                    to="/admin/listings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={navLinkClass('/admin/listings')}
                  >
                    Moderate Listings
                  </Link>
                  <Link
                    to="/admin/claims"
                    onClick={() => setMobileMenuOpen(false)}
                    className={navLinkClass('/admin/claims')}
                  >
                    Review Claims
                  </Link>
                </>
              )}

              <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-800">
                  {user?.name} ({user?.role})
                </div>
                <Button onClick={handleLogout} variant="ghost" size="sm" className="text-rose-600">
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <div className="pt-3 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">
                  Create Account
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

