import React from 'react'
import { Link } from 'react-router-dom'
import { Listing } from '../../types'
import { Badge } from '../common/Badge'
import { MapPin, Calendar, User, ArrowRight, Sparkles } from 'lucide-react'

export interface ListingCardProps {
  listing: Listing
  onClaim?: (listing: Listing) => void
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onClaim }) => {
  const isFound = listing.type === 'found'
  const isClaimed = listing.status === 'claimed'

  const formattedDate = new Date(listing.itemDate).toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  // Fallback image based on category
  const defaultImages: Record<string, string> = {
    Electronics:
      'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
    'Cards & ID':
      'https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&w=600&q=80',
    Keys:
      'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
    'Books & Study':
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    Clothing:
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
    Bags:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    'Jewelry & Accessories':
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
    Other:
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80',
  }

  const imageUrl = listing.image || defaultImages[listing.category] || defaultImages.Other

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full">
      {/* Thumbnail Banner */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

        {/* Badges on Top */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge variant={isFound ? 'found' : 'lost'}>
            {listing.type}
          </Badge>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur text-slate-800 shadow-sm">
            {listing.category}
          </span>
        </div>

        {/* Status on Right */}
        {isClaimed && (
          <div className="absolute top-3 right-3">
            <Badge variant="claimed">Resolved / Claimed</Badge>
          </div>
        )}

        {/* Date on image bottom */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-white/90 font-medium">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition line-clamp-1">
            {listing.title}
          </h3>

          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {listing.description}
          </p>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{listing.location}</span>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <User className="w-3 h-3 text-slate-400" />
            <span className="truncate max-w-[120px]">{listing.userId?.name || 'Campus Student'}</span>
          </div>

          <div className="flex items-center gap-2">
            {isFound && !isClaimed && onClaim && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  onClaim(listing)
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
              >
                <Sparkles className="w-3 h-3" />
                Claim
              </button>
            )}

            <Link
              to={`/listings/${listing._id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition"
            >
              Details
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

