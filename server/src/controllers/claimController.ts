import { Request, Response, NextFunction } from 'express'
import { ClaimService } from '../services/claimService'
import { sendSuccess } from '../utils/apiResponse'
import { AuthenticatedRequest } from '../types'

export class ClaimController {
  static async createClaim(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const claim = await ClaimService.createClaim(req.body, req.user!)
      return sendSuccess(res, claim, 'Claim submitted successfully. Under admin review.', 201)
    } catch (error) {
      next(error)
    }
  }

  static async getMyClaims(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const claims = await ClaimService.getMyClaims(req.user!)
      return sendSuccess(res, claims, 'User claims retrieved successfully')
    } catch (error) {
      next(error)
    }
  }

  static async getAllClaims(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string | undefined
      const claims = await ClaimService.getAllClaims(status)
      return sendSuccess(res, claims, 'Claims retrieved successfully')
    } catch (error) {
      next(error)
    }
  }

  static async updateClaimStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const claim = await ClaimService.updateClaimStatus(
        req.params.id as string,
        req.body,
        req.user!
      )
      return sendSuccess(res, claim, `Claim status successfully updated to ${req.body.status}`)
    } catch (error) {
      next(error)
    }
  }
}
