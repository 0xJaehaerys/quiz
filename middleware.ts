import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// In-memory rate limiting store (use Redis in production)
const rateLimit = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute
  skipSuccessfulRequests: false,
  skipFailedRequests: false
}

// API routes that should have rate limiting
const RATE_LIMITED_PATHS = [
  '/api/quizzes/submit',
  '/api/fc/profile',
  '/api/quizzes/list',
  '/api/quizzes/'
]

function isRateLimitedPath(pathname: string): boolean {
  return RATE_LIMITED_PATHS.some(path => 
    pathname.startsWith(path)
  )
}

function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers (handles proxies/CDNs)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  const ip = forwarded?.split(',')[0] || 
           realIp || 
           cfConnectingIp || 
           request.ip || 
           'unknown'

  // For authenticated requests, also consider user ID if available
  const userAgent = request.headers.get('user-agent') || ''
  
  return `${ip}_${userAgent.slice(0, 50)}` // Simple fingerprint
}

function cleanupExpiredEntries(): void {
  const now = Date.now()
  const keysToDelete: string[] = []
  
  rateLimit.forEach((value, key) => {
    if (now > value.resetTime) {
      keysToDelete.push(key)
    }
  })
  
  keysToDelete.forEach(key => rateLimit.delete(key))
}

function handleRateLimit(request: NextRequest): NextResponse | null {
  const clientId = getClientIdentifier(request)
  const now = Date.now()
  const windowMs = RATE_LIMIT_CONFIG.windowMs
  const maxRequests = RATE_LIMIT_CONFIG.maxRequests

  // Cleanup expired entries periodically
  if (Math.random() < 0.1) { // 10% chance to cleanup on each request
    cleanupExpiredEntries()
  }

  // Get or create rate limit entry
  let limitData = rateLimit.get(clientId)

  if (!limitData || now > limitData.resetTime) {
    // Create new window
    limitData = {
      count: 1,
      resetTime: now + windowMs
    }
    rateLimit.set(clientId, limitData)
  } else {
    // Increment counter
    limitData.count++
  }

  // Check if limit exceeded
  if (limitData.count > maxRequests) {
    console.warn(`🚫 Rate limit exceeded for ${clientId}: ${limitData.count}/${maxRequests}`)
    
    const retryAfter = Math.ceil((limitData.resetTime - now) / 1000)
    
    return NextResponse.json(
      { 
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter,
        limit: maxRequests,
        windowMs: windowMs / 1000
      },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': limitData.resetTime.toString(),
          'X-RateLimit-Window': (windowMs / 1000).toString()
        }
      }
    )
  }

  // Add rate limit headers to successful responses
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', maxRequests.toString())
  response.headers.set('X-RateLimit-Remaining', (maxRequests - limitData.count).toString())
  response.headers.set('X-RateLimit-Reset', limitData.resetTime.toString())
  response.headers.set('X-RateLimit-Window', (windowMs / 1000).toString())

  return response
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip rate limiting for non-API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Skip rate limiting for health checks and non-sensitive endpoints
  if (pathname === '/api/health' || pathname === '/api/status') {
    return NextResponse.next()
  }

  // Apply rate limiting to sensitive API endpoints
  if (isRateLimitedPath(pathname)) {
    console.log(`🔐 Applying rate limit to ${request.method} ${pathname}`)
    const rateLimitResponse = handleRateLimit(request)
    
    if (rateLimitResponse) {
      return rateLimitResponse
    }
  }

  // Security headers for all API routes
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    // Allow requests from Farcaster domains and localhost
    const origin = request.headers.get('origin')
    const allowedOrigins = [
      'https://warpcast.com',
      'https://client.farcaster.xyz', 
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ]
    
    if (origin && allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Max-Age', '86400') // 24 hours
  }

  return response
}

export const config = {
  matcher: [
    '/api/:path*', // Apply to all API routes
    '/((?!_next/static|_next/image|favicon.ico).*)', // Apply to all routes except static files
  ],
}

// Utility function to get current rate limit status (for debugging)
export function getRateLimitStatus(clientId?: string) {
  if (!clientId) return null
  
  const limitData = rateLimit.get(clientId)
  if (!limitData) return null
  
  return {
    count: limitData.count,
    resetTime: limitData.resetTime,
    remaining: Math.max(0, RATE_LIMIT_CONFIG.maxRequests - limitData.count),
    resetIn: Math.max(0, limitData.resetTime - Date.now())
  }
}
