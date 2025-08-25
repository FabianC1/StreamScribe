import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '../../../../lib/mongodb'

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Connect to database
    const mongoose = await connectDB()
    const db = mongoose.connection.db

    if (!db) {
      throw new Error('Failed to connect to database')
    }

    // Get limit from query params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Fetch user's transcriptions
    const transcriptions = await db.collection('transcriptions')
      .find({ userId: userId })
      .sort({ cachedAt: -1 }) // Most recent first
      .limit(limit)
      .toArray()

    return NextResponse.json({
      success: true,
      transcriptions: transcriptions.map(t => ({
        _id: t._id.toString(),
        videoTitle: t.videoTitle,
        youtubeUrl: t.youtubeUrl,
        audioDuration: t.audioDuration,
        cachedAt: t.cachedAt,
        highlights: t.highlights || []
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
