// Farcaster Mini App SDK integration
let farcasterSdk: any = null
let isInitialized = false

export async function initFarcasterSDK() {
  if (typeof window === 'undefined') {
    console.log('Not in browser environment')
    return false
  }

  if (isInitialized) {
    return true
  }

  try {
    // Import the sdk object from the package
    const { sdk } = await import('@farcaster/miniapp-sdk')
    farcasterSdk = sdk
    isInitialized = true
    console.log('🔗 Farcaster SDK imported successfully')
    console.log('SDK structure:', Object.keys(sdk))
    if (sdk.actions) {
      console.log('SDK actions:', Object.keys(sdk.actions))
    }
    return true
  } catch (error) {
    console.warn('⚠️ Farcaster SDK not available:', error)
    console.warn('Error details:', error)
    return false
  }
}

export async function notifyReady() {
  try {
    if (typeof window === 'undefined') {
      console.log('Not in browser, skipping ready notification')
      return false
    }
    
    // Initialize SDK if not already done
    if (!isInitialized) {
      const initialized = await initFarcasterSDK()
      if (!initialized) {
        console.log('SDK not available, skipping ready notification')
        return false
      }
    }
    
    if (!farcasterSdk || !farcasterSdk.actions || !farcasterSdk.actions.ready) {
      console.warn('SDK actions.ready not available')
      console.warn('Available SDK:', farcasterSdk)
      return false
    }
    
    // Call ready using the correct structure
    console.log('📢 Calling sdk.actions.ready()...')
    await farcasterSdk.actions.ready()
    console.log('✅ Mini app ready notification sent to Farcaster successfully!')
    
    return true
  } catch (error) {
    console.warn('⚠️ Failed to notify Farcaster that app is ready:', error)
    console.warn('Error details:', error)
    console.warn('This is normal if not running in Farcaster environment')
    return false
  }
}

export function getFarcasterSDK() {
  return farcasterSdk
}

export async function setAppTitle(title: string) {
  try {
    if (!isInitialized) {
      await initFarcasterSDK()
    }
    
    // Check if there's a setTitle action available
    if (farcasterSdk?.actions?.setTitle) {
      await farcasterSdk.actions.setTitle(title)
      console.log('📝 App title set:', title)
    } else {
      console.log('📝 App title requested:', title)
      console.warn('setTitle action not available in current SDK version')
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
    
    // Check if there's an openUrl action available
    if (farcasterSdk?.actions?.openUrl) {
      await farcasterSdk.actions.openUrl(url)
      console.log('🔗 URL opened via SDK:', url)
    } else {
      // Fallback to window.open
      console.log('🔗 Opening URL via fallback:', url)
      window.open(url, '_blank')
    }
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
    const isFarcasterUA = userAgent.includes('farcaster') || userAgent.includes('warpcast')
    
    // Check for Farcaster context
    const hasFarcasterContext = !!(window as any).farcaster || !!(window as any).fc
    
    // Check if SDK exists and has context
    const hasSdkContext = !!farcasterSdk?.context
    
    // Check for Mini App specific indicators
    const hasFrameContext = !!(window as any).parent && window.parent !== window
    
    // More aggressive detection - if any indicator exists, assume Farcaster
    const result = isFarcasterUA || hasFarcasterContext || hasSdkContext || hasFrameContext
    
    console.log('🔍 Farcaster Environment Check:', {
      userAgent: userAgent,
      isFarcasterUA,
      hasFarcasterContext,
      hasSdkContext,
      hasFrameContext,
      result
    })
    
    return result
  } catch (error) {
    console.error('Error checking Farcaster environment:', error)
    // If in doubt, assume we might be in Farcaster (better to try and fail gracefully)
    return true
  }
}

export function getPublicUrl(): string {
  return process.env.NEXT_PUBLIC_PUBLIC_HOST || 'http://localhost:3000'
}

// Get current user context from Farcaster
export async function getCurrentFarcasterUser() {
  try {
    if (!isInitialized) {
      const initialized = await initFarcasterSDK()
      if (!initialized) {
        return null
      }
    }
    
    // Try to get user context from SDK
    if (farcasterSdk?.context) {
      try {
        const context = await farcasterSdk.context
        console.log('Context received:', context)
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
      } catch (contextError) {
        console.warn('Failed to get context:', contextError)
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
      const initialized = await initFarcasterSDK()
      if (!initialized) {
        return false
      }
    }
    
    // Use Farcaster's built-in auth flow
    if (farcasterSdk?.actions?.signIn) {
      await farcasterSdk.actions.signIn()
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