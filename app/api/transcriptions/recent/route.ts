import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Transcription } from '@/models'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // TODO: Get actual user ID from session/auth
    const mockUserId = '507f1f77bcf86cd799439011'
    
    // Get recent transcriptions for the user
    const recentTranscriptions = await Transcription.find({ userId: mockUserId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('videoTitle youtubeUrl audioDuration createdAt confidence')
    
    return NextResponse.json({
      success: true,
      transcriptions: recentTranscriptions
    })
    
  } catch (error) {
    console.error('❌ Error fetching recent transcriptions:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch recent transcriptions' 
    }, { status: 500 })
  }
}
