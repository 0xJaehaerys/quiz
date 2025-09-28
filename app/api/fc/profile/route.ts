import { NextRequest, NextResponse } from 'next/server'
import { neynar } from '@/lib/neynar'

export async function GET(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No auth token provided' 
        },
        { status: 401 }
      )
    }

    // Validate token and get profile
    const profile = await neynar.validateAuthToken(token)
    
    if (!profile) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid auth token' 
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      profile
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch profile' 
      },
      { status: 500 }
    )
  }
}
