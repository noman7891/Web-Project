import { Request, Response, NextFunction } from 'express'
import { AdminService } from '../services/adminService'
import { sendSuccess } from '../utils/apiResponse'

export class AdminController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AdminService.getDashboardStats()
      return sendSuccess(res, stats, 'Admin dashboard statistics retrieved successfully')
    } catch (error) {
      next(error)
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await AdminService.getUsers()
      return sendSuccess(res, users, 'User list retrieved successfully')
    } catch (error) {
      next(error)
    }
  }

  static async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { isActive } = req.body
      const result = await AdminService.updateUserStatus(req.params.id as string, Boolean(isActive))
      return sendSuccess(res, result, 'User status updated successfully')
    } catch (error) {
      next(error)
    }
  }
}
