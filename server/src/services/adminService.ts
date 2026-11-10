import { Types } from 'mongoose'
import { User } from '../models/User'
import { Listing } from '../models/Listing'
import { Claim } from '../models/Claim'
import { AppError } from '../utils/apiResponse'

export class AdminService {
  static async getDashboardStats() {
    const [
      totalListings,
      totalLost,
      totalFound,
      totalClaimed,
      totalUsers,
      totalStudents,
      totalClaims,
      pendingClaims,
      approvedClaims,
      rejectedClaims,
      recentListings,
      recentClaims,
    ] = await Promise.all([
      Listing.countDocuments(),
      Listing.countDocuments({ type: 'lost' }),
      Listing.countDocuments({ type: 'found' }),
      Listing.countDocuments({ status: 'claimed' }),
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Claim.countDocuments(),
      Claim.countDocuments({ status: 'pending' }),
      Claim.countDocuments({ status: 'approved' }),
      Claim.countDocuments({ status: 'rejected' }),
      Listing.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Claim.find()
        .populate('listingId', 'title type category')
        .populate('claimantId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ])

    return {
      listings: {
        total: totalListings,
        lost: totalLost,
        found: totalFound,
        claimed: totalClaimed,
        active: totalListings - totalClaimed,
      },
      users: {
        total: totalUsers,
        students: totalStudents,
        admins: totalUsers - totalStudents,
      },
      claims: {
        total: totalClaims,
        pending: pendingClaims,
        approved: approvedClaims,
        rejected: rejectedClaims,
      },
      recentListings,
      recentClaims,
    }
  }

  static async getUsers() {
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean()

    return users
  }

  static async updateUserStatus(userId: string, isActive: boolean) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid user ID format.', 400)
    }

    const user = await User.findById(userId)
    if (!user) {
      throw new AppError('User not found.', 404)
    }

    if (user.role === 'admin') {
      throw new AppError('Cannot modify status of another administrator.', 400)
    }

    user.isActive = isActive
    await user.save()

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
    }
  }
}

