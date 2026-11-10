import { Request } from 'express'
import { Types, Document } from 'mongoose'

export type UserRole = 'student' | 'admin'

export interface IUserPayload {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface AuthenticatedRequest extends Request {
  user?: IUserPayload
}

export type ListingType = 'lost' | 'found'

export type ListingCategory = 
  | 'Electronics'
  | 'Cards & ID'
  | 'Keys'
  | 'Books & Study'
  | 'Clothing'
  | 'Bags'
  | 'Jewelry & Accessories'
  | 'Other'

export type ListingStatus = 'active' | 'claimed' | 'archived'

export type ClaimStatus = 'pending' | 'approved' | 'rejected'

export interface IUser extends Document {
  _id: Types.ObjectId
  name: string
  email: string
  passwordHash: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

export interface IListing extends Document {
  _id: Types.ObjectId
  title: string
  description: string
  type: ListingType
  category: ListingCategory
  location: string
  itemDate: Date
  image?: string
  status: ListingStatus
  userId: Types.ObjectId | IUser
  contactInfo: string
  createdAt: Date
  updatedAt: Date
}

export interface IClaim extends Document {
  _id: Types.ObjectId
  listingId: Types.ObjectId | IListing
  claimantId: Types.ObjectId | IUser
  explanation: string
  status: ClaimStatus
  adminNote?: string
  reviewedBy?: Types.ObjectId | IUser
  createdAt: Date
  updatedAt: Date
}

