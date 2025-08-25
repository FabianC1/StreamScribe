import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { ObjectId } from 'mongodb'
import mongoose from 'mongoose'

// Create auth config for getServerSession
const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [], // Empty providers array for getServerSession
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const db = mongoose.connection.db
    
    if (!db) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }
    
    // Convert string ID to ObjectId
    const userId = new ObjectId(session.user.id)
    
    // Get current month start date
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    // Count transcriptions this month
    const transcriptionsThisMonth = await db.collection('transcriptions').countDocuments({
      userId: userId,
      createdAt: { $gte: monthStart }
    })
    
    // Count total exports
    const totalExports = await db.collection('exportHistory').countDocuments({
      userId: userId
    })

    return NextResponse.json({
      transcriptionsThisMonth,
      totalExports
    })
  } catch (error) {
    console.error('Stats fetch error:', error)
    // Return default values if there's an error
    return NextResponse.json({
      transcriptionsThisMonth: 0,
      totalExports: 0
    })
  }
}
