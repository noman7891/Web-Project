import { api } from './api'
import { ApiResponse, DashboardStats, User } from '../types'

export const adminService = {
  getDashboardStats: async () => {
    const res = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard')
    return res.data.data
  },

  getUsers: async () => {
    const res = await api.get<ApiResponse<User[]>>('/admin/users')
    return res.data.data
  },

  updateUserStatus: async (userId: string, isActive: boolean) => {
    const res = await api.patch<ApiResponse<any>>(`/admin/users/${userId}/status`, { isActive })
    return res.data.data
  },
}

