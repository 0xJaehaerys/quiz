"use client"

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { QuizPlayer } from '@/components/QuizPlayer'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NeynarProvider, useFarcasterUser } from '@/components/providers/NeynarProvider'
import { Web3Provider } from '@/components/providers/Web3Provider'
import { QuizCompletionNFT } from '@/components/QuizCompletionNFT'
import { Quiz, QuizResult } from '@/types'
import { generateShareText, getDifficultyColor } from '@/lib/utils'
import { ArrowLeft, Loader2, AlertCircle, Trophy, Share2 } from "lucide-react"
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/hooks/useToast'

function QuizPageContent() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useFarcasterUser()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const quizId = params.id as string

  const fetchQuizData = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/quizzes/${quizId}`)
      
      if (response.ok) {
        const data = await response.json()
        setQuiz(data.quiz)
        setLeaderboard(data.leaderboard || [])
      } else if (response.status === 404) {
        setError('Quiz not found')
      } else {
        setError('Failed to load quiz')
      }
    } catch (err) {
      console.error('Error fetching quiz:', err)
      setError('Failed to load quiz')
    } finally {
      setIsLoading(false)
    }
  }, [quizId])

  useEffect(() => {
    if (quizId) {
      fetchQuizData()
    }
  }, [quizId, fetchQuizData])

  const handleQuizComplete = async (result: QuizResult) => {
    toast({
      title: "Quiz Completed!",
      description: `You scored ${result.score}% (${result.correctAnswers}/${result.totalQuestions})`,
    })
    
    // Refresh leaderboard
    fetchQuizData()
  }

  const handleShare = async (result: QuizResult, quiz: Quiz) => {
    const shareText = generateShareText(result, quiz.title)
    
    try {
      // In a real Farcaster Mini App, you would use the SDK to share
      if (navigator.share) {
        await navigator.share({
          title: 'My Quiz Result',
          text: shareText,
          url: window.location.href
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareText)
        toast({
          title: "Copied to clipboard!",
          description: "Share text copied. Paste it in your Farcaster app.",
        })
      }
    } catch (error) {
      console.error('Share failed:', error)
      toast({
        title: "Share failed",
        description: "Could not share result",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Quiz Not Found</CardTitle>
            <CardDescription>
              {error || 'The requested quiz could not be found.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/farcaster/quizzes">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quizzes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/farcaster/quizzes">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{quiz.title}</h1>
                <Badge 
                  variant="outline" 
                  className={getDifficultyColor(quiz.difficulty)}
                >
                  {quiz.difficulty}
                </Badge>
              </div>
              <p className="text-muted-foreground">{quiz.description}</p>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center gap-2">
              <Image 
                src={user.pfpUrl || '/default-avatar.png'} 
                alt={user.displayName}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full"
              />
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quiz Player */}
          <div className="lg:col-span-2">
            <QuizPlayer 
              quiz={quiz}
              onComplete={handleQuizComplete}
              onShare={handleShare}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quiz Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quiz Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Questions</span>
                  <span className="font-medium">{quiz.totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{quiz.category}</span>
                </div>
                {quiz.timeLimit && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Limit</span>
                    <span className="font-medium">
                      {Math.floor(quiz.timeLimit / 60)}:{(quiz.timeLimit % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Leaderboard
                </CardTitle>
                <CardDescription>
                  Top scores for this quiz
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No scores yet. Be the first to complete this quiz!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.slice(0, 5).map((entry: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-sm">{entry.displayName}</p>
                            <p className="text-xs text-muted-foreground">@{entry.username}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-primary">{entry.score}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Share */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Share Quiz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const shareText = `🧠 Check out "${quiz.title}" on Gelora Quiz!\n\nTest your ${quiz.category} knowledge with ${quiz.totalQuestions} questions.\n\nPlay it yourself! 🚀`
                    
                    if (navigator.share) {
                      navigator.share({
                        title: quiz.title,
                        text: shareText,
                        url: window.location.href
                      })
                    } else {
                      navigator.clipboard.writeText(shareText)
                      toast({
                        title: "Copied to clipboard!",
                        description: "Share text copied.",
                      })
                    }
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Quiz
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function QuizPage() {
  return (
    <Web3Provider>
      <NeynarProvider>
        <QuizPageContent />
      </NeynarProvider>
    </Web3Provider>
  )
}


