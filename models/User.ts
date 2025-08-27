import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  email: string
  passwordHash?: string
  googleId?: string
  firstName: string
  lastName: string
  avatar?: string
  subscriptionTier: 'basic' | 'standard' | 'premium'
  subscriptionStatus: 'active' | 'cancelled' | 'expired'
  subscriptionStartDate: Date
  subscriptionEndDate: Date
  hoursUsed: number
  hoursLimit: number
  stripeCustomerId?: string
  emailVerified: boolean
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: false, // Not required if using Google OAuth
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    required: false,
  },
  subscriptionTier: {
    type: String,
    enum: ['basic', 'standard', 'premium'],
    default: 'basic',
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'cancelled', 'expired'],
    default: 'active',
  },
  subscriptionStartDate: {
    type: Date,
    default: Date.now,
  },
  subscriptionEndDate: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  },
  hoursUsed: {
    type: Number,
    default: 0,
  },
  hoursLimit: {
    type: Number,
    default: 30, // Basic tier limit
  },
  stripeCustomerId: {
    type: String,
    required: false,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: {
    type: String,
    required: false,
  },
  resetPasswordExpires: {
    type: Date,
    required: false,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
})

// Create indexes for better performance (email and googleId are already indexed via unique: true)
UserSchema.index({ subscriptionTier: 1 })
UserSchema.index({ stripeCustomerId: 1 })

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

// Virtual for subscription status
UserSchema.virtual('isSubscriptionActive').get(function() {
  return this.subscriptionStatus === 'active' && this.subscriptionEndDate > new Date()
})

// Virtual for remaining hours
UserSchema.virtual('remainingHours').get(function() {
  return Math.max(0, this.hoursLimit - this.hoursUsed)
})

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
