import React, { useState, useEffect, useCallback } from 'react'
import { listingService } from '../services/listingService'
import { Listing, PaginationMeta, ListingCategory } from '../types'
import { ListingCard } from '../components/listings/ListingCard'
import { ClaimModal } from '../components/claims/ClaimModal'
import { SkeletonCard } from '../components/common/SkeletonLoader'
import { EmptyState } from '../components/common/EmptyState'
import { Button } from '../components/common/Button'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Compass,
} from 'lucide-react'

const CATEGORIES: ListingCategory[] = [
  'Electronics',
  'Cards & ID',
  'Keys',
  'Books & Study',
  'Clothing',
  'Bags',
  'Jewelry & Accessories',
  'Other',
]

export const ListingsPage: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [listings, setListings] = useState<Listing[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [loading, setLoading] = useState(true)

  // Filters state
  const [search, setSearch] = useState('')
  const [type, setType] = useState<'all' | 'lost' | 'found'>('all')
  const [category, setCategory] = useState<string>('')
  const [status, setStatus] = useState<string>('active')
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [order, setOrder] = useState<'desc' | 'asc'>('desc')
  const [page, setPage] = useState(1)

  // Claim modal state
  const [selectedClaimListing, setSelectedClaimListing] = useState<Listing | null>(null)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listingService.getListings({
        search: search.trim() || undefined,
        type: type === 'all' ? undefined : type,
        category: category || undefined,
        status: status || undefined,
        sortBy,
        order,
        page,
        limit: 12,
      })
      setListings(data.listings)
      setPagination(data.pagination)
    } catch (err) {
      console.error('Failed to fetch listings', err)
    } finally {
      setLoading(false)
    }
  }, [search, type, category, status, sortBy, order, page])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings()
    }, 250) // 250ms debounce for search input
    return () => clearTimeout(timer)
  }, [fetchListings])

  const handleClaimClick = (listing: Listing) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/listings/${listing._id}` } } })
      return
    }
    setSelectedClaimListing(listing)
  }

  const resetFilters = () => {
    setSearch('')
    setType('all')
    setCategory('')
    setStatus('active')
    setPage(1)
  }

  const hasActiveFilters = search || type !== 'all' || category || status !== 'active'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-7 h-7 text-brand-600" />
            Campus Lost & Found Catalog
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Search, filter, and report misplaced belongings across all Dublin Business School
            campuses.
          </p>
        </div>

        {/* Total Count Badge */}
        <div className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-sm self-start md:self-auto">
          Showing <span className="text-brand-600 font-bold">{listings.length}</span> of{' '}
          <span className="font-bold">{pagination.total}</span> items
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        {/* Search input & Type Buttons */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search by keywords, location, or item name (e.g. AirPods, Keys, Castle House)..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Type Toggle: All | Lost | Found */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 shrink-0">
            <button
              onClick={() => {
                setType('all')
                setPage(1)
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                type === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => {
                setType('lost')
                setPage(1)
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                type === 'lost'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lost Only
            </button>
            <button
              onClick={() => {
                setType('found')
                setPage(1)
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                type === 'found'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Found Only
            </button>
          </div>
        </div>

        {/* Filter Dropdowns row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
            <span>Filters:</span>
          </div>

          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              setPage(1)
            }}
            className="text-xs rounded-xl border border-slate-300 py-1.5 px-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="text-xs rounded-xl border border-slate-300 py-1.5 px-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="active">Active Only</option>
            <option value="claimed">Claimed / Resolved</option>
            <option value="">All Statuses</option>
          </select>

          {/* Sort By */}
          <select
            value={`${sortBy}-${order}`}
            onChange={(e) => {
              const [sBy, ord] = e.target.value.split('-')
              setSortBy(sBy)
              setOrder(ord as 'asc' | 'desc')
              setPage(1)
            }}
            className="text-xs rounded-xl border border-slate-300 py-1.5 px-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 ml-auto"
          >
            <option value="createdAt-desc">Newest Published</option>
            <option value="createdAt-asc">Oldest Published</option>
            <option value="itemDate-desc">Most Recent Date</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded hover:bg-rose-50 transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((item) => (
            <ListingCard key={item._id} listing={item} onClaim={handleClaimClick} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No campus listings matched your criteria"
          description="Try broadening your search keywords, clearing selected category filters, or report this item if you lost or found it."
          actionLabel="Report Lost or Found Item"
          onAction={() => navigate('/create-listing')}
        />
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          <span className="text-xs font-semibold text-slate-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>
        </div>
      )}

      {/* Claim Modal */}
      <ClaimModal
        listing={selectedClaimListing}
        isOpen={!!selectedClaimListing}
        onClose={() => setSelectedClaimListing(null)}
        onSuccess={() => {
          fetchListings()
        }}
      />
    </div>
  )
}

