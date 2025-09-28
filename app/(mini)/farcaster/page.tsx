"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NeynarProvider, useFarcasterUser } from '@/components/providers/NeynarProvider'
import { FarcasterDebug } from '@/components/FarcasterDebug'
import { notifyReady, setAppTitle, isFarcasterEnvironment } from '@/lib/fc'
import { ExternalLink, Smartphone, AlertCircle, User, LogIn, Play, Trophy, Target, Zap } from "lucide-react"

function FarcasterAppContent() {
  const [isReady, setIsReady] = useState(false)
  const [isFarcasterEnv, setIsFarcasterEnv] = useState(false)
  const { user, isLoading, signIn, error } = useFarcasterUser()
  const router = useRouter()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if we're in Farcaster environment
        const isInFarcaster = isFarcasterEnvironment()
        setIsFarcasterEnv(isInFarcaster)

        if (isInFarcaster) {
          // Notify Farcaster that the app is ready
          await notifyReady()
          await setAppTitle('Gelora Quiz')
        }
        
        setIsReady(true)
      } catch (error) {
        console.error('Failed to initialize app:', error)
        setIsReady(true)
      }
    }

    initializeApp()
  }, [])

  const handleContinueToQuizzes = () => {
    router.push('/farcaster/quizzes')
  }

  if (!isReady || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">Loading Gelora Quiz</p>
            <p className="text-sm text-muted">Preparing your quiz experience...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show instructions if not in Farcaster environment
  if (!isFarcasterEnv) {
    return (
      <div className="min-h-screen bg-bg p-4">
        <div className="max-w-2xl mx-auto pt-12 space-y-8 animate-fade-in-up">
          <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6 animate-fade-in">
                <AlertCircle className="w-8 h-8 text-destructive" strokeWidth={1.5} />
              </div>
              <CardTitle className="gelora-typography-h1 text-foreground">Open in Farcaster</CardTitle>
              <CardDescription className="text-base text-muted leading-relaxed">
                This Mini App is designed to work within the Farcaster ecosystem for the best experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-panel rounded-2xl p-6 border border-border space-y-4">
                <h3 className="font-semibold text-foreground">To access Gelora Quiz:</h3>
                <ol className="space-y-4 text-sm">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">1</span>
                    <span className="text-muted">Open the Farcaster mobile app</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">2</span>
                    <span className="text-muted">Enable Developer Mode in Settings</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">3</span>
                    <span className="text-muted">Add this Mini App URL in Developer section</span>
                  </li>
                </ol>
              </div>
              
              <Button variant="accent" size="lg" className="w-full" asChild>
                <a 
                  href="https://docs.farcaster.xyz/developers/mini-apps/overview" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Learn About Mini Apps
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Preview of the app */}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-accent" strokeWidth={1.5} />
              </div>
              <CardTitle className="text-foreground">Gelora Quiz Preview</CardTitle>
              <CardDescription className="text-muted leading-relaxed">
                Interactive quizzes about crypto, Web3, and NFTs with real-time scoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Crypto Basics", difficulty: "easy", icon: "₿" },
                  { name: "Web3 & DApps", difficulty: "hard", icon: "🌐" },
                  { name: "NFT Knowledge", difficulty: "medium", icon: "🎨" },
                ].map((quiz, index) => (
                  <div
                    key={quiz.name}
                    className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border animate-fade-in-up"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{quiz.icon}</span>
                      <span className="text-foreground font-medium">{quiz.name}</span>
                    </div>
                    <Badge variant={quiz.difficulty === 'easy' ? 'success' : quiz.difficulty === 'medium' ? 'default' : 'destructive'}>
                      {quiz.difficulty}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show sign in if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-bg p-4 flex items-center justify-center">
        <div className="w-full max-w-md animate-fade-in">
          <Card className="border-accent/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 animate-fade-in">
                <User className="w-8 h-8 text-accent" strokeWidth={1.5} />
              </div>
              <CardTitle className="gelora-typography-h1 text-foreground">Welcome to Gelora Quiz</CardTitle>
              <CardDescription className="text-base text-muted leading-relaxed">
                Sign in with your Farcaster account to start playing quizzes and tracking your progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl animate-fade-in">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              
              <Button onClick={signIn} variant="accent" size="lg" className="w-full">
                <LogIn className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Sign in with Farcaster
              </Button>
              
              <p className="text-xs text-muted text-center leading-relaxed">
                Your Farcaster profile will be used to save quiz progress and display on leaderboards.
                We respect your privacy and only access necessary profile information.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main authenticated view
  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="max-w-2xl mx-auto pt-8 space-y-8 animate-fade-in-up">
        {/* Welcome Header */}
        <Card className="border-accent/20">
          <CardHeader>
            <div className="flex items-center gap-4 animate-fade-in">
              <div className="relative">
                <img 
                  src={user.pfpUrl || '/default-avatar.png'} 
                  alt={user.displayName}
                  className="w-14 h-14 rounded-2xl border-2 border-accent/20"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                  <Zap className="w-3 h-3 text-accent-foreground" strokeWidth={2} />
                </div>
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl text-foreground">Welcome back, {user.displayName}!</CardTitle>
                <CardDescription className="text-muted">@{user.username}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={handleContinueToQuizzes} variant="accent" size="lg" className="w-full">
              <Play className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Start Playing Quizzes
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Available Quizzes", value: "12", icon: Target, color: "text-accent" },
            { label: "Completed", value: "0", icon: Trophy, color: "text-muted" },
            { label: "Best Score", value: "-", icon: Zap, color: "text-muted" },
          ].map((stat, index) => (
            <div key={stat.label} className="animate-fade-in-up">
              <Card className="text-center">
                <CardContent className="p-6">
                  <stat.icon className={`w-6 h-6 mx-auto mb-3 ${stat.color}`} strokeWidth={1.5} />
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Categories Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Quiz Categories</CardTitle>
            <CardDescription className="text-muted">
              Test your knowledge across different Web3 topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Cryptocurrency", count: 5, difficulty: "easy", icon: "₿" },
                { name: "Web3 & DApps", count: 4, difficulty: "hard", icon: "🌐" },
                { name: "NFTs", count: 3, difficulty: "medium", icon: "🎨" },
              ].map((category, index) => (
                <div
                  key={category.name}
                  className="flex items-center justify-between p-4 bg-panel rounded-2xl border border-border hover:bg-card transition-colors cursor-pointer group animate-fade-in-up"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{category.icon}</span>
                    <div>
                      <p className="font-medium text-foreground group-hover:text-accent transition-colors">{category.name}</p>
                      <p className="text-sm text-muted">{category.count} quizzes available</p>
                    </div>
                  </div>
                  <Badge 
                    variant={category.difficulty === 'easy' ? 'success' : 
                            category.difficulty === 'medium' ? 'default' : 'destructive'}
                  >
                    {category.difficulty}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function FarcasterMiniApp() {
  return (
    <NeynarProvider>
      <FarcasterAppContent />
      <FarcasterDebug />
    </NeynarProvider>
  )
}