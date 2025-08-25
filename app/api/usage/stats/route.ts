import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { UsageTracking, Transcription } from '@/models'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // TODO: Get actual user ID from session/auth
    const mockUserId = '507f1f77bcf86cd799439011'
    
    // Get current month usage
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    const monthlyUsage = await UsageTracking.aggregate([
      {
        $match: {
          userId: mockUserId,
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$hoursUsed' },
          totalTranscriptions: { $sum: '$transcriptionsCount' },
          totalExports: { $sum: '$exportsCount' }
        }
      }
    ])
    
    // Get total transcriptions count
    const totalTranscriptions = await Transcription.countDocuments({ userId: mockUserId })
    
    // Get today's usage
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayUsage = await UsageTracking.findOne({
      userId: mockUserId,
      date: today
    })
    
    const stats = {
      monthly: {
        hours: monthlyUsage[0]?.totalHours || 0,
        transcriptions: monthlyUsage[0]?.totalTranscriptions || 0,
        exports: monthlyUsage[0]?.totalExports || 0
      },
      total: {
        transcriptions: totalTranscriptions
      },
      today: {
        hours: todayUsage?.hoursUsed || 0,
        transcriptions: todayUsage?.transcriptionsCount || 0
      }
    }
    
    return NextResponse.json({
      success: true,
      stats
    })
    
  } catch (error) {
    console.error('❌ Error fetching usage stats:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch usage statistics' 
    }, { status: 500 })
  }
}
