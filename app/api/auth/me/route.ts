import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Connect to database
    const mongoose = await connectDB()
    const db = mongoose.connection.db

    if (!db) {
      throw new Error('Failed to connect to database')
    }

    // Convert string token to ObjectId and find user
    try {
      const objectId = new ObjectId(token)
      const user = await db.collection('users').findOne({ _id: objectId })
      
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        )
      }

      // Return user data (without password)
      const { password: _, ...userWithoutPassword } = user
      return NextResponse.json({
        success: true,
        user: userWithoutPassword
      })
    } catch (error) {
      // Invalid ObjectId format
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Auth verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
