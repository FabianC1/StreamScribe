import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../lib/mongodb'
import User from '../../../models/User'

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB()
    
    // Test database connection by counting users
    const userCount = await User.countDocuments()
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful!',
      userCount,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
