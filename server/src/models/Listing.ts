import { Schema, model } from 'mongoose'
import { IListing } from '../types'

const listingSchema = new Schema<IListing>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    type: {
      type: String,
      enum: ['lost', 'found'],
      required: [true, 'Listing type (lost or found) is required'],
      index: true,
    },
    category: {
      type: String,
      enum: [
        'Electronics',
        'Cards & ID',
        'Keys',
        'Books & Study',
        'Clothing',
        'Bags',
        'Jewelry & Accessories',
        'Other',
      ],
      required: [true, 'Category is required'],
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Campus location is required'],
      trim: true,
      maxlength: [150, 'Location cannot exceed 150 characters'],
    },
    itemDate: {
      type: Date,
      required: [true, 'Date of item event is required'],
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'claimed', 'archived'],
      default: 'active',
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    contactInfo: {
      type: String,
      required: [true, 'Contact information is required'],
      trim: true,
      maxlength: [150, 'Contact info cannot exceed 150 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret.__v
        return ret
      },
    },
  }
)

// Compound search and filter indexes
listingSchema.index({ type: 1, category: 1, status: 1 })
listingSchema.index({ title: 'text', description: 'text', location: 'text' })

export const Listing = model<IListing>('Listing', listingSchema)
