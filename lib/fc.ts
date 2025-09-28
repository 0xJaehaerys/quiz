// Mock Farcaster SDK for development
interface MockMiniAppSDK {
  actions: {
    ready: () => Promise<void>;
    setTitle: (title: string) => Promise<void>;
    openUrl: (url: string) => Promise<void>;
  };
  context: {
    isInstalled: boolean;
  };
}

let sdk: MockMiniAppSDK | null = null

export function initFarcasterSDK(): MockMiniAppSDK {
  if (typeof window === 'undefined') {
    throw new Error('Farcaster SDK can only be initialized in the browser')
  }

  if (!sdk) {
    // Mock SDK for development - replace with real SDK when available
    sdk = {
      actions: {
        ready: async () => {
          console.log('Mock: Farcaster ready')
        },
        setTitle: async (title: string) => {
          console.log('Mock: Set title:', title)
          document.title = title
        },
        openUrl: async (url: string) => {
          console.log('Mock: Open URL:', url)
          window.open(url, '_blank')
        }
      },
      context: {
        isInstalled: typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      }
    }
  }
  
  return sdk
}

export function getFarcasterSDK(): MockMiniAppSDK {
  if (!sdk) {
    return initFarcasterSDK()
  }
  return sdk
}

export async function notifyReady() {
  try {
    const farcasterSDK = getFarcasterSDK()
    await farcasterSDK.actions.ready()
    console.log('Mini app ready')
  } catch (error) {
    console.warn('Failed to notify Farcaster that app is ready:', error)
  }
}

export async function setAppTitle(title: string) {
  try {
    const farcasterSDK = getFarcasterSDK()
    if (farcasterSDK.actions.setTitle) {
      await farcasterSDK.actions.setTitle(title)
    }
  } catch (error) {
    console.warn('Failed to set app title:', error)
  }
}

export async function openUrl(url: string) {
  try {
    const farcasterSDK = getFarcasterSDK()
    await farcasterSDK.actions.openUrl(url)
  } catch (error) {
    console.warn('Failed to open URL:', error)
    // Fallback to window.open
    window.open(url, '_blank')
  }
}

export function isFarcasterEnvironment(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check if running in Farcaster Mini App environment
  try {
    const farcasterSDK = getFarcasterSDK()
    return farcasterSDK.context.isInstalled
  } catch {
    return false
  }
}

export function getPublicUrl(): string {
  return process.env.NEXT_PUBLIC_PUBLIC_HOST || 'http://localhost:3000'
}
