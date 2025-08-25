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
    
    const user = await db.collection('users').findOne(
      { _id: userId },
      { projection: { password: 0 } }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Handle different name field formats
    let displayName = ''
    if (user.name) {
      displayName = user.name
    } else if (user.firstName && user.lastName) {
      displayName = `${user.firstName} ${user.lastName}`
    } else if (user.firstName) {
      displayName = user.firstName
    } else {
      displayName = 'User'
    }

    return NextResponse.json({
      name: displayName,
      email: user.email,
      timezone: user.timezone || 'UTC+0',
      language: user.language || 'English'
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, timezone, language } = body

    // Validate input
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    await connectDB()
    const db = mongoose.connection.db
    
    if (!db) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }
    
    // Convert string ID to ObjectId
    const userId = new ObjectId(session.user.id)
    
    // Split name into firstName and lastName for consistency
    const nameParts = name.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''
    
    const result = await db.collection('users').updateOne(
      { _id: userId },
      {
        $set: {
          name: name, // Store full name
          firstName: firstName,
          lastName: lastName,
          email: email,
          timezone: timezone || 'UTC+0',
          language: language || 'English',
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
