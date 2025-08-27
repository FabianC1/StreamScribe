import mongoose, { Document, Schema } from 'mongoose'

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId
  stripeSubscriptionId: string
  tier: 'basic' | 'standard' | 'premium'
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  priceId: string
  amount: number
  currency: string
  createdAt: Date
  updatedAt: Date
  cancelledAt?: Date
}

const SubscriptionSchema = new Schema<ISubscription>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // One subscription per user
  },
  stripeSubscriptionId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  tier: {
    type: String,
    required: true,
    enum: ['basic', 'standard', 'premium'],
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'cancelled', 'past_due', 'unpaid'],
    default: 'active',
  },
  currentPeriodStart: {
    type: Date,
    required: true,
  },
  currentPeriodEnd: {
    type: Date,
    required: true,
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    required: true,
    default: false,
  },
  priceId: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    default: 'GBP',
    trim: true,
  },
  cancelledAt: {
    type: Date,
    required: false,
  },
}, {
  timestamps: true,
})

// Create indexes for better performance
// Note: userId and stripeSubscriptionId are already indexed via unique: true
SubscriptionSchema.index({ status: 1 })
SubscriptionSchema.index({ tier: 1 })
SubscriptionSchema.index({ currentPeriodEnd: 1 })

// Virtual for subscription status
SubscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && this.currentPeriodEnd > new Date()
})

// Virtual for days remaining
SubscriptionSchema.virtual('daysRemaining').get(function() {
  const now = new Date()
  const end = this.currentPeriodEnd
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
})

// Virtual for formatted amount
SubscriptionSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: this.currency,
  }).format(this.amount)
})

// Virtual for next billing date
SubscriptionSchema.virtual('nextBillingDate').get(function() {
  return this.currentPeriodEnd
})

export default mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema)
