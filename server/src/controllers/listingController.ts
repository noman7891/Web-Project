import { Request, Response, NextFunction } from 'express'
import { ListingService } from '../services/listingService'
import { sendSuccess } from '../utils/apiResponse'
import { AuthenticatedRequest } from '../types'
import { QueryListingInput } from '../validators/listingSchemas'

export class ListingController {
  static async getListings(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ListingService.getListings(req.query as unknown as QueryListingInput)
      return sendSuccess(res, result, 'Listings retrieved successfully')
    } catch (error) {
      next(error)
    }
  }

  static async getListingById(req: Request, res: Response, next: NextFunction) {
    try {
      const listing = await ListingService.getListingById(req.params.id as string)
      return sendSuccess(res, listing, 'Listing retrieved successfully')
    } catch (error) {
      next(error)
    }
  }

  static async createListing(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const listing = await ListingService.createListing(req.body, req.user!)
      return sendSuccess(res, listing, 'Listing published successfully', 201)
    } catch (error) {
      next(error)
    }
  }

  static async updateListing(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const listing = await ListingService.updateListing(req.params.id as string, req.body, req.user!)
      return sendSuccess(res, listing, 'Listing updated successfully')
    } catch (error) {
      next(error)
    }
  }

  static async deleteListing(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await ListingService.deleteListing(req.params.id as string, req.user!)
      return sendSuccess(res, result, 'Listing deleted successfully')
    } catch (error) {
      next(error)
    }
  }

  static async getMyListings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const listings = await ListingService.getMyListings(req.user!)
      return sendSuccess(res, listings, 'User listings retrieved successfully')
    } catch (error) {
      next(error)
    }
  }
}
