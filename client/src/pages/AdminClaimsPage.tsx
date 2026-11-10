import React, { useEffect, useState } from 'react'
import { claimService } from '../services/claimService'
import { Claim } from '../types'
import { useToast } from '../context/ToastContext'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Modal } from '../components/common/Modal'
import { SkeletonTable } from '../components/common/SkeletonLoader'
import { EmptyState } from '../components/common/EmptyState'
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldAlert,
  User,
  Calendar,
  MapPin,
  Clock,
} from 'lucide-react'

export const AdminClaimsPage: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [processing, setProcessing] = useState(false)
  const { showToast } = useToast()

  const fetchClaims = async () => {
    setLoading(true)
    try {
      const data = await claimService.getAllClaims(statusFilter === 'all' ? undefined : statusFilter)
      setClaims(data)
    } catch (err) {
      showToast('Failed to load claims for administrative review.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClaims()
  }, [statusFilter])

  const handleOpenReview = (claim: Claim) => {
    setSelectedClaim(claim)
    setAdminNote(claim.adminNote || '')
  }

  const handleReviewAction = async (status: 'approved' | 'rejected') => {
    if (!selectedClaim) return

    setProcessing(true)
    try {
      const updated = await claimService.updateClaimStatus(selectedClaim._id, {
        status,
        adminNote: adminNote.trim(),
      })
      showToast(`Claim successfully ${status}!`, 'success')
      setClaims((prev) =>
        prev.map((c) => (c._id === selectedClaim._id ? (updated as any) : c))
      )
      setSelectedClaim(null)
    } catch (err) {
      showToast('Failed to update claim review.', 'error')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-7 h-7 text-purple-600" />
            Property Ownership Claims Review
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Verify student explanations, validate physical belongings, approve collections, or decline
            unsubstantiated claims.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            statusFilter === 'pending'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Pending Review
        </button>
        <button
          onClick={() => setStatusFilter('approved')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            statusFilter === 'approved'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Approved Claims
        </button>
        <button
          onClick={() => setStatusFilter('rejected')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            statusFilter === 'rejected'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          Rejected
        </button>
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Claims
        </button>
      </div>

      {/* Claims Table */}
      {loading ? (
        <SkeletonTable rows={5} />
      ) : claims.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Claimed Item</th>
                  <th className="py-3.5 px-4">Claimant Student</th>
                  <th className="py-3.5 px-4">Ownership Proof Summary</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4">Review Status</th>
                  <th className="py-3.5 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {claims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="truncate">{claim.listingId?.title || 'Found Property'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <p className="font-bold">{claim.claimantId?.name || 'Student'}</p>
                      <p className="text-[10px] text-slate-400">{claim.claimantId?.email}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm">
                      <p className="line-clamp-2 italic text-slate-600">
                        "{claim.explanation}"
                      </p>
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(claim.createdAt).toLocaleDateString('en-IE')}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={claim.status}>{claim.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant={claim.status === 'pending' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleOpenReview(claim)}
                      >
                        {claim.status === 'pending' ? 'Review & Adjudicate' : 'View Resolution'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title={`No ${statusFilter === 'all' ? '' : statusFilter} claims currently in queue`}
          description="The claim queue is clear for this status filter."
        />
      )}

      {/* Review Modal Dialog */}
      <Modal
        isOpen={!!selectedClaim}
        onClose={() => setSelectedClaim(null)}
        title="Administrative Claim Adjudication"
        maxWidth="lg"
      >
        {selectedClaim && (
          <div className="space-y-5 text-sm">
            {/* Item summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Found Property:</span>
                <Badge variant={selectedClaim.listingId?.status || 'active'}>
                  Listing {selectedClaim.listingId?.status || 'active'}
                </Badge>
              </div>
              <h4 className="text-base font-bold text-slate-900">
                {selectedClaim.listingId?.title}
              </h4>
              <p className="text-xs text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Found at: {selectedClaim.listingId?.location}
              </p>
            </div>

            {/* Claimant Info */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-1 text-xs">
              <p className="font-bold text-slate-500 uppercase">Claimant Details:</p>
              <p className="text-sm font-bold text-slate-900">{selectedClaim.claimantId?.name}</p>
              <p className="text-slate-600">Email: {selectedClaim.claimantId?.email}</p>
              <p className="text-slate-400">
                Submitted on: {new Date(selectedClaim.createdAt).toLocaleString('en-IE')}
              </p>
            </div>

            {/* Claimant Explanation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Claimant's Proof of Ownership:
              </label>
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                {selectedClaim.explanation}
              </div>
            </div>

            {/* Admin Note Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Administrative Notes & Collection Instructions:
              </label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="e.g. Student ID verified. Please present Student Card at Castle House Security Desk to collect the property."
                className="w-full text-xs rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Decision Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedClaim(null)}
                disabled={processing}
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={processing}
                  leftIcon={<XCircle className="w-4 h-4" />}
                  onClick={() => handleReviewAction('rejected')}
                >
                  Reject Claim
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  isLoading={processing}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={() => handleReviewAction('approved')}
                >
                  Approve Claim & Mark Listing Claimed
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

