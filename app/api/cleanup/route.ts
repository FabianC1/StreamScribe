import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import { Transcription, ProcessedVideos, UsageTracking, User } from '@/models'
import { authOptions } from '../auth/[...nextauth]/route'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from session
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Only allow admin user to run cleanup
    if (session.user.email !== 'galaselfabian@gmail.com') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await connectDB()

    console.log('🧹 Starting database cleanup...')

    // Delete all transcriptions
    const transcriptionsDeleted = await Transcription.deleteMany({})
    console.log(`🗑️ Deleted ${transcriptionsDeleted.deletedCount} transcriptions`)

    // Delete all ProcessedVideos records
    const processedVideosDeleted = await ProcessedVideos.deleteMany({})
    console.log(`🗑️ Deleted ${processedVideosDeleted.deletedCount} ProcessedVideos records`)

    // Delete all UsageTracking records
    const usageTrackingDeleted = await UsageTracking.deleteMany({})
    console.log(`🗑️ Deleted ${usageTrackingDeleted.deletedCount} UsageTracking records`)



    // Reset user hours used to 0
    const usersUpdated = await User.updateMany(
      {},
      { 
        $set: { 
          hoursUsed: 0,
          lastLoginAt: new Date()
        }
      }
    )
    console.log(`🔄 Reset hours used for ${usersUpdated.modifiedCount} users`)

    console.log('✅ Database cleanup completed successfully!')

    return NextResponse.json({
      success: true,
      message: 'Database cleanup completed',
      deleted: {
        transcriptions: transcriptionsDeleted.deletedCount,
        processedVideos: processedVideosDeleted.deletedCount,
        usageTracking: usageTrackingDeleted.deletedCount,
        usersReset: usersUpdated.modifiedCount
      }
    })

  } catch (error) {
    console.error('❌ Cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup database' },
      { status: 500 }
    )
  }
}
