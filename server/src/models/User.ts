import { Schema, model } from 'mongoose'
import bcrypt from 'bcryptjs'
import { IUser } from '../types'

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret.passwordHash
        delete ret.__v
        return ret
      },
    },
  }
)

// Pre-save password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next()
  }
  const salt = await bcrypt.genSalt(10)
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt)
  next()
})

// Instance method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash)
}

export const User = model<IUser>('User', userSchema)
