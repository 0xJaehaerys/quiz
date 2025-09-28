import { NextRequest, NextResponse } from 'next/server'
import { neynar } from '@/lib/neynar'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fid = searchParams.get('fid')
    const username = searchParams.get('username')
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')

    // If we have a token, validate it
    if (token) {
      const profile = await neynar.validateAuthToken(token)
      if (profile) {
        return NextResponse.json({ profile })
      }
    }

    // If we have FID, fetch by FID
    if (fid) {
      const profile = await neynar.getUserByFid(parseInt(fid))
      if (profile) {
        return NextResponse.json({ profile })
      }
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If we have username, fetch by username
    if (username) {
      const profile = await neynar.getUserByUsername(username)
      if (profile) {
        return NextResponse.json({ profile })
      }
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ error: 'Authorization code required' }, { status: 400 })
    }

    // Exchange OAuth code for token
    const result = await neynar.exchangeCodeForToken(code)
    
    if (!result) {
      return NextResponse.json({ error: 'Failed to exchange code' }, { status: 400 })
    }

    return NextResponse.json({
      token: result.token,
      user: result.user
    })
  } catch (error) {
    console.error('Error processing OAuth callback:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}