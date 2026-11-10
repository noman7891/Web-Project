import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '../types'
import { verifyToken } from '../utils/jwt'
import { AppError } from '../utils/apiResponse'
import { User } from '../models/User'

export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Missing or malformed token.', 401)
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    // Verify user still exists and is active
    const user = await User.findById(decoded.id).select('_id email name role isActive')
    if (!user || !user.isActive) {
      throw new AppError('User not found or account deactivated.', 401)
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    }

    next()
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      next(new AppError('Invalid token. Authentication failed.', 401))
    } else if (error.name === 'TokenExpiredError') {
      next(new AppError('Token expired. Please login again.', 401))
    } else {
      next(error)
    }
  }
}

