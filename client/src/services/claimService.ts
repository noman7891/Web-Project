import { api } from './api'
import { ApiResponse, Claim } from '../types'

export const claimService = {
  createClaim: async (data: { listingId: string; explanation: string }) => {
    const res = await api.post<ApiResponse<Claim>>('/claims', data)
    return res.data.data
  },

  getMyClaims: async () => {
    const res = await api.get<ApiResponse<Claim[]>>('/claims/my-claims')
    return res.data.data
  },

  getAllClaims: async (status?: string) => {
    const res = await api.get<ApiResponse<Claim[]>>('/claims', { params: { status } })
    return res.data.data
  },

  updateClaimStatus: async (
    claimId: string,
    data: { status: 'approved' | 'rejected'; adminNote?: string }
  ) => {
    const res = await api.patch<ApiResponse<Claim>>(`/claims/${claimId}/status`, data)
    return res.data.data
  },
}

