export type UserRole = 'student' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt?: string
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

export interface Listing {
  _id: string
  title: string
  description: string
  type: ListingType
  category: ListingCategory
  location: string
  itemDate: string
  image?: string
  status: ListingStatus
  userId: {
    _id: string
    name: string
    email: string
    role?: string
  }
  contactInfo: string
  createdAt: string
  updatedAt: string
}

export type ClaimStatus = 'pending' | 'approved' | 'rejected'

export interface Claim {
  _id: string
  listingId: {
    _id: string
    title: string
    description?: string
    type: ListingType
    category: ListingCategory
    location: string
    itemDate: string
    image?: string
    status: ListingStatus
    contactInfo?: string
  }
  claimantId: {
    _id: string
    name: string
    email: string
    role?: string
  }
  explanation: string
  status: ClaimStatus
  adminNote?: string
  reviewedBy?: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  errors?: any[]
}

export interface DashboardStats {
  listings: {
    total: number
    lost: number
    found: number
    claimed: number
    active: number
  }
  users: {
    total: number
    students: number
    admins: number
  }
  claims: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
  recentListings: Listing[]
  recentClaims: Claim[]
}

