import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Transcription from '@/models/Transcription'

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
    
    const { searchParams } = new URL(request.url)
    const youtubeUrl = searchParams.get('youtubeUrl')
    
    if (!youtubeUrl) {
      return NextResponse.json({ 
        error: 'Missing youtubeUrl parameter' 
      }, { status: 400 })
    }
    
    // Find user by email
    const User = require('@/models/User').default
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Search for transcription by YouTube URL for this user
    const transcription = await Transcription.findOne({
      userId: user._id,
      youtubeUrl: youtubeUrl
    })
    
    if (!transcription) {
      return NextResponse.json({
        success: false,
        message: 'No transcription found for this URL',
        transcription: null
      })
    }
    
    return NextResponse.json({
      success: true,
      transcription: {
        _id: transcription._id,
        youtubeUrl: transcription.youtubeUrl,
        videoTitle: transcription.videoTitle,
        videoId: transcription.videoId,
        createdAt: transcription.createdAt
      }
    })
    
  } catch (error) {
    console.error('Error searching for transcription:', error)
    return NextResponse.json({ 
      error: 'Failed to search for transcription' 
    }, { status: 500 })
  }
}
