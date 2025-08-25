import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { ObjectId } from 'mongodb'
import mongoose from 'mongoose'

// Create auth config for getServerSession that matches NextAuth
const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.userId
        session.user.email = token.email
        session.user.name = token.name
        session.user.image = token.image
      }
      return session
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.userId = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
      }
      return token
    },
  },
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Profile API called')
    const session = await getServerSession(authOptions)
    console.log('📋 Session data:', session)
    
    if (!session?.user?.id) {
      console.log('❌ No session or user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🆔 User ID from session:', session.user.id)
    await connectDB()
    const db = mongoose.connection.db
    
    if (!db) {
      console.log('❌ Database connection failed')
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }
    
    // Convert string ID to ObjectId
    const userId = new ObjectId(session.user.id)
    console.log('🔍 Searching for user with ObjectId:', userId)
    
    const user = await db.collection('users').findOne(
      { _id: userId },
      { projection: { password: 0 } }
    )

    console.log('👤 User found in database:', user)

    if (!user) {
      console.log('❌ User not found in database')
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

    const response = {
      name: displayName,
      email: user.email,
      timezone: user.timezone || 'UTC+0',
      language: user.language || 'English'
    }
    
    console.log('✅ Returning profile data:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ Profile fetch error:', error)
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
