import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminService } from '../services/adminService'
import { DashboardStats } from '../types'
import { useToast } from '../context/ToastContext'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { SkeletonCard } from '../components/common/SkeletonLoader'
import {
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  Clock,
  ExternalLink,
} from 'lucide-react'

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { showToast } = useToast()

  const loadData = async () => {
    try {
      const [statsData, usersData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getUsers(),
      ])
      setStats(statsData)
      setUsers(usersData)
    } catch (err) {
      showToast('Failed to load administrator statistics and user directory.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleToggleUserStatus = async (userId: string, currentActive: boolean) => {
    setActionLoading(userId)
    try {
      const targetState = !currentActive
      await adminService.updateUserStatus(userId, targetState)
      showToast(`User status updated to ${targetState ? 'Active' : 'Suspended'}.`, 'success')
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: targetState } : u))
      )
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to update user status.', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-20 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Banner */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl border border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Administrative Security Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Campus Management Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time campus-wide metrics, active claims moderation queue, and listing governance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/claims">
            <Button
              variant="primary"
              size="md"
              className="bg-purple-600 hover:bg-purple-700"
              leftIcon={<FileCheck2 className="w-4 h-4" />}
            >
              Review Claims ({stats.claims.pending})
            </Button>
          </Link>
          <Link to="/admin/listings">
            <Button
              variant="outline"
              size="md"
              className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
              leftIcon={<Compass className="w-4 h-4" />}
            >
              Manage Listings
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Claims Queue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pending Claims
            </p>
            <p className="text-3xl font-black text-purple-600 mt-1">{stats.claims.pending}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Awaiting security review</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Total Campus Listings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Listings
            </p>
            <p className="text-3xl font-black text-brand-600 mt-1">{stats.listings.total}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {stats.listings.active} active ({stats.listings.lost} lost / {stats.listings.found} found)
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
        </div>

        {/* Claimed / Recovered Items */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Resolved Property
            </p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{stats.listings.claimed}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Returned to genuine owner</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Registered Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Campus Users
            </p>
            <p className="text-3xl font-black text-slate-800 mt-1">{stats.users.total}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{stats.users.students} registered students</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Claims & Recent Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Claims awaiting moderation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-purple-600" />
              Recent Claims Activity
            </h2>
            <Link
              to="/admin/claims"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Full Queue <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {stats.recentClaims.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {stats.recentClaims.map((claim) => (
                <div key={claim._id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {claim.listingId?.title || 'Found Item'}
                      </span>
                      <Badge variant={claim.status}>{claim.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Claimant: <span className="font-semibold text-slate-700">{claim.claimantId?.name}</span> ({claim.claimantId?.email})
                    </p>
                    <p className="text-xs text-slate-600 italic line-clamp-1 mt-1">
                      "{claim.explanation}"
                    </p>
                  </div>
                  <Link to="/admin/claims">
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No recent claims submitted.</p>
          )}
        </div>

        {/* Recent Listings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-brand-600" />
              Latest Campus Listings
            </h2>
            <Link
              to="/admin/listings"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Moderate All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {stats.recentListings.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {stats.recentListings.map((listing) => (
                <div key={listing._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={listing.type === 'found' ? 'found' : 'lost'}>
                        {listing.type}
                      </Badge>
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {listing.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {listing.location} • By {listing.userId?.name || 'Student'}
                    </p>
                  </div>
                  <Link to={`/listings/${listing._id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No recent listings published.</p>
          )}
        </div>
      </div>

      {/* User Management Directory */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-600" />
              Campus User Directory & Account Governance
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review student accounts, check registration dates, and manage active status.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-xl">
            {users.length} Total Users
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {users.map((u) => {
                const isAdminAccount = u.role === 'admin'
                return (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isAdminAccount
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString('en-IE')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          u.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.isActive !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!isAdminAccount ? (
                        <button
                          onClick={() => handleToggleUserStatus(u._id, u.isActive !== false)}
                          disabled={actionLoading === u._id}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                            u.isActive !== false
                              ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {actionLoading === u._id
                            ? 'Updating...'
                            : u.isActive !== false
                            ? 'Suspend'
                            : 'Activate'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Protected</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

