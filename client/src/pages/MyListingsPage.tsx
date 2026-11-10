import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listingService } from '../services/listingService'
import { Listing } from '../types'
import { useToast } from '../context/ToastContext'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { SkeletonTable } from '../components/common/SkeletonLoader'
import {
  FolderHeart,
  PlusCircle,
  Edit,
  Trash2,
  ExternalLink,
  MapPin,
  Calendar,
} from 'lucide-react'

export const MyListingsPage: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all')
  const { showToast } = useToast()
  const navigate = useNavigate()

  const fetchMyListings = async () => {
    setLoading(true)
    try {
      const data = await listingService.getMyListings()
      setListings(data)
    } catch (err) {
      showToast('Failed to load your listings.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyListings()
  }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }
    try {
      await listingService.deleteListing(id)
      showToast('Listing removed successfully.', 'success')
      setListings((prev) => prev.filter((item) => item._id !== id))
    } catch (err) {
      showToast('Failed to delete listing.', 'error')
    }
  }

  const filteredListings = listings.filter((item) => {
    if (filterType === 'all') return true
    return item.type === filterType
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderHeart className="w-7 h-7 text-brand-600" />
            My Published Listings
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Manage your personal lost and found reports. Update status when items are recovered.
          </p>
        </div>

        <Link to="/create-listing">
          <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Create Report
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filterType === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All ({listings.length})
        </button>
        <button
          onClick={() => setFilterType('lost')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filterType === 'lost'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Lost Items ({listings.filter((l) => l.type === 'lost').length})
        </button>
        <button
          onClick={() => setFilterType('found')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filterType === 'found'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Found Items ({listings.filter((l) => l.type === 'found').length})
        </button>
      </div>

      {/* Listings Table / Cards */}
      {loading ? (
        <SkeletonTable rows={4} />
      ) : filteredListings.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Item Details</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Campus Location</th>
                  <th className="py-3.5 px-4">Date Reported</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredListings.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400 shrink-0">
                            Item
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">{item.title}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={item.type === 'found' ? 'found' : 'lost'}>
                        {item.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">{item.category}</td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[150px]">
                      {item.location}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(item.itemDate).toLocaleDateString('en-IE')}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={item.status}>{item.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <Link to={`/listings/${item._id}`}>
                        <button
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition"
                          title="View Details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </Link>
                      <Link to={`/edit-listing/${item._id}`}>
                        <button
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                          title="Edit Listing"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(item._id, item.title)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
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
          title="No reports match this category"
          description="Have you lost an item or discovered property on campus? Publish a report now."
          actionLabel="Report Lost or Found Item"
          onAction={() => navigate('/create-listing')}
        />
      )}
    </div>
  )
}

