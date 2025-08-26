import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '../../../../lib/mongodb'
import { Transcription } from '@/models'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null

    // Try NextAuth session first
    const session = await getServerSession()
    if (session?.user?.id) {
      userId = session.user.id
    } else {
      // Try custom auth token from Authorization header
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        // For now, we'll use the token directly as userId
        // In production, you'd want to verify this token properly
        userId = token
      }
    }

    if (!userId) {
      // For development, allow a fallback user ID
      if (process.env.NODE_ENV === 'development') {
        userId = '507f1f77bcf86cd799439011' // Fallback for development
        console.log('🔧 Development mode: Using fallback user ID:', userId)
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Connect to database
    await connectDB()

    // Get limit from query params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Convert string userId to ObjectId if it's a valid ObjectId string
    let queryUserId: string | mongoose.Types.ObjectId = userId
    if (mongoose.Types.ObjectId.isValid(userId)) {
      queryUserId = new mongoose.Types.ObjectId(userId)
      console.log('🔧 Converted userId to ObjectId:', queryUserId)
    }
    
         // Fetch user's transcriptions using Mongoose model
     const transcriptions = await Transcription.find({ userId: queryUserId })
       .sort({ createdAt: -1, cachedAt: -1 }) // Most recent first, fallback to cachedAt
       .lean()
     
           // Remove duplicates based on videoId (keep the most recent one, treat missing status as completed)
      const uniqueTranscriptions = transcriptions.reduce((acc: any[], transcription: any) => {
        // Treat transcriptions without status as completed (for backward compatibility)
        if (transcription.status === 'failed') {
          return acc
        }
        
        const existingIndex = acc.findIndex(t => t.videoId === transcription.videoId)
        if (existingIndex === -1) {
          acc.push(transcription)
        } else {
          // If this transcription is more recent, replace the existing one
          const existingDate = new Date(acc[existingIndex].createdAt || acc[existingIndex].cachedAt)
          const currentDate = new Date(transcription.createdAt || transcription.cachedAt)
          if (currentDate > existingDate) {
            acc[existingIndex] = transcription
          }
        }
        return acc
      }, [])
     
     // Apply limit after deduplication
     const limitedTranscriptions = uniqueTranscriptions.slice(0, limit)

         return NextResponse.json({
       success: true,
                transcriptions: limitedTranscriptions.map((t: any) => ({
           _id: t._id.toString(),
           videoTitle: t.videoTitle,
           youtubeUrl: t.youtubeUrl,
           videoId: t.videoId,
           audioDuration: t.audioDuration,
           cachedAt: t.cachedAt,
           createdAt: t.createdAt,
           highlights: t.highlights || [],
           confidence: t.confidence || 0,
           status: t.status || 'completed' // Default to completed for backward compatibility
         }))
     })

  } catch (error) {
    console.error('Error fetching transcriptions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
