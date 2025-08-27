import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  email: string
  passwordHash?: string
  googleId?: string
  firstName: string
  lastName: string
  avatar?: string
  subscriptionTier?: 'basic' | 'standard' | 'premium'
  subscriptionStatus?: 'active' | 'cancelled' | 'expired'
  subscriptionStartDate?: Date
  subscriptionEndDate?: Date
  hoursUsed: number
  hoursLimit: number
  stripeCustomerId?: string
  stripeSubscriptionId?: string
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
    required: false, // No subscription by default
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'cancelled', 'expired'],
    required: false, // No subscription by default
  },
  subscriptionStartDate: {
    type: Date,
    required: false, // No subscription by default
  },
  subscriptionEndDate: {
    type: Date,
    required: false, // No subscription by default
  },
  hoursUsed: {
    type: Number,
    default: 0,
  },
  hoursLimit: {
    type: Number,
    default: 0, // No access until subscription
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
  return this.subscriptionStatus === 'active' && 
         this.subscriptionEndDate && 
         this.subscriptionEndDate > new Date()
})

// Virtual for remaining hours
UserSchema.virtual('remainingHours').get(function() {
  if (!this.subscriptionTier || !this.isSubscriptionActive) {
    return 0 // No access without subscription
  }
  return Math.max(0, this.hoursLimit - this.hoursUsed)
})

// Virtual to check if user has any subscription
UserSchema.virtual('hasSubscription').get(function() {
  return !!this.subscriptionTier && this.isSubscriptionActive
})

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
