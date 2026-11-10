import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listingService } from '../services/listingService'
import { claimService } from '../services/claimService'
import { Listing, Claim } from '../types'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { SkeletonCard } from '../components/common/SkeletonLoader'
import {
  Search,
  PlusCircle,
  FileCheck2,
  FolderHeart,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
} from 'lucide-react'

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [myListings, setMyListings] = useState<Listing[]>([])
  const [myClaims, setMyClaims] = useState<Claim[]>([])
  const [campusStats, setCampusStats] = useState({ totalLost: 0, totalFound: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [listingsData, claimsData, lostData, foundData] = await Promise.all([
          listingService.getMyListings(),
          claimService.getMyClaims(),
          listingService.getListings({ type: 'lost', limit: 1 }),
          listingService.getListings({ type: 'found', limit: 1 }),
        ])

        setMyListings(listingsData)
        setMyClaims(claimsData)
        setCampusStats({
          totalLost: lostData.pagination.total,
          totalFound: foundData.pagination.total,
        })
      } catch (err) {
        console.error('Failed to load student dashboard data', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="h-20 bg-slate-200 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const activeMyListingsCount = myListings.filter((l) => l.status === 'active').length
  const pendingMyClaimsCount = myClaims.filter((c) => c.status === 'pending').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-brand-900 via-navy-900 to-slate-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
            Student Services Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Track your published lost & found notices and active verification claims.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/create-listing">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4 text-emerald-300" />}
            >
              Report Item
            </Button>
          </Link>
          <Link to="/listings">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              leftIcon={<Search className="w-4 h-4" />}
            >
              Search All
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Lost */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Campus Lost Items
            </p>
            <p className="text-2xl font-black text-amber-600 mt-1">{campusStats.totalLost}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Currently active reports</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <HelpCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Total Found */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Campus Found Items
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{campusStats.totalFound}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Awaiting rightful owner</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* My Active Listings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              My Active Listings
            </p>
            <p className="text-2xl font-black text-brand-600 mt-1">{activeMyListingsCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{myListings.length} total posted</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <FolderHeart className="w-6 h-6" />
          </div>
        </div>

        {/* My Submitted Claims */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              My Claims
            </p>
            <p className="text-2xl font-black text-purple-600 mt-1">{myClaims.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {pendingMyClaimsCount} under security review
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: My Active Listings & Claims Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: My Recent Listings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FolderHeart className="w-5 h-5 text-brand-600" />
              My Active Listings
            </h2>
            <Link
              to="/my-listings"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Manage All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {myListings.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {myListings.slice(0, 4).map((item) => (
                <div key={item._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={item.type === 'found' ? 'found' : 'lost'}>
                        {item.type}
                      </Badge>
                      <h4 className="text-sm font-semibold text-slate-900 truncate">
                        {item.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {item.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{' '}
                        {new Date(item.itemDate).toLocaleDateString('en-IE')}
                      </span>
                    </div>
                  </div>
                  <Link to={`/listings/${item._id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              You haven't reported any lost or found items yet.{' '}
              <Link to="/create-listing" className="text-brand-600 font-semibold hover:underline">
                Create your first report.
              </Link>
            </div>
          )}
        </div>

        {/* Right: My Claims Tracking */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-purple-600" />
              My Claims Tracking
            </h2>
            <Link
              to="/my-claims"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View All Claims <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {myClaims.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {myClaims.slice(0, 4).map((claim) => (
                <div key={claim._id} className="py-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900 truncate max-w-[240px]">
                      {claim.listingId?.title || 'Found Item'}
                    </span>
                    <Badge variant={claim.status}>{claim.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 italic">
                    "{claim.explanation}"
                  </p>
                  {claim.adminNote && (
                    <div className="text-[11px] bg-slate-50 p-2 rounded-lg text-slate-600 border border-slate-200">
                      <strong>Security Note:</strong> {claim.adminNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              You haven't submitted any ownership claims yet.{' '}
              <Link to="/listings" className="text-brand-600 font-semibold hover:underline">
                Browse found items to claim.
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

