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
