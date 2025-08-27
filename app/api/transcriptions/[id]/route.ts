import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Transcription, ProcessedVideos } from '@/models'

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
    
                                       // Also remove the ProcessedVideos record to allow re-transcription
       try {
         const videoId = deletedTranscription.videoId
         if (videoId) {
           // Use the same mockUserId that's used in the transcribe API
           const mockUserId = '507f1f77bcf86cd799439011'
           console.log('🧹 Attempting to remove ProcessedVideos record for video:', videoId, 'userId:', mockUserId)
           
           // Check if ProcessedVideos collection exists and has records
           const totalRecords = await ProcessedVideos.countDocuments({})
           console.log('📊 Total ProcessedVideos records in collection:', totalRecords)
           
           // First check if the record exists
           const existingRecord = await ProcessedVideos.findOne({ 
             videoId: videoId,
             userId: mockUserId 
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
               userId: mockUserId 
             })
             console.log('✅ ProcessedVideos record removed for video:', videoId, 'Result:', deleteResult)
             
             // Verify deletion
             const verifyRecord = await ProcessedVideos.findOne({ 
               videoId: videoId,
               userId: mockUserId 
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

