import { Response, NextFunction } from 'express'
import { AuthenticatedRequest, UserRole } from '../types'
import { AppError } from '../utils/apiResponse'

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401))
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden: Access requires one of the following roles: [${roles.join(', ')}]`,
          403
        )
      )
    }

    next()
  }
}

