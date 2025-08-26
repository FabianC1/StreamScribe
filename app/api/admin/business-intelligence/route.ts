import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import CreditUsage from '@/models/CreditUsage'
import User from '@/models/User'
import Transcription from '@/models/Transcription'
import UserNotes from '@/models/UserNotes'

// Local auth options for getServerSession
const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [],
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
    
    // Check if user is admin
    if (session.user.email !== 'galaselfabian@gmail.com') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const groupBy = searchParams.get('groupBy') || 'day' // day, week, month
    
    // Parse dates if provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Default to last 30 days
    const end = endDate ? new Date(endDate) : new Date()
    
    // Get comprehensive business analytics
    const [
      businessAnalytics,
      userAnalytics,
      costAnalytics,
      profitAnalytics,
      usageAnalytics
    ] = await Promise.all([
      // Overall business metrics
      CreditUsage.aggregate([
        { $match: { processedAt: { $gte: start, $lte: end } } },
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
      ]).then(results => results[0] || {
        totalCost: 0,
        totalRevenue: 0,
        totalProfit: 0,
        totalDuration: 0,
        transcriptionCount: 0,
        uniqueUserCount: 0,
        averageProfitMargin: 0,
        costPerHour: 0,
        profitPerHour: 0
      }),
      
      // User analytics by tier
      CreditUsage.aggregate([
        { $match: { processedAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: '$userSubscription.tier',
            userCount: { $addToSet: '$userId' },
            totalCost: { $sum: '$assemblyAIUsage.totalCost' },
            totalRevenue: { $sum: '$businessMetrics.costToUser' },
            totalProfit: { $sum: '$businessMetrics.profit' },
            totalDuration: { $sum: '$assemblyAIUsage.audioDurationHours' },
            transcriptionCount: { $sum: 1 },
            averageProfitMargin: { $avg: '$businessMetrics.profitMargin' }
          }
        },
        {
          $project: {
            tier: '$_id',
            userCount: { $size: '$userCount' },
            totalCost: 1,
            totalRevenue: 1,
            totalProfit: 1,
            totalDuration: 1,
            transcriptionCount: 1,
            averageProfitMargin: 1,
            costPerHour: { $divide: ['$totalCost', '$totalDuration'] },
            profitPerHour: { $divide: ['$totalProfit', '$totalDuration'] }
          }
        }
      ]),
      
      // Cost trends over time
      CreditUsage.aggregate([
        { $match: { processedAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: groupBy === 'day' ? '%Y-%m-%d' : groupBy === 'week' ? '%Y-%U' : '%Y-%m',
                date: '$processedAt'
              }
            },
            totalCost: { $sum: '$assemblyAIUsage.totalCost' },
            totalDuration: { $sum: '$assemblyAIUsage.audioDurationHours' },
            transcriptionCount: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // Profit trends over time
      CreditUsage.aggregate([
        { $match: { processedAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: groupBy === 'day' ? '%Y-%m-%d' : groupBy === 'week' ? '%Y-%U' : '%Y-%m',
                date: '$processedAt'
              }
            },
            totalProfit: { $sum: '$businessMetrics.profit' },
            totalRevenue: { $sum: '$businessMetrics.costToUser' },
            averageProfitMargin: { $avg: '$businessMetrics.profitMargin' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // Usage patterns
      CreditUsage.aggregate([
        { $match: { processedAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: {
              hour: { $hour: '$processedAt' },
              dayOfWeek: { $dayOfWeek: '$processedAt' }
            },
            transcriptionCount: { $sum: 1 },
            totalDuration: { $sum: '$assemblyAIUsage.audioDurationHours' },
            totalCost: { $sum: '$assemblyAIUsage.totalCost' }
          }
        },
        { $sort: { '_id.dayOfWeek': 1, '_id.hour': 1 } }
      ])
    ])
    
    // Get top users by cost
    const topUsersByCost = await CreditUsage.aggregate([
      { $match: { processedAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$userId',
          totalCost: { $sum: '$assemblyAIUsage.totalCost' },
          totalDuration: { $sum: '$assemblyAIUsage.audioDurationHours' },
          transcriptionCount: { $sum: 1 },
          totalProfit: { $sum: '$businessMetrics.profit' }
        }
      },
      { $sort: { totalCost: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          userId: '$_id',
          email: { $arrayElemAt: ['$user.email', 0] },
          firstName: { $arrayElemAt: ['$user.firstName', 0] },
          lastName: { $arrayElemAt: ['$user.lastName', 0] },
          totalCost: 1,
          totalDuration: 1,
          transcriptionCount: 1,
          totalProfit: 1
        }
      }
    ])
    
    // Get user engagement metrics
    const userEngagement = await UserNotes.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $group: {
          _id: '$userId',
          totalNotes: { $sum: '$totalNotes' },
          totalExports: { $sum: { $size: '$exportHistory' } },
          lastActivity: { $max: '$lastActivity' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          userId: '$_id',
          totalNotes: 1,
          totalExports: 1,
          lastActivity: 1,
          email: { $arrayElemAt: ['$user.email', 0] },
          firstName: { $arrayElemAt: ['$user.firstName', 0] },
          lastName: { $arrayElemAt: ['$user.lastName', 0] }
        }
      },
      { $sort: { totalNotes: -1 } },
      { $limit: 10 }
    ])
    
    return NextResponse.json({
      success: true,
      data: {
        period: { start, end },
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
        },
        userAnalytics,
        costTrends: costAnalytics,
        profitTrends: profitAnalytics,
        usagePatterns: usageAnalytics,
        topUsersByCost,
        userEngagement,
        summary: {
          totalUsers: userAnalytics.reduce((sum, tier) => sum + tier.userCount, 0),
          totalTranscriptions: businessAnalytics[0]?.transcriptionCount || 0,
          totalHours: businessAnalytics[0]?.totalDuration || 0,
          totalCost: businessAnalytics[0]?.totalCost || 0,
          totalProfit: businessAnalytics[0]?.totalProfit || 0,
          averageProfitMargin: businessAnalytics[0]?.averageProfitMargin || 0
        }
      }
    })
    
  } catch (error) {
    console.error('Error fetching business intelligence:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch business intelligence' 
    }, { status: 500 })
  }
}
