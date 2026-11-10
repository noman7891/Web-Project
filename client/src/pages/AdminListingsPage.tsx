import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { listingService } from '../services/listingService'
import { Listing, PaginationMeta } from '../types'
import { useToast } from '../context/ToastContext'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { SkeletonTable } from '../components/common/SkeletonLoader'
import { EmptyState } from '../components/common/EmptyState'
import {
  Compass,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react'

export const AdminListingsPage: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [type, setType] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [page, setPage] = useState(1)
  const { showToast } = useToast()

  const fetchAdminListings = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listingService.getListings({
        search: search.trim() || undefined,
        type: (type as any) || undefined,
        status: status || undefined,
        page,
        limit: 15,
        sortBy: 'createdAt',
        order: 'desc',
      })
      setListings(data.listings)
      setPagination(data.pagination)
    } catch (err) {
      showToast('Failed to load listings for moderation.', 'error')
    } finally {
      setLoading(false)
    }
  }, [search, type, status, page, showToast])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAdminListings()
    }, 250)
    return () => clearTimeout(timer)
  }, [fetchAdminListings])

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`[Admin Action] Permanently delete listing "${title}"?`)) {
      return
    }
    try {
      await listingService.deleteListing(id)
      showToast(`Listing "${title}" removed by administrator.`, 'success')
      setListings((prev) => prev.filter((l) => l._id !== id))
    } catch (err) {
      showToast('Failed to delete listing.', 'error')
    }
  }

  const handleStatusChange = async (id: string, newStatus: 'active' | 'claimed' | 'archived') => {
    try {
      await listingService.updateListing(id, { status: newStatus })
      showToast(`Listing status updated to ${newStatus}.`, 'success')
      setListings((prev) =>
        prev.map((l) => (l._id === id ? { ...l, status: newStatus } : l))
      )
    } catch (err) {
      showToast('Failed to update listing status.', 'error')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-7 h-7 text-brand-600" />
            Campus Listings Moderation
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Review, edit, archive, or delete user-submitted lost and found items.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-sm">
          Total in system: <span className="font-bold text-slate-900">{pagination.total}</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search all listings by title, location, description..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value)
              setPage(1)
            }}
            className="text-xs rounded-xl border border-slate-300 py-2 px-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="text-xs rounded-xl border border-slate-300 py-2 px-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="claimed">Claimed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Moderation Table */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : listings.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Item Title</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Reported By</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status & Moderation</th>
                  <th className="py-3.5 px-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {listings.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                      <Link
                        to={`/listings/${item._id}`}
                        className="hover:text-brand-600 transition flex items-center gap-1.5 truncate"
                      >
                        <span className="truncate">{item.title}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={item.type === 'found' ? 'found' : 'lost'}>
                        {item.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]">
                      {item.location}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <p className="font-medium text-slate-900">{item.userId?.name || 'User'}</p>
                      <p className="text-[10px] text-slate-400">{item.userId?.email}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(item.itemDate).toLocaleDateString('en-IE')}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleStatusChange(item._id, e.target.value as any)
                        }
                        className="text-xs rounded-lg border border-slate-300 py-1 px-2 font-medium bg-white text-slate-800"
                      >
                        <option value="active">Active</option>
                        <option value="claimed">Claimed</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(item._id, item.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No listings found matching criteria"
          description="Clear active search queries or filters to see all campus listings."
        />
      )}

      {/* Pagination */}
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
    </div>
  )
}

