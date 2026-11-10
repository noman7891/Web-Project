import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { listingService } from '../services/listingService'
import { Listing } from '../types'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { CampusMap } from '../components/common/CampusMap'
import { ClaimModal } from '../components/claims/ClaimModal'
import {
  MapPin,
  Calendar,
  User,
  Mail,
  ShieldCheck,
  Edit,
  Trash2,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  Info,
} from 'lucide-react'

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated, isAdmin } = useAuth()
  const { showToast } = useToast()

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [claimModalOpen, setClaimModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return
      try {
        const data = await listingService.getListingById(id)
        setListing(data)
      } catch (err) {
        showToast('Failed to load listing details.', 'error')
        navigate('/listings')
      } finally {
        setLoading(false)
      }
    }
    fetchListing()
  }, [id, navigate, showToast])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse" />
        <div className="h-80 bg-slate-200 rounded-3xl animate-pulse" />
      </div>
    )
  }

  if (!listing) return null

  const isOwner = user?.id === (listing.userId?._id || (listing.userId as any))
  const canModify = isOwner || isAdmin
  const isFound = listing.type === 'found'
  const isClaimed = listing.status === 'claimed'

  const formattedDate = new Date(listing.itemDate).toLocaleDateString('en-IE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) {
      return
    }
    setDeleting(true)
    try {
      await listingService.deleteListing(listing._id)
      showToast('Listing successfully deleted.', 'success')
      navigate('/listings')
    } catch (err) {
      showToast('Failed to delete listing.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Listings
      </button>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Item Image Preview */}
        {listing.image && (
          <div className="relative h-72 sm:h-96 w-full bg-slate-900 overflow-hidden">
            <img
              src={listing.image}
              alt={listing.title}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant={isFound ? 'found' : 'lost'}>{listing.type}</Badge>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  {listing.category}
                </span>
                {isClaimed && <Badge variant="claimed">Claimed / Resolved</Badge>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {listing.title}
              </h1>
            </div>

            {/* Action buttons (Claim / Edit / Delete) */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {isFound && !isClaimed && !isOwner && (
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Sparkles className="w-4 h-4" />}
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login', { state: { from: { pathname: `/listings/${listing._id}` } } })
                    } else {
                      setClaimModalOpen(true)
                    }
                  }}
                >
                  Claim This Item
                </Button>
              )}

              {canModify && (
                <>
                  <Link to={`/edit-listing/${listing._id}`}>
                    <Button variant="outline" size="md" leftIcon={<Edit className="w-4 h-4" />}>
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="md"
                    isLoading={deleting}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Description & Details
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Campus Location</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{listing.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Date {isFound ? 'Discovered' : 'Misplaced'}
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Reported By</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {listing.userId?.name || 'Campus Student'} ({listing.userId?.role || 'student'})
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Contact Information</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{listing.contactInfo}</p>
              </div>
            </div>
          </div>

          {/* Location Map (OpenStreetMap) */}
          <CampusMap locationName={listing.location} />

          {/* Notice Banner */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Security Recovery Policy:</span> All claimed property
              undergoes administrative verification before release. Bring your student ID card to the
              Campus Security desk at Castle House or Aungier Street when collecting approved items.
            </div>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      <ClaimModal
        listing={listing}
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        onSuccess={() => {
          showToast('Claim registered. Campus security has been notified.', 'success')
        }}
      />
    </div>
  )
}

