import mongoose, { Document, Schema } from 'mongoose'

export interface IUsageTracking extends Document {
  userId: mongoose.Types.ObjectId
  date: Date
  hoursUsed: number
  transcriptionsCount: number
  exportsCount: number
  tier: string
  createdAt: Date
}

const UsageTrackingSchema = new Schema<IUsageTracking>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  hoursUsed: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  transcriptionsCount: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  exportsCount: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  tier: {
    type: String,
    required: true,
    enum: ['basic', 'standard', 'premium'],
    default: 'basic',
  },
}, {
  timestamps: true,
})

// Create indexes for better performance
// Note: userId is already covered by the compound unique index below
UsageTrackingSchema.index({ userId: 1, tier: 1 })
UsageTrackingSchema.index({ date: 1 })

// Compound index for efficient queries (this covers userId + date queries)
UsageTrackingSchema.index({ userId: 1, date: 1 }, { unique: true })

// Virtual for formatted date
UsageTrackingSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-GB')
})

// Virtual for total usage in minutes
UsageTrackingSchema.virtual('minutesUsed').get(function() {
  return this.hoursUsed * 60
})

// Virtual for usage percentage of daily limit
UsageTrackingSchema.virtual('usagePercentage').get(function() {
  const dailyLimits = {
    'basic': 1, // 1 hour per day
    'standard': 2, // 2 hours per day
    'premium': 3.33 // 3.33 hours per day
  }
  const limit = dailyLimits[this.tier as keyof typeof dailyLimits] || 1
  return Math.min(100, (this.hoursUsed / limit) * 100)
})

// Pre-save middleware to ensure unique userId + date combination
UsageTrackingSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existing = await mongoose.model('UsageTracking').findOne({
      userId: this.userId,
      date: new Date(this.date.setHours(0, 0, 0, 0))
    })
    if (existing) {
      return next(new Error('Usage tracking already exists for this user and date'))
    }
  }
  next()
})

export default mongoose.models.UsageTracking || mongoose.model<IUsageTracking>('UsageTracking', UsageTrackingSchema)
