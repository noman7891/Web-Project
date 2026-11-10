import { User } from '../models/User'
import { RegisterInput, LoginInput } from '../validators/authSchemas'
import { AppError } from '../utils/apiResponse'
import { signToken } from '../utils/jwt'
import { IUserPayload } from '../types'

export class AuthService {
  static async register(input: RegisterInput) {
    const existing = await User.findOne({ email: input.email.toLowerCase() })
    if (existing) {
      throw new AppError('An account with this email address already exists.', 409)
    }

    // Role is strictly 'student' during registration
    const user = await User.create({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: input.password,
      role: 'student',
    })

    const payload: IUserPayload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    }

    const token = signToken(payload)

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    }
  }

  static async login(input: LoginInput) {
    const user = await User.findOne({ email: input.email.toLowerCase() })
    if (!user) {
      throw new AppError('Invalid email or password.', 401)
    }

    if (!user.isActive) {
      throw new AppError('This account has been deactivated. Please contact campus security.', 403)
    }

    const isMatch = await user.comparePassword(input.password)
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401)
    }

    const payload: IUserPayload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    }

    const token = signToken(payload)

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    }
  }

  static async getProfile(userId: string) {
    const user = await User.findById(userId).select('-passwordHash')
    if (!user) {
      throw new AppError('User profile not found.', 404)
    }
    return user
  }
}

