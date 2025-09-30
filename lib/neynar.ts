import axios from 'axios'
import { FarcasterProfile } from '@/types'

const NEYNAR_API_BASE = 'https://api.neynar.com/v2'

export interface NeynarUser {
  fid: number
  username: string
  display_name: string
  bio: string
  pfp_url: string | { url: string } | null
  follower_count: number
  following_count: number
  verifications: string[]
}

export interface NeynarAuthResponse {
  access_token: string
  user: NeynarUser
}

class NeynarClient {
  private apiKey: string
  private appId: string

  constructor() {
    this.apiKey = process.env.NEYNAR_API_KEY || ''
    this.appId = process.env.NEXT_PUBLIC_NEYNAR_APP_ID || ''
    
    if (!this.apiKey) {
      console.warn('⚠️  NEYNAR_API_KEY not set - some features may not work')
    }
    if (!this.appId) {
      console.warn('⚠️  NEXT_PUBLIC_NEYNAR_APP_ID not set - auth may not work')
    }
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    }
  }

  async getUserByFid(fid: number): Promise<FarcasterProfile | null> {
    if (!this.apiKey) {
      console.warn('Cannot fetch user by FID: NEYNAR_API_KEY not set')
      return null
    }

    try {
      const response = await axios.get(
        `${NEYNAR_API_BASE}/user/bulk?fids=${fid}`,
        { headers: this.getHeaders() }
      )
      
      const user = response.data.users?.[0]
      if (!user) return null

      return this.mapNeynarUserToProfile(user)
    } catch (error) {
      console.error('Failed to fetch user by FID:', error)
      return null
    }
  }

  async getUserByUsername(username: string): Promise<FarcasterProfile | null> {
    if (!this.apiKey) {
      console.warn('Cannot fetch user by username: NEYNAR_API_KEY not set')
      return null
    }

    try {
      const response = await axios.get(
        `${NEYNAR_API_BASE}/user/search?q=${encodeURIComponent(username)}`,
        { headers: this.getHeaders() }
      )
      
      const user = response.data.result?.users?.[0]
      if (!user) return null

      return this.mapNeynarUserToProfile(user)
    } catch (error) {
      console.error('Failed to fetch user by username:', error)
      return null
    }
  }

  private mapNeynarUserToProfile(user: NeynarUser): FarcasterProfile {
    // Ensure pfpUrl is always a string
    let pfpUrl = ''
    if (user.pfp_url) {
      if (typeof user.pfp_url === 'string') {
        pfpUrl = user.pfp_url
      } else if (typeof user.pfp_url === 'object' && user.pfp_url.url) {
        // Handle case where pfp_url is an object with a url property
        pfpUrl = user.pfp_url.url
      }
    }

    return {
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      bio: user.bio || '',
      pfpUrl,
      followerCount: user.follower_count || 0,
      followingCount: user.following_count || 0,
      verifications: user.verifications || [],
    }
  }

  // Create auth URL for Neynar OAuth
  createAuthUrl(redirectUri?: string): string {
    if (!this.appId) {
      throw new Error('NEXT_PUBLIC_NEYNAR_APP_ID is required for authentication')
    }

    const redirect = redirectUri || `${process.env.NEXT_PUBLIC_PUBLIC_HOST}/farcaster`
    const encodedRedirect = encodeURIComponent(redirect)
    
    return `https://app.neynar.com/oauth?client_id=${this.appId}&redirect_uri=${encodedRedirect}&scope=read_profile`
  }

  // Validate auth token with Neynar
  async validateAuthToken(token: string): Promise<FarcasterProfile | null> {
    // Handle mock tokens for development
    if (token && token.startsWith('mock_')) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Using mock user for development')
        return {
          fid: 12345,
          username: 'testuser',
          displayName: 'Test User',
          bio: 'Test Farcaster user for development',
          pfpUrl: 'https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_png,w_256/https%3A%2F%2Flh3.googleusercontent.com%2Fa%2FAAcHTtcS5_eBNlN7qVXqjI8GMsQQSQ7UQJQ8q7QQ7QQ',
          followerCount: 100,
          followingCount: 50,
          verifications: [],
        }
      }
      return null
    }

    // Handle Farcaster SDK tokens
    if (token.startsWith('fc_')) {
      const parts = token.split('_')
      if (parts.length >= 2) {
        const fid = parseInt(parts[1])
        if (!isNaN(fid)) {
          return await this.getUserByFid(fid)
        }
      }
    }

    if (!this.apiKey) {
      console.warn('Cannot validate token: NEYNAR_API_KEY not set')
      return null
    }
    
    try {
      // Validate token with Neynar API
      const response = await axios.get(
        `${NEYNAR_API_BASE}/me`,
        { 
          headers: { 
            ...this.getHeaders(),
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      return this.mapNeynarUserToProfile(response.data.user)
    } catch (error) {
      console.error('Failed to validate auth token:', error)
      return null
    }
  }

  // Exchange OAuth code for access token
  async exchangeCodeForToken(code: string): Promise<{ token: string; user: FarcasterProfile } | null> {
    if (!this.apiKey || !this.appId) {
      throw new Error('NEYNAR_API_KEY and NEXT_PUBLIC_NEYNAR_APP_ID are required')
    }

    try {
      const response = await axios.post(
        `${NEYNAR_API_BASE}/oauth/token`,
        {
          client_id: this.appId,
          client_secret: this.apiKey,
          code,
          grant_type: 'authorization_code'
        },
        { headers: this.getHeaders() }
      )

      const { access_token, user } = response.data
      
      return {
        token: access_token,
        user: this.mapNeynarUserToProfile(user)
      }
    } catch (error) {
      console.error('Failed to exchange code for token:', error)
      return null
    }
  }
}

export const neynar = new NeynarClient()