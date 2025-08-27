import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import { Transcription } from '@/models'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from session
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const userId = session.user.id
    await connectDB()
    
    // Get recent transcriptions for the user
    const recentTranscriptions = await Transcription.find({ userId: userId })
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
