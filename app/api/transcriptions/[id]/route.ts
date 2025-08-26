import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/mongodb'
import Transcription from '../../../../models/Transcription'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const transcriptionId = params.id
    
    // Find and delete the transcription
    const deletedTranscription = await Transcription.findByIdAndDelete(transcriptionId)
    
    if (!deletedTranscription) {
      return NextResponse.json(
        { error: 'Transcription not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { message: 'Transcription deleted successfully' },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error deleting transcription:', error)
    return NextResponse.json(
      { error: 'Failed to delete transcription' },
      { status: 500 }
    )
  }
}
