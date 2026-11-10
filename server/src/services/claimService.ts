import { Types } from 'mongoose'
import { Claim } from '../models/Claim'
import { Listing } from '../models/Listing'
import { CreateClaimInput, UpdateClaimStatusInput } from '../validators/claimSchemas'
import { AppError } from '../utils/apiResponse'
import { IUserPayload } from '../types'

export class ClaimService {
  static async createClaim(input: CreateClaimInput, user: IUserPayload) {
    if (!Types.ObjectId.isValid(input.listingId)) {
      throw new AppError('Invalid listing ID format.', 400)
    }

    const listing = await Listing.findById(input.listingId)
    if (!listing) {
      throw new AppError('Listing not found.', 404)
    }

    if (listing.type !== 'found') {
      throw new AppError('Claims can only be filed against items listed as "found".', 400)
    }

    if (listing.status !== 'active') {
      throw new AppError(`Cannot claim this item as it is already ${listing.status}.`, 400)
    }

    if (listing.userId.toString() === user.id) {
      throw new AppError('You cannot file a claim on an item that you reported finding.', 400)
    }

    // Check for existing pending claim by this user on this listing
    const existingClaim = await Claim.findOne({
      listingId: input.listingId,
      claimantId: user.id,
      status: 'pending',
    })

    if (existingClaim) {
      throw new AppError('You already have a pending claim submitted for this item.', 409)
    }

    const claim = await Claim.create({
      listingId: input.listingId,
      claimantId: user.id,
      explanation: input.explanation,
      status: 'pending',
    })

    return claim.populate([
      { path: 'listingId', select: 'title type category location itemDate image status' },
      { path: 'claimantId', select: 'name email role' },
    ])
  }

  static async getMyClaims(user: IUserPayload) {
    const claims = await Claim.find({ claimantId: user.id })
      .populate({
        path: 'listingId',
        select: 'title description type category location itemDate image status contactInfo',
      })
      .sort({ createdAt: -1 })
      .lean()

    return claims
  }

  static async getAllClaims(status?: string) {
    const filter: Record<string, any> = {}
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status
    }

    const claims = await Claim.find(filter)
      .populate({
        path: 'listingId',
        select: 'title description type category location itemDate image status userId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('claimantId', 'name email role')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean()

    return claims
  }

  static async updateClaimStatus(
    claimId: string,
    input: UpdateClaimStatusInput,
    adminUser: IUserPayload
  ) {
    if (!Types.ObjectId.isValid(claimId)) {
      throw new AppError('Invalid claim ID format.', 400)
    }

    const claim = await Claim.findById(claimId)
    if (!claim) {
      throw new AppError('Claim not found.', 404)
    }

    claim.status = input.status
    claim.adminNote = input.adminNote || ''
    claim.reviewedBy = new Types.ObjectId(adminUser.id)
    await claim.save()

    // If claim is approved, update the corresponding listing to 'claimed'
    if (input.status === 'approved') {
      const targetListingId = (claim.listingId as any)?._id || claim.listingId
      await Listing.findByIdAndUpdate(targetListingId, { status: 'claimed' })
    }

    return claim.populate([
      { path: 'listingId', select: 'title type category location itemDate image status' },
      { path: 'claimantId', select: 'name email role' },
      { path: 'reviewedBy', select: 'name email' },
    ])
  }
}

