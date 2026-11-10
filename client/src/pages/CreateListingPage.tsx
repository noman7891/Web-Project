import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { listingService } from '../services/listingService'
import { useToast } from '../context/ToastContext'
import { extractErrorMessage } from '../services/api'
import { Button } from '../components/common/Button'
import { ListingCategory } from '../types'
import { PlusCircle, Image, MapPin, Calendar, Mail, FileText, Sparkles } from 'lucide-react'

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

const createListingSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title cannot exceed 120 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  type: z.enum(['lost', 'found']),
  category: z.string().min(1, 'Category is required'),
  location: z
    .string()
    .min(2, 'Location is required')
    .max(150, 'Location cannot exceed 150 characters'),
  itemDate: z.string().min(1, 'Date is required'),
  image: z.string().optional(),
  contactInfo: z
    .string()
    .min(3, 'Contact info is required')
    .max(150, 'Contact info cannot exceed 150 characters'),
})

type CreateListingFormValues = z.infer<typeof createListingSchema>

export const CreateListingPage: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateListingFormValues>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      type: 'found',
      category: 'Electronics',
      itemDate: new Date().toISOString().split('T')[0],
      image: '',
    },
  })

  const selectedType = watch('type')
  const imageUrl = watch('image')

  const onSubmit = async (values: CreateListingFormValues) => {
    setSubmitting(true)
    try {
      const newListing = await listingService.createListing(values as any)
      showToast('Item listing published successfully!', 'success')
      navigate(`/listings/${newListing._id}`)
    } catch (error) {
      showToast(extractErrorMessage(error), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Sample photo presets for convenience
  const samplePhotos = [
    { label: 'Laptop / Tech', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80' },
    { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80' },
    { label: 'ID / Card', url: 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&w=600&q=80' },
    { label: 'Keys', url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80' },
    { label: 'Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <PlusCircle className="w-7 h-7 text-emerald-600" />
          Report Lost or Found Property
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Provide accurate details to assist university security and fellow students in identifying
          the item.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        {/* Listing Type Toggle */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            What are you reporting? *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center justify-center p-3 rounded-2xl border-2 cursor-pointer font-bold text-sm transition ${
                selectedType === 'found'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <input
                type="radio"
                value="found"
                {...register('type')}
                className="sr-only"
              />
              <span>Found Property (I discovered it)</span>
            </label>

            <label
              className={`flex items-center justify-center p-3 rounded-2xl border-2 cursor-pointer font-bold text-sm transition ${
                selectedType === 'lost'
                  ? 'border-amber-500 bg-amber-50 text-amber-800'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <input
                type="radio"
                value="lost"
                {...register('type')}
                className="sr-only"
              />
              <span>Lost Property (I misplaced it)</span>
            </label>
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
            placeholder="e.g. Apple AirPods Pro in White Case or Black Leather Wallet"
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
            {errors.category && (
              <p className="mt-1 text-xs text-rose-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Date {selectedType === 'found' ? 'Found' : 'Lost'} *
            </label>
            <input
              type="date"
              {...register('itemDate')}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
            {errors.itemDate && (
              <p className="mt-1 text-xs text-rose-600">{errors.itemDate.message}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Campus Location *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              {...register('location')}
              placeholder="e.g. Castle House Library 4th Floor, Aungier St Canteen, Computer Lab 3.2"
              className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          {errors.location && (
            <p className="mt-1 text-xs text-rose-600">{errors.location.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Description *
          </label>
          <textarea
            rows={4}
            {...register('description')}
            placeholder="Describe the item (brand, color, general condition). Note: do not reveal unique secret identifiers that only the genuine owner should know."
            className="w-full p-3.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>
          )}
        </div>

        {/* Image URL & Preset Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Item Image URL (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Image className="w-4 h-4" />
            </div>
            <input
              type="url"
              {...register('image')}
              placeholder="https://example.com/image.jpg"
              className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          {/* Quick preset images */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-600">Sample Photos:</span>
            {samplePhotos.map((preset) => (
              <button
                type="button"
                key={preset.label}
                onClick={() => setValue('image', preset.url)}
                className="px-2 py-0.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-medium text-slate-700 transition"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {imageUrl && (
            <div className="mt-3 w-28 h-28 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Preferred Contact Information *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="text"
              {...register('contactInfo')}
              placeholder="e.g. your student email or campus security desk"
              className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          {errors.contactInfo && (
            <p className="mt-1 text-xs text-rose-600">{errors.contactInfo.message}</p>
          )}
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={submitting}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Publish Report
          </Button>
        </div>
      </form>
    </div>
  )
}

