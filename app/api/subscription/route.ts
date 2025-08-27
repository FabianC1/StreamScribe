import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { ObjectId } from 'mongodb'
import mongoose from 'mongoose'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
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
    
    const user = await db.collection('users').findOne(
      { _id: userId },
      { projection: { password: 0 } }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('🔍 User data from database:', {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      hoursUsed: user.hoursUsed,
      hoursLimit: user.hoursLimit
    })

    // Determine subscription tier and features
    let tier = 'Basic'
    let hoursTotal = 30
    let features = [
      '30 hours transcription per month',
      'TXT export format only',
      'Basic analytics',
      'Save notes',
      'Video history',
      'Ads shown'
    ]

    if (user.email === 'galaselfabian@gmail.com') {
      tier = 'Premium'
      hoursTotal = 100
      features = [
        '100 hours transcription per month',
        'All export formats (TXT, DOCX, SRT, VTT, MP3, MP4)',
        'AI-powered highlights & summaries',
        'Full theme customization',
        'Team collaboration features',
        'Advanced organization tools',
        'Priority phone support',
        'No ads'
      ]
    } else if (user.subscriptionTier === 'standard' || user.hoursLimit > 30) {
      tier = 'Standard'
      hoursTotal = 60
      features = [
        '60 hours transcription per month',
        'TXT, DOCX, and SRT export formats',
        'Advanced analytics with insights',
        'Enhanced video history',
        'Priority email support',
        'No ads'
      ]
    }

    const responseData = {
      firstName: user.firstName || 'User',
      lastName: user.lastName || 'User',
      email: user.email,
      subscriptionTier: user.subscriptionTier || 'basic',
      subscriptionStatus: user.subscriptionStatus || 'active',
      subscriptionStartDate: user.subscriptionStartDate || new Date(Date.now()),
      subscriptionEndDate: user.subscriptionEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      hoursUsed: user.hoursUsed || 0,
      hoursLimit: user.hoursLimit || hoursTotal,
      features
    }

    console.log('📤 Sending response data:', responseData)

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Subscription fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
