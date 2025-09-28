"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { FarcasterProfile } from '@/types'
import { neynar } from '@/lib/neynar'

interface NeynarContextType {
  user: FarcasterProfile | null
  isLoading: boolean
  signIn: () => void
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

  const signIn = () => {
    // For MVP, create a mock session
    const mockToken = `mock_${Date.now()}`
    localStorage.setItem('farcaster_token', mockToken)
    
    // Set mock user
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
    setError(null)
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
