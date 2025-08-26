import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Transcription } from '@/models'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // For now, use the development fallback user ID
    // In production, this should come from the authenticated session
    const userId = process.env.NODE_ENV === 'development' 
      ? '507f1f77bcf86cd799439011' 
      : '507f1f77bcf86cd799439011' // TODO: Get from session
    
    const objectId = new mongoose.Types.ObjectId(userId)
    
    // Get current month usage from transcriptions
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    // Calculate monthly hours from transcriptions
    const monthlyTranscriptions = await Transcription.find({
      userId: objectId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    })
    
    const monthlyHours = monthlyTranscriptions.reduce((total, transcription) => {
      return total + (transcription.audioDuration / 3600) // Convert seconds to hours
    }, 0)
    
    // Get total transcriptions count
    const totalTranscriptions = await Transcription.countDocuments({ userId: objectId })
    
    // Calculate total hours from all transcriptions
    const allTranscriptions = await Transcription.find({ userId: objectId })
    const totalHours = allTranscriptions.reduce((total, transcription) => {
      return total + (transcription.audioDuration / 3600) // Convert seconds to hours
    }, 0)
    
    return NextResponse.json({
      success: true,
      monthlyHours: monthlyHours,
      totalHours: totalHours,
      totalTranscriptions: totalTranscriptions
    })
    
  } catch (error) {
    console.error('❌ Error fetching usage stats:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch usage statistics' 
    }, { status: 500 })
  }
}
