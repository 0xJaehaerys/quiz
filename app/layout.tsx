import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { NavBar } from '@/components/NavBar'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Gelora Quiz',
  description: 'Interactive quiz platform built for Farcaster - Test your knowledge with crypto, Web3, and NFT quizzes',
  keywords: ['quiz', 'farcaster', 'crypto', 'web3', 'nft', 'blockchain', 'education'],
  authors: [{ name: 'Gelora Team' }],
  creator: 'Gelora',
  publisher: 'Gelora',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
  metadataBase: new URL('https://quiz.gelora.study'),
  openGraph: {
    title: 'Gelora Quiz - Interactive Farcaster Mini App',
    description: 'Test your knowledge with interactive quizzes built for the Farcaster ecosystem',
    type: 'website',
    locale: 'en_US',
    siteName: 'Gelora Quiz',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gelora Quiz',
    description: 'Interactive quiz platform built for Farcaster',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        <div className="min-h-screen bg-bg text-foreground">
          <NavBar />
          <main className="gelora-container gelora-section-padding">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  )
}