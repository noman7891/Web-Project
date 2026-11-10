import { Types } from 'mongoose'
import { Listing } from '../models/Listing'
import { CreateListingInput, UpdateListingInput, QueryListingInput } from '../validators/listingSchemas'
import { AppError } from '../utils/apiResponse'
import { IUserPayload } from '../types'

export class ListingService {
  static async getListings(query: QueryListingInput) {
    const filter: Record<string, any> = {}

    if (query.type) {
      filter.type = query.type
    }

    if (query.category) {
      filter.category = query.category
    }

    if (query.status) {
      filter.status = query.status
    } else {
      // By default show active listings, unless specified
      filter.status = 'active'
    }

    if (query.startDate || query.endDate) {
      filter.itemDate = {}
      if (query.startDate) {
        filter.itemDate.$gte = new Date(query.startDate)
      }
      if (query.endDate) {
        filter.itemDate.$lte = new Date(query.endDate)
      }
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i')
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
      ]
    }

    const page = query.page || 1
    const limit = query.limit || 12
    const skip = (page - 1) * limit

    const sortOrder = query.order === 'asc' ? 1 : -1
    const sortField = query.sortBy || 'createdAt'
    const sort: Record<string, 1 | -1> = { [sortField]: sortOrder }

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate('userId', 'name email role')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Listing.countDocuments(filter),
    ])

    return {
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    }
  }

  static async getListingById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid listing ID format.', 400)
    }

    const listing = await Listing.findById(id).populate('userId', 'name email role')
    if (!listing) {
      throw new AppError('Listing not found.', 404)
    }

    return listing
  }

  static async createListing(input: CreateListingInput, user: IUserPayload) {
    const listing = await Listing.create({
      ...input,
      itemDate: new Date(input.itemDate),
      userId: user.id,
      status: 'active',
    })

    return listing.populate('userId', 'name email role')
  }

  static async updateListing(
    id: string,
    input: UpdateListingInput,
    user: IUserPayload
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid listing ID format.', 400)
    }

    const listing = await Listing.findById(id)
    if (!listing) {
      throw new AppError('Listing not found.', 404)
    }

    // Check ownership or admin status
    const isOwner = listing.userId.toString() === user.id
    const isAdmin = user.role === 'admin'

    if (!isOwner && !isAdmin) {
      throw new AppError('Forbidden: You can only edit your own listings.', 403)
    }

    if (input.itemDate) {
      (input as any).itemDate = new Date(input.itemDate)
    }

    Object.assign(listing, input)
    await listing.save()

    return listing.populate('userId', 'name email role')
  }

  static async deleteListing(id: string, user: IUserPayload) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid listing ID format.', 400)
    }

    const listing = await Listing.findById(id)
    if (!listing) {
      throw new AppError('Listing not found.', 404)
    }

    const isOwner = listing.userId.toString() === user.id
    const isAdmin = user.role === 'admin'

    if (!isOwner && !isAdmin) {
      throw new AppError('Forbidden: You can only delete your own listings.', 403)
    }

    await Listing.findByIdAndDelete(id)
    return { id, message: 'Listing successfully deleted.' }
  }

  static async getMyListings(user: IUserPayload) {
    const listings = await Listing.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .lean()

    return listings
  }
}

