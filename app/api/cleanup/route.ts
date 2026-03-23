import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import { Transcription, ProcessedVideos, UsageTracking, User } from '@/models'
import { authOptions } from '../auth/[...nextauth]/route'

const PROTECTED_EMAIL = 'galaselfabian@gmail.com'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from session
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Only allow admin user to run cleanup
    if (session.user.email !== PROTECTED_EMAIL) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await connectDB()

    console.log('🧹 Starting database cleanup...')

    // Find the protected dev account so we can exclude their data
    const protectedUser = await User.findOne({ email: PROTECTED_EMAIL }).lean() as any
    const protectedUserId = protectedUser?._id

    // Delete all transcriptions EXCEPT those belonging to the protected account
    const transcriptionFilter = protectedUserId ? { userId: { $ne: protectedUserId } } : {}
    const transcriptionsDeleted = await Transcription.deleteMany(transcriptionFilter)
    console.log(`🗑️ Deleted ${transcriptionsDeleted.deletedCount} transcriptions (protected account preserved)`)

    // Delete all ProcessedVideos records EXCEPT those belonging to the protected account
    const processedVideosFilter = protectedUserId ? { userId: { $ne: protectedUserId } } : {}
    const processedVideosDeleted = await ProcessedVideos.deleteMany(processedVideosFilter)
    console.log(`🗑️ Deleted ${processedVideosDeleted.deletedCount} ProcessedVideos records`)

    // Delete all UsageTracking records EXCEPT those belonging to the protected account
    const usageTrackingFilter = protectedUserId ? { userId: { $ne: protectedUserId } } : {}
    const usageTrackingDeleted = await UsageTracking.deleteMany(usageTrackingFilter)
    console.log(`🗑️ Deleted ${usageTrackingDeleted.deletedCount} UsageTracking records`)

    // Reset hoursUsed to 0 for all users EXCEPT the protected account
    const usersFilter = protectedUserId ? { _id: { $ne: protectedUserId } } : {}
    const usersUpdated = await User.updateMany(
      usersFilter,
      { 
        $set: { 
          hoursUsed: 0,
          lastLoginAt: new Date()
        }
      }
    )
    console.log(`🔄 Reset hours used for ${usersUpdated.modifiedCount} users (protected account preserved)`)

    console.log('✅ Database cleanup completed successfully!')

    return NextResponse.json({
      success: true,
      message: 'Database cleanup completed (your account data was preserved)',
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
