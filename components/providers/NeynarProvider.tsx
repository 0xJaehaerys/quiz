"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { FarcasterProfile } from '@/types'
import { neynar } from '@/lib/neynar'
import { getCurrentFarcasterUser, triggerFarcasterAuth, isFarcasterEnvironment } from '@/lib/fc'

interface NeynarContextType {
  user: FarcasterProfile | null
  isLoading: boolean
  signIn: () => Promise<void>
  signOut: () => void
  error: string | null
}

const NeynarContext = createContext<NeynarContextType | null>(null)

interface NeynarProviderProps {
  children: ReactNode
}

export function NeynarProvider({ children }: NeynarProviderProps) {
  const [user, setUser] = useState<FarcasterProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for existing session
    checkExistingSession()
  }, [])

  const checkExistingSession = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Check for OAuth callback parameters
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        
        if (code) {
          console.log('Found OAuth code, exchanging for token...')
          try {
            const result = await neynar.exchangeCodeForToken(code)
            if (result?.user) {
              setUser(result.user)
              localStorage.setItem('farcaster_token', result.token)
              // Clean up URL
              window.history.replaceState({}, document.title, window.location.pathname)
              setIsLoading(false)
              return
            }
          } catch (oauthError) {
            console.error('OAuth token exchange failed:', oauthError)
          }
        }
      }

      // Try to get current user from Farcaster SDK (if in Farcaster environment)
      if (isFarcasterEnvironment()) {
        const farcasterUser = await getCurrentFarcasterUser()
        
        if (farcasterUser) {
          setUser(farcasterUser)
          console.log('Found Farcaster user:', farcasterUser.username)
          setIsLoading(false)
          return
        }
      }

      // Check localStorage for stored token
      const token = localStorage.getItem('farcaster_token')
      
      if (token) {
        const profile = await neynar.validateAuthToken(token)
        if (profile) {
          setUser(profile)
        } else {
          localStorage.removeItem('farcaster_token')
        }
      }
    } catch (err) {
      console.error('Session check failed:', err)
      setError('Failed to check session')
      localStorage.removeItem('farcaster_token')
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Check if we're in Farcaster environment
      if (isFarcasterEnvironment()) {
        // Try Farcaster SDK auth first
        const authSuccess = await triggerFarcasterAuth()
        
        if (authSuccess) {
          // Check for user after auth
          setTimeout(async () => {
            const farcasterUser = await getCurrentFarcasterUser()
            if (farcasterUser) {
              setUser(farcasterUser)
              // Store a token for session persistence
              localStorage.setItem('farcaster_token', `fc_${farcasterUser.fid}_${Date.now()}`)
            }
          }, 1000)
          return
        }
      }

      // For browser/non-Farcaster environment, use Neynar OAuth
      try {
        const authUrl = neynar.createAuthUrl()
        console.log('Opening Neynar auth:', authUrl)
        
        // Open auth URL in new window/tab
        if (typeof window !== 'undefined') {
          window.open(authUrl, '_blank', 'width=500,height=600,scrollbars=yes,resizable=yes')
        }
        
        // Show instructions to user
        setError('Please complete authentication in the popup window and return here.')
      } catch (authError) {
        console.error('Neynar auth failed:', authError)
        
        // Final fallback for development/testing
        if (process.env.NODE_ENV === 'development') {
          console.warn('Using mock auth for development')
          const mockUser: FarcasterProfile = {
            fid: 12345,
            username: 'testuser',
            displayName: 'Test User',
            bio: 'Test Farcaster user for development',
            pfpUrl: 'https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_png,w_256/https%3A%2F%2Flh3.googleusercontent.com%2Fa%2FAAcHTtcS5_eBNlN7qVXqjI8GMsQQSQ7UQJQ8q7QQ7QQ',
            followerCount: 100,
            followingCount: 50,
            verifications: [],
          }
          
          setUser(mockUser)
          localStorage.setItem('farcaster_token', `mock_${Date.now()}`)
        } else {
          throw new Error('Authentication failed. Please try again or use the Farcaster mobile app.')
        }
      }
    } catch (err) {
      console.error('Sign in failed:', err)
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    localStorage.removeItem('farcaster_token')
    setUser(null)
    setError(null)
  }

  const contextValue: NeynarContextType = {
    user,
    isLoading,
    signIn,
    signOut,
    error
  }

  return (
    <NeynarContext.Provider value={contextValue}>
      {children}
    </NeynarContext.Provider>
  )
}

export function useFarcasterUser() {
  const context = useContext(NeynarContext)
  if (!context) {
    throw new Error('useFarcasterUser must be used within NeynarProvider')
  }
  return context
}