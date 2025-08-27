import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import { Transcription } from '@/models'
import mongoose from 'mongoose'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Get the authenticated user from NextAuth session
    const session = await getServerSession(authOptions) as any
    let userId: string | null = null
    
    if (session?.user?.id) {
      userId = session.user.id
      console.log('✅ Authenticated user ID from session:', userId)
    } else {
      // Try custom auth token from Authorization header
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        // For now, we'll use the token directly as userId
        // In production, you'd want to verify this token properly
        userId = token
        console.log('✅ Authenticated user ID from token:', userId)
      }
    }

    if (!userId) {
      console.error('❌ No authenticated user found')
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 })
    }
    
    const objectId = new mongoose.Types.ObjectId(userId)
    
    // Get current month usage from transcriptions
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    // Calculate monthly hours from transcriptions for THIS USER
    const monthlyTranscriptions = await Transcription.find({
      userId: objectId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    })
    
    const monthlyHours = monthlyTranscriptions.reduce((total, transcription) => {
      return total + (transcription.audioDuration / 3600) // Convert seconds to hours
    }, 0)
    
    // Get total transcriptions count for THIS USER
    const totalTranscriptions = await Transcription.countDocuments({ userId: objectId })
    
    // Calculate total hours from all transcriptions for THIS USER
    const allTranscriptions = await Transcription.find({ userId: objectId })
    const totalHours = allTranscriptions.reduce((total, transcription) => {
      return total + (transcription.audioDuration / 3600) // Convert seconds to hours
    }, 0)
    
    console.log(`✅ User ${userId} stats: ${monthlyHours.toFixed(2)}h this month, ${totalHours.toFixed(2)}h total, ${totalTranscriptions} transcriptions`)
    
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
