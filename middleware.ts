import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '1000') // Increased from 100 to 1000
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000') // Reduced from 15 minutes to 1 minute

export function middleware(request: NextRequest) {
  // Skip rate limiting for static files and important routes
  if (request.nextUrl.pathname.startsWith('/_next') || 
      request.nextUrl.pathname.startsWith('/api/health') ||
      request.nextUrl.pathname.startsWith('/api/auth') ||
      request.nextUrl.pathname.startsWith('/loading') ||
      request.nextUrl.pathname.startsWith('/transcription-results')) {
    return NextResponse.next()
  }

  // Get client IP
  const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  
  // Check rate limit
  const now = Date.now()
  const clientData = rateLimitStore.get(clientIP)
  
  if (clientData && now < clientData.resetTime) {
    if (clientData.count >= RATE_LIMIT_MAX) {
      return new NextResponse('Too Many Requests', { status: 429 })
    }
    clientData.count++
  } else {
    rateLimitStore.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS
    })
  }

  // Security headers
  const response = NextResponse.next()
  
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Add CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
