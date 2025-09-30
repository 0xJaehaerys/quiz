import { sdk } from '@farcaster/miniapp-sdk'

// Initialize Farcaster SDK
let isInitialized = false

export async function initFarcasterSDK() {
  if (typeof window === 'undefined') {
    throw new Error('Farcaster SDK can only be initialized in the browser')
  }

  if (!isInitialized) {
    try {
      await sdk.actions.ready()
      isInitialized = true
      console.log('Farcaster SDK initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Farcaster SDK:', error)
      throw error
    }
  }

  return sdk
}

export function getFarcasterSDK() {
  return sdk
}

export async function notifyReady() {
  try {
    if (!isInitialized) {
      await initFarcasterSDK()
    }
    await sdk.actions.ready()
    console.log('Mini app ready')
  } catch (error) {
    console.warn('Failed to notify Farcaster that app is ready:', error)
  }
}

export async function setAppTitle(title: string) {
  try {
    if (!isInitialized) {
      await initFarcasterSDK()
    }
    if ((sdk.actions as any).setTitle) {
      await (sdk.actions as any).setTitle(title)
    }
  } catch (error) {
    console.warn('Failed to set app title:', error)
  }
}

export async function openUrl(url: string) {
  try {
    if (!isInitialized) {
      await initFarcasterSDK()
    }
    await sdk.actions.openUrl(url)
  } catch (error) {
    console.warn('Failed to open URL:', error)
    // Fallback to window.open
    window.open(url, '_blank')
  }
}

export function isFarcasterEnvironment(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    // Check for Farcaster-specific user agent or context
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isFarcasterUA = userAgent.includes('farcaster')
    
    // Check for Farcaster context
    const hasFarcasterContext = !!(window as any).farcaster || !!(window as any).fc
    
    // Check if SDK exists (simplified check)
    const hasSdkContext = !!sdk?.context
    
    return isFarcasterUA || hasFarcasterContext || hasSdkContext
  } catch (error) {
    console.error('Error checking Farcaster environment:', error)
    return false
  }
}

export function getPublicUrl(): string {
  return process.env.NEXT_PUBLIC_PUBLIC_HOST || 'http://localhost:3000'
}

// Get current user context from Farcaster
export async function getCurrentFarcasterUser() {
  try {
    if (!isInitialized) {
      await initFarcasterSDK()
    }
    
    // Try to get user context from SDK
    if (sdk.context) {
      const context = await sdk.context
      if (context?.user) {
        return {
          fid: context.user.fid,
          username: context.user.username || '',
          displayName: context.user.displayName || '',
          pfpUrl: context.user.pfpUrl || '',
          bio: (context.user as any).bio || '',
          followerCount: (context.user as any).followerCount || 0,
          followingCount: (context.user as any).followingCount || 0,
          verifications: (context.user as any).verifications || []
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Failed to get current Farcaster user:', error)
    return null
  }
}

// Trigger Farcaster auth
export async function triggerFarcasterAuth() {
  try {
    if (!isInitialized) {
      await initFarcasterSDK()
    }
    
    // Use Farcaster's built-in auth flow
    if ((sdk.actions as any).signIn) {
      await (sdk.actions as any).signIn()
      return true
    }
    
    // Fallback - open Farcaster auth URL
    const authUrl = `https://warpcast.com/~/oauth?client_id=${process.env.NEXT_PUBLIC_NEYNAR_APP_ID}&redirect_uri=${encodeURIComponent(getPublicUrl())}`
    await openUrl(authUrl)
    return false
  } catch (error) {
    console.error('Failed to trigger Farcaster auth:', error)
    return false
  }
}