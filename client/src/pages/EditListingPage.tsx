import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { listingService } from '../services/listingService'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { extractErrorMessage } from '../services/api'
import { Button } from '../components/common/Button'
import { ListingCategory } from '../types'
import { Edit, Image, MapPin, Calendar, Mail, ArrowLeft, Loader2 } from 'lucide-react'

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

const editListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  type: z.enum(['lost', 'found']),
  category: z.string().min(1, 'Category is required'),
  location: z.string().min(2, 'Location is required').max(150),
  itemDate: z.string().min(1, 'Date is required'),
  image: z.string().optional(),
  contactInfo: z.string().min(3, 'Contact info is required').max(150),
  status: z.enum(['active', 'claimed', 'archived']),
})

type EditListingFormValues = z.infer<typeof editListingSchema>

export const EditListingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditListingFormValues>({
    resolver: zodResolver(editListingSchema),
  })

  const imageUrl = watch('image')

  useEffect(() => {
    const loadListing = async () => {
      if (!id) return
      try {
        const item = await listingService.getListingById(id)
        // Check ownership or admin
        const isOwner = user?.id === (item.userId?._id || (item.userId as any))
        if (!isOwner && !isAdmin) {
          showToast('You are not authorized to edit this listing.', 'error')
          navigate('/listings')
          return
        }

        reset({
          title: item.title,
          description: item.description,
          type: item.type,
          category: item.category,
          location: item.location,
          itemDate: new Date(item.itemDate).toISOString().split('T')[0],
          image: item.image || '',
          contactInfo: item.contactInfo,
          status: item.status,
        })
      } catch (err) {
        showToast('Failed to load listing for editing.', 'error')
        navigate('/listings')
      } finally {
        setLoading(false)
      }
    }

    loadListing()
  }, [id, user, isAdmin, navigate, reset, showToast])

  const onSubmit = async (values: EditListingFormValues) => {
    if (!id) return
    setSubmitting(true)
    try {
      await listingService.updateListing(id, values as any)
      showToast('Listing updated successfully!', 'success')
      navigate(`/listings/${id}`)
    } catch (error) {
      showToast(extractErrorMessage(error), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
        <p className="text-sm text-slate-500">Loading listing details...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Cancel & Return
      </button>

      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Edit className="w-7 h-7 text-brand-600" />
          Edit Listing
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Modify listing details or update status to claimed when recovered.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        {/* Hidden type input to guarantee type persistence */}
        <input type="hidden" {...register('type')} />

        {/* Status Dropdown & Type indicator */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Listing Type
            </label>
            <div className="text-sm font-bold text-slate-900 capitalize flex items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white border border-slate-300">
                {watch('type') === 'found' ? 'Found Property' : 'Lost Property'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Listing Status *
            </label>
            <select
              {...register('status')}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="active">Active (Currently available on campus)</option>
              <option value="claimed">Claimed (Item has been returned to owner)</option>
              <option value="archived">Archived (Closed by user or admin)</option>
            </select>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Item Title *
          </label>
          <input
            type="text"
            {...register('title')}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
          {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>}
        </div>

        {/* Category & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Category *
            </label>
            <select
              {...register('category')}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Date *
            </label>
            <input
              type="date"
              {...register('itemDate')}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Location *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              {...register('location')}
              className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Description *
          </label>
          <textarea
            rows={4}
            {...register('description')}
            className="w-full p-3.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Image URL
          </label>
          <input
            type="url"
            {...register('image')}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
          {imageUrl && (
            <div className="mt-3 w-28 h-28 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Contact Information *
          </label>
          <input
            type="text"
            {...register('contactInfo')}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={submitting}
            leftIcon={<Edit className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}

