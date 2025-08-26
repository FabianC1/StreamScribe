import mongoose, { Document, Schema } from 'mongoose'

export interface ICreditUsage extends Document {
  userId: mongoose.Types.ObjectId
  transcriptionId: mongoose.Types.ObjectId
  youtubeUrl: string
  videoId: string
  
  // AssemblyAI API usage details
  assemblyAIUsage: {
    audioDurationSeconds: number
    audioDurationMinutes: number
    audioDurationHours: number
    apiCalls: number
    costPerMinute: number // AssemblyAI pricing per minute
    totalCost: number // Total cost for this transcription
    currency: string
    apiVersion: string
    modelUsed: string
  }
  
  // User subscription details at time of usage
  userSubscription: {
    tier: 'basic' | 'standard' | 'premium'
    status: 'active' | 'cancelled' | 'expired'
    pricingTier: number // User's monthly price
    profitMargin: number // Your profit margin on this user
  }
  
  // Business metrics
  businessMetrics: {
    costToUser: number // What the user paid (if any)
    yourCost: number // What you paid to AssemblyAI
    profit: number // Your profit (costToUser - yourCost)
    profitMargin: number // Profit percentage
    roi: number // Return on investment
  }
  
  // Usage metadata
  usageMetadata: {
    processingTime: number // Time taken to process in seconds
    fileSize: number // Size of processed audio in bytes
    quality: 'low' | 'medium' | 'high' | 'best'
    language: string
    speakerCount: number
    wordCount: number
  }
  
  // Timestamps
  processedAt: Date
  createdAt: Date
  updatedAt: Date
}

const CreditUsageSchema = new Schema<ICreditUsage>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  transcriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Transcription',
    required: true,
  },
  youtubeUrl: {
    type: String,
    required: true,
    trim: true,
  },
  videoId: {
    type: String,
    required: true,
    trim: true,
  },
  
  // AssemblyAI API usage details
  assemblyAIUsage: {
    audioDurationSeconds: {
      type: Number,
      required: true,
      min: 0,
    },
    audioDurationMinutes: {
      type: Number,
      required: true,
      min: 0,
    },
    audioDurationHours: {
      type: Number,
      required: true,
      min: 0,
    },
    apiCalls: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    costPerMinute: {
      type: Number,
      required: true,
      min: 0,
      default: 0.0001, // AssemblyAI pricing (adjust as needed)
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    apiVersion: {
      type: String,
      required: true,
      default: 'v1',
    },
    modelUsed: {
      type: String,
      required: true,
      default: 'best',
    },
  },
  
  // User subscription details at time of usage
  userSubscription: {
    tier: {
      type: String,
      enum: ['basic', 'standard', 'premium'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      required: true,
    },
    pricingTier: {
      type: Number,
      required: true,
      min: 0,
    },
    profitMargin: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  
  // Business metrics
  businessMetrics: {
    costToUser: {
      type: Number,
      required: true,
      min: 0,
      default: 0, // Free tier users don't pay
    },
    yourCost: {
      type: Number,
      required: true,
      min: 0,
    },
    profit: {
      type: Number,
      required: true,
      default: 0,
    },
    profitMargin: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    roi: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  
  // Usage metadata
  usageMetadata: {
    processingTime: {
      type: Number,
      required: true,
      min: 0,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0,
    },
    quality: {
      type: String,
      enum: ['low', 'medium', 'high', 'best'],
      default: 'best',
    },
    language: {
      type: String,
      required: true,
      default: 'en',
    },
    speakerCount: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    wordCount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  
  // Timestamps
  processedAt: {
    type: Date,
    default: Date.now,
  },
  
}, {
  timestamps: true,
})

// Create indexes for better performance
CreditUsageSchema.index({ userId: 1, createdAt: -1 })
CreditUsageSchema.index({ transcriptionId: 1 })
CreditUsageSchema.index({ processedAt: -1 })
CreditUsageSchema.index({ 'userSubscription.tier': 1 })
CreditUsageSchema.index({ 'businessMetrics.profit': -1 })

// Pre-save middleware to calculate business metrics
CreditUsageSchema.pre('save', function(next) {
  const doc = this as ICreditUsage
  
  // Calculate total cost
  doc.assemblyAIUsage.totalCost = 
    doc.assemblyAIUsage.audioDurationMinutes * doc.assemblyAIUsage.costPerMinute
  
  // Calculate profit
  doc.businessMetrics.yourCost = doc.assemblyAIUsage.totalCost
  doc.businessMetrics.profit = doc.businessMetrics.costToUser - doc.businessMetrics.yourCost
  
  // Calculate profit margin
  if (doc.businessMetrics.costToUser > 0) {
    doc.businessMetrics.profitMargin = (doc.businessMetrics.profit / doc.businessMetrics.costToUser) * 100
  } else {
    doc.businessMetrics.profitMargin = 0
  }
  
  // Calculate ROI
  if (doc.businessMetrics.yourCost > 0) {
    doc.businessMetrics.roi = (doc.businessMetrics.profit / doc.businessMetrics.yourCost) * 100
  } else {
    doc.businessMetrics.roi = 0
  }
  
  next()
})

// Virtual for cost per hour
CreditUsageSchema.virtual('costPerHour').get(function() {
  return this.assemblyAIUsage.totalCost / (this.assemblyAIUsage.audioDurationHours || 1)
})

// Virtual for profit per hour
CreditUsageSchema.virtual('profitPerHour').get(function() {
  return this.businessMetrics.profit / (this.assemblyAIUsage.audioDurationHours || 1)
})

// Static method to get user's total costs
CreditUsageSchema.statics.getUserTotalCosts = function(userId: string) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalCost: { $sum: '$assemblyAIUsage.totalCost' },
        totalDuration: { $sum: '$assemblyAIUsage.audioDurationHours' },
        totalProfit: { $sum: '$businessMetrics.profit' },
        averageProfitMargin: { $avg: '$businessMetrics.profitMargin' },
        transcriptionCount: { $sum: 1 }
      }
    }
  ])
}

// Static method to get business analytics
CreditUsageSchema.statics.getBusinessAnalytics = function(startDate?: Date, endDate?: Date) {
  const matchStage: any = {}
  if (startDate || endDate) {
    matchStage.processedAt = {}
    if (startDate) matchStage.processedAt.$gte = startDate
    if (endDate) matchStage.processedAt.$lte = endDate
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalCost: { $sum: '$assemblyAIUsage.totalCost' },
        totalRevenue: { $sum: '$businessMetrics.costToUser' },
        totalProfit: { $sum: '$businessMetrics.profit' },
        averageProfitMargin: { $avg: '$businessMetrics.profitMargin' },
        totalDuration: { $sum: '$assemblyAIUsage.audioDurationHours' },
        transcriptionCount: { $sum: 1 },
        userCount: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        totalCost: 1,
        totalRevenue: 1,
        totalProfit: 1,
        averageProfitMargin: 1,
        totalDuration: 1,
        transcriptionCount: 1,
        uniqueUserCount: { $size: '$userCount' },
        costPerHour: { $divide: ['$totalCost', '$totalDuration'] },
        profitPerHour: { $divide: ['$totalProfit', '$totalDuration'] }
      }
    }
  ])
}

export default mongoose.models.CreditUsage || mongoose.model<ICreditUsage>('CreditUsage', CreditUsageSchema)
