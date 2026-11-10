import { Schema, model } from 'mongoose'
import { IClaim } from '../types'

const claimSchema = new Schema<IClaim>(
  {
    listingId: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Listing ID is required'],
      index: true,
    },
    claimantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claimant user ID is required'],
      index: true,
    },
    explanation: {
      type: String,
      required: [true, 'Proof of ownership explanation is required'],
      trim: true,
      minlength: [15, 'Explanation must be at least 15 characters to substantiate proof'],
      maxlength: [2000, 'Explanation cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    adminNote: {
      type: String,
      trim: true,
      maxlength: [1000, 'Admin note cannot exceed 1000 characters'],
      default: '',
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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

// Index for quickly looking up claimant's previous claims on a listing
claimSchema.index({ listingId: 1, claimantId: 1 })
claimSchema.index({ claimantId: 1, createdAt: -1 })
claimSchema.index({ status: 1, createdAt: -1 })

export const Claim = model<IClaim>('Claim', claimSchema)
