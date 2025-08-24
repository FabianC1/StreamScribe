import { NextRequest, NextResponse } from 'next/server'
import { getProgress, resetProgress } from '../../../../lib/progress'

export async function POST(request: NextRequest) {
  try {
    const { youtubeUrl } = await request.json()
    
    // Reset progress for new transcription
    resetProgress(youtubeUrl)
    
    return NextResponse.json({ success: true, progress: '🚀 Starting transcription...' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to start progress tracking' }, { status: 500 })
  }
}

export async function GET() {
  const progressData = getProgress()
  return NextResponse.json(progressData)
}
