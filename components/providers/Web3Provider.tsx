'use client'

import React from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

// Environment-based chain selection
const chains = process.env.NODE_ENV === 'production' ? [base] as const : [baseSepolia] as const
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'gelora-quiz-fallback'

// Wagmi configuration
const config = getDefaultConfig({
  appName: 'Gelora Quiz',
  projectId,
  chains,
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  ssr: true, // Enable SSR for Next.js
})

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

interface Web3ProviderProps {
  children: React.ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          modalSize="compact"
          theme={darkTheme()}
          showRecentTransactions={true}
          appInfo={{
            appName: 'Gelora Quiz',
            learnMoreUrl: 'https://gelora.study',
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

// Hook for checking if we're connected to the correct network
export function useCorrectNetwork() {
  return chains[0] // Primary chain
}

// Utility function to format Base addresses
export function formatBaseAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Base network information
export const BASE_NETWORK_INFO = {
  name: process.env.NODE_ENV === 'production' ? 'Base' : 'Base Sepolia',
  chainId: process.env.NODE_ENV === 'production' ? base.id : baseSepolia.id,
  explorerUrl: process.env.NODE_ENV === 'production' ? 'https://basescan.org' : 'https://sepolia.basescan.org',
  rpcUrl: process.env.NODE_ENV === 'production' ? 'https://mainnet.base.org' : 'https://sepolia.base.org',
} as const

export default Web3Provider
