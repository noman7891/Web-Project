import { api } from './api'
import { ApiResponse, Listing, PaginationMeta } from '../types'

export interface ListingFilterParams {
  type?: 'lost' | 'found'
  category?: string
  status?: string
  search?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
}

export interface ListingListResponse {
  listings: Listing[]
  pagination: PaginationMeta
}

export const listingService = {
  getListings: async (params?: ListingFilterParams) => {
    const res = await api.get<ApiResponse<ListingListResponse>>('/listings', { params })
    return res.data.data
  },

  getListingById: async (id: string) => {
    const res = await api.get<ApiResponse<Listing>>(`/listings/${id}`)
    return res.data.data
  },

  createListing: async (data: Partial<Listing>) => {
    const res = await api.post<ApiResponse<Listing>>('/listings', data)
    return res.data.data
  },

  updateListing: async (id: string, data: Partial<Listing>) => {
    const res = await api.put<ApiResponse<Listing>>(`/listings/${id}`, data)
    return res.data.data
  },

  deleteListing: async (id: string) => {
    const res = await api.delete<ApiResponse<{ id: string; message: string }>>(`/listings/${id}`)
    return res.data.data
  },

  getMyListings: async () => {
    const res = await api.get<ApiResponse<Listing[]>>('/listings/my-listings')
    return res.data.data
  },
}

