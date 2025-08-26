import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import CreditUsage from '@/models/CreditUsage'
import User from '@/models/User'
import Transcription from '@/models/Transcription'

// Local auth options for getServerSession
const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [],
}

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB()
    
    // Get session
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const {
      transcriptionId,
      youtubeUrl,
      videoId,
      audioDuration,
      processingTime,
      fileSize,
      quality = 'best',
      language = 'en',
      speakerCount = 1,
      wordCount = 0
    } = body
    
    if (!transcriptionId || !youtubeUrl || !videoId || !audioDuration) {
      return NextResponse.json({ 
        error: 'Missing required fields: transcriptionId, youtubeUrl, videoId, audioDuration' 
      }, { status: 400 })
    }
    
    // Get user details
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }
    
    // Verify the transcription exists and belongs to the user
    const transcription = await Transcription.findOne({
      _id: transcriptionId,
      userId: user._id
    })
    
    if (!transcription) {
      return NextResponse.json({ 
        error: 'Transcription not found or access denied' 
      }, { status: 404 })
    }
    
    // Calculate duration in different units
    const audioDurationSeconds = audioDuration
    const audioDurationMinutes = audioDurationSeconds / 60
    const audioDurationHours = audioDurationMinutes / 60
    
    // AssemblyAI pricing (adjust these values based on your actual pricing)
    const costPerMinute = 0.0001 // $0.0001 per minute (adjust as needed)
    const totalCost = audioDurationMinutes * costPerMinute
    
    // Calculate user pricing based on subscription tier
    let costToUser = 0
    let pricingTier = 0
    
    switch (user.subscriptionTier) {
      case 'basic':
        pricingTier = 9.99 // $9.99/month
        costToUser = 0 // Basic users don't pay per transcription
        break
      case 'standard':
        pricingTier = 19.99 // $19.99/month
        costToUser = 0 // Standard users don't pay per transcription
        break
      case 'premium':
        pricingTier = 39.99 // $39.99/month
        costToUser = 0 // Premium users don't pay per transcription
        break
    }
    
    // Calculate profit margin
    const profitMargin = pricingTier > 0 ? ((pricingTier - totalCost) / pricingTier) * 100 : 0
    
    // Create credit usage record
    const creditUsage = new CreditUsage({
      userId: user._id,
      transcriptionId: transcriptionId,
      youtubeUrl,
      videoId,
      
      assemblyAIUsage: {
        audioDurationSeconds,
        audioDurationMinutes,
        audioDurationHours,
        apiCalls: 1,
        costPerMinute,
        totalCost,
        currency: 'USD',
        apiVersion: 'v1',
        modelUsed: quality
      },
      
      userSubscription: {
        tier: user.subscriptionTier,
        status: user.subscriptionStatus,
        pricingTier,
        profitMargin
      },
      
      businessMetrics: {
        costToUser,
        yourCost: totalCost,
        profit: costToUser - totalCost,
        profitMargin,
        roi: totalCost > 0 ? ((costToUser - totalCost) / totalCost) * 100 : 0
      },
      
      usageMetadata: {
        processingTime,
        fileSize,
        quality,
        language,
        speakerCount,
        wordCount
      },
      
      processedAt: new Date()
    })
    
    // Save the credit usage record
    await creditUsage.save()
    
    // Update user's hours used
    user.hoursUsed += audioDurationHours
    await user.save()
    
    return NextResponse.json({
      success: true,
      message: 'Credit usage tracked successfully',
      data: {
        id: creditUsage._id,
        totalCost: creditUsage.assemblyAIUsage.totalCost,
        profit: creditUsage.businessMetrics.profit,
        profitMargin: creditUsage.businessMetrics.profitMargin,
        userHoursUsed: user.hoursUsed
      }
    })
    
  } catch (error) {
    console.error('Error tracking credit usage:', error)
    return NextResponse.json({ 
      error: 'Failed to track credit usage' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB()
    
    // Get session
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    // Get user details
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }
    
    // Parse dates if provided
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    
    if (userId && user._id.toString() !== userId) {
      // Only allow users to view their own data (unless admin)
      if (user.email !== 'galaselfabian@gmail.com') {
        return NextResponse.json({ 
          error: 'Access denied' 
        }, { status: 403 })
      }
    }
    
    const targetUserId = userId || user._id
    
    // Get user's credit usage summary
    const userCosts = await CreditUsage.aggregate([
      { $match: { userId: targetUserId } },
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
    
    // Get business analytics for the specified period
    const businessAnalytics = await CreditUsage.aggregate([
      ...(start && end ? [{ $match: { processedAt: { $gte: start, $lte: end } } }] : []),
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$assemblyAIUsage.totalCost' },
          totalRevenue: { $sum: '$businessMetrics.costToUser' },
          totalProfit: { $sum: '$businessMetrics.profit' },
          totalDuration: { $sum: '$assemblyAIUsage.audioDurationHours' },
          transcriptionCount: { $sum: 1 },
          uniqueUserCount: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          _id: 0,
          totalCost: 1,
          totalRevenue: 1,
          totalProfit: 1,
          totalDuration: 1,
          transcriptionCount: 1,
          uniqueUserCount: { $size: '$uniqueUserCount' },
          averageProfitMargin: { $avg: '$businessMetrics.profitMargin' },
          costPerHour: { $divide: ['$totalCost', '$totalDuration'] },
          profitPerHour: { $divide: ['$totalProfit', '$totalDuration'] }
        }
      }
    ])
    
    return NextResponse.json({
      success: true,
      data: {
        userCosts: userCosts[0] || {
          totalCost: 0,
          totalDuration: 0,
          totalProfit: 0,
          averageProfitMargin: 0,
          transcriptionCount: 0
        },
        businessAnalytics: businessAnalytics[0] || {
          totalCost: 0,
          totalRevenue: 0,
          totalProfit: 0,
          averageProfitMargin: 0,
          totalDuration: 0,
          transcriptionCount: 0,
          uniqueUserCount: 0,
          costPerHour: 0,
          profitPerHour: 0
        }
      }
    })
    
  } catch (error) {
    console.error('Error fetching credit usage:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch credit usage' 
    }, { status: 500 })
  }
}
