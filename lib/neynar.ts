import axios from 'axios'
import { FarcasterProfile } from '@/types'

const NEYNAR_API_BASE = 'https://api.neynar.com/v2'

export interface NeynarUser {
  fid: number
  username: string
  display_name: string
  bio: string
  pfp_url: string
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
      console.warn('NEYNAR_API_KEY not set')
    }
    if (!this.appId) {
      console.warn('NEXT_PUBLIC_NEYNAR_APP_ID not set')
    }
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    }
  }

  async getUserByFid(fid: number): Promise<FarcasterProfile | null> {
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
    return {
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      bio: user.bio,
      pfpUrl: user.pfp_url,
      followerCount: user.follower_count,
      followingCount: user.following_count,
      verifications: user.verifications || [],
    }
  }

  // Mock auth flow for development
  createMockAuthUrl(): string {
    const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_PUBLIC_HOST}/api/fc/callback`)
    return `${NEYNAR_API_BASE}/auth?client_id=${this.appId}&redirect_uri=${redirectUri}`
  }

  // In a real implementation, this would validate the auth token
  async validateAuthToken(token: string): Promise<FarcasterProfile | null> {
    // For MVP, return mock user if token exists
    if (token && token.startsWith('mock_')) {
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
    
    try {
      // In production, validate token with Neynar
      const response = await axios.get(
        `${NEYNAR_API_BASE}/me`,
        { 
          headers: { 
            ...this.getHeaders(),
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      return this.mapNeynarUserToProfile(response.data)
    } catch (error) {
      console.error('Failed to validate auth token:', error)
      return null
    }
  }
}

export const neynar = new NeynarClient()
