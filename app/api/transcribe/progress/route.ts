import { NextRequest, NextResponse } from 'next/server'

// Global progress tracking
let currentProgress = '🚀 Starting transcription...'
let isCompleted = false
let currentUrl = ''

export async function POST(request: NextRequest) {
  try {
    const { youtubeUrl } = await request.json()
    
    // Reset progress for new transcription
    currentProgress = '🚀 Starting transcription...'
    isCompleted = false
    currentUrl = youtubeUrl
    
    return NextResponse.json({ success: true, progress: currentProgress })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to start progress tracking' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    progress: currentProgress, 
    isCompleted, 
    currentUrl 
  })
}

// Function to update progress (called from main transcribe route)
export function updateProgress(message: string) {
  currentProgress = message
  console.log('Progress updated:', message)
}

export function setCompleted() {
  isCompleted = true
  currentProgress = '✅ Transcription completed!'
}
