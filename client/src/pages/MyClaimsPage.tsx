import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { claimService } from '../services/claimService'
import { Claim } from '../types'
import { useToast } from '../context/ToastContext'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { SkeletonCard } from '../components/common/SkeletonLoader'
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldAlert,
  MapPin,
  Calendar,
} from 'lucide-react'

export const MyClaimsPage: React.FC = () => {
  const [claims, setMyClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const data = await claimService.getMyClaims()
        setMyClaims(data)
      } catch (err) {
        showToast('Failed to load your claims history.', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchClaims()
  }, [showToast])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FileCheck2 className="w-7 h-7 text-purple-600" />
          My Submitted Claims
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Track real-time administrative review status and collection instructions for your
          claimed items.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : claims.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {claims.map((claim) => {
            const isApproved = claim.status === 'approved'
            const isRejected = claim.status === 'rejected'
            const isPending = claim.status === 'pending'

            return (
              <div
                key={claim._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Status & Date */}
                  <div className="flex items-center justify-between">
                    <Badge variant={claim.status}>{claim.status}</Badge>
                    <span className="text-xs text-slate-400">
                      Submitted on {new Date(claim.createdAt).toLocaleDateString('en-IE')}
                    </span>
                  </div>

                  {/* Item info header */}
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      {claim.listingId?.image ? (
                        <img
                          src={claim.listingId.image}
                          alt={claim.listingId.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                          Item
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {claim.listingId?.title || 'Found Property'}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {claim.listingId?.location}
                      </p>
                    </div>
                  </div>

                  {/* Student explanation */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                    <p className="font-bold text-slate-500 uppercase text-[10px] tracking-wider mb-1">
                      Your Proof of Ownership:
                    </p>
                    <p className="text-slate-700 italic leading-relaxed whitespace-pre-line">
                      "{claim.explanation}"
                    </p>
                  </div>

                  {/* Administrative Note Banner */}
                  {claim.adminNote ? (
                    <div
                      className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                        isApproved
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : isRejected
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        {isApproved && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        {isRejected && <XCircle className="w-4 h-4 text-rose-600" />}
                        <span>Campus Security Official Note:</span>
                      </div>
                      <p>{claim.adminNote}</p>
                    </div>
                  ) : (
                    isPending && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-xs text-amber-900">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Under initial security verification. Please check back within 24h.</span>
                      </div>
                    )
                  )}
                </div>

                {/* Footer action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Ref ID: {claim._id.substring(0, 8)}...
                  </span>
                  {claim.listingId?._id && (
                    <Link
                      to={`/listings/${claim.listingId._id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition"
                    >
                      View Listing Details <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          title="No claims submitted yet"
          description="If you see an item in the catalog that belongs to you, open its details page and click 'Claim Item' to submit ownership proof."
          actionLabel="Browse Found Items"
          onAction={() => (window.location.href = '/listings?type=found')}
        />
      )}
    </div>
  )
}

