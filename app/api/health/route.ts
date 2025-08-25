import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Check database connection
    await connectDB()
    const dbStatus = 'healthy'
    
    // Check environment variables
    const envStatus = {
      mongodb: !!process.env.MONGODB_URI,
      nextauth: !!process.env.NEXTAUTH_SECRET,
      google: !!process.env.GOOGLE_CLIENT_ID,
      assemblyai: !!process.env.ASSEMBLYAI_API_KEY,
      stripe: !!process.env.STRIPE_SECRET_KEY
    }
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbStatus,
        environment: envStatus
      }
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        database: 'unhealthy',
        environment: 'unknown'
      }
    }, { status: 503 })
  }
}
