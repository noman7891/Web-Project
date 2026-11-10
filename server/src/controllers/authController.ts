import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/authService'
import { sendSuccess } from '../utils/apiResponse'
import { AuthenticatedRequest } from '../types'

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body)
      return sendSuccess(res, result, 'Student registered successfully', 201)
    } catch (error) {
      next(error)
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body)
      return sendSuccess(res, result, 'Login successful', 200)
    } catch (error) {
      next(error)
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getProfile(req.user!.id)
      return sendSuccess(res, user, 'Current user profile retrieved', 200)
    } catch (error) {
      next(error)
    }
  }
}

