import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import { Transcription, ProcessedVideos } from '@/models'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user from session
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const userId = session.user.id
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
    
                                       // Also remove the ProcessedVideos record to allow re-transcription
       try {
         const videoId = deletedTranscription.videoId
         if (videoId) {
           console.log('🧹 Attempting to remove ProcessedVideos record for video:', videoId, 'userId:', userId)
           
           // Check if ProcessedVideos collection exists and has records
           const totalRecords = await ProcessedVideos.countDocuments({})
           console.log('📊 Total ProcessedVideos records in collection:', totalRecords)
           
           // First check if the record exists
           const existingRecord = await ProcessedVideos.findOne({ 
             videoId: videoId,
             userId: userId 
           })
           console.log('🔍 Found ProcessedVideos record:', existingRecord ? 'Yes' : 'No')
           
           if (existingRecord) {
             console.log('📋 ProcessedVideos record details:', {
               _id: existingRecord._id,
               videoId: existingRecord.videoId,
               userId: existingRecord.userId,
               processedAt: existingRecord.processedAt
             })
             
             // Delete by both videoId and userId to be more specific
             const deleteResult = await ProcessedVideos.deleteOne({ 
               videoId: videoId,
               userId: userId 
             })
             console.log('✅ ProcessedVideos record removed for video:', videoId, 'Result:', deleteResult)
             
             // Verify deletion
             const verifyRecord = await ProcessedVideos.findOne({ 
               videoId: videoId,
               userId: userId 
             })
             console.log('🔍 Verification - Record still exists after deletion:', verifyRecord ? 'Yes' : 'No')
           } else {
             console.log('ℹ️ No ProcessedVideos record found to delete for video:', videoId)
           }
         }
       } catch (cleanupError) {
         console.warn('⚠️ Failed to remove ProcessedVideos record:', cleanupError)
         console.error('❌ Full error details:', cleanupError)
         // Don't fail the deletion if cleanup fails
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

