"use client"

import { useEffect, useState, useCallback } from 'react'
import { QuizCard } from '@/components/QuizCard'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { NeynarProvider, useFarcasterUser } from '@/components/providers/NeynarProvider'
import { Quiz } from '@/types'
import { ArrowLeft, Filter, Search, Loader2 } from "lucide-react"
import Link from 'next/link'
import Image from 'next/image'

function QuizzesContent() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { user } = useFarcasterUser()

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/quizzes/list')
      if (response.ok) {
        const data = await response.json()
        setQuizzes(data.quizzes)
      } else {
        console.error('Failed to fetch quizzes')
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterQuizzes = useCallback(() => {
    let filtered = quizzes

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(quiz => quiz.difficulty === selectedDifficulty)
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(quiz => quiz.category === selectedCategory)
    }

    setFilteredQuizzes(filtered)
  }, [quizzes, selectedDifficulty, selectedCategory])

  useEffect(() => {
    fetchQuizzes()
  }, [])

  useEffect(() => {
    filterQuizzes()
  }, [quizzes, selectedDifficulty, selectedCategory, filterQuizzes])

  const categories = Array.from(new Set(quizzes.map(q => q.category)))
  const difficulties = ['easy', 'medium', 'hard']

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading quizzes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-3 sm:p-4">
      <div className="container mx-auto max-w-4xl space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/farcaster">
              <Button variant="ghost" size="sm" className="h-10 px-3">
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Quiz Catalog</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'es' : ''} available
              </p>
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
              <span className="text-sm font-medium hidden sm:inline">
                {user.displayName}
              </span>
            </div>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
              <div className="space-y-2 min-w-0 flex-1">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Difficulty
                </label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <Button
                    variant={selectedDifficulty === 'all' ? 'default' : 'outline'}
                    size="sm"
                    className="h-9 px-3 text-xs sm:text-sm"
                    onClick={() => setSelectedDifficulty('all')}
                  >
                    All
                  </Button>
                  {difficulties.map(difficulty => (
                    <Button
                      key={difficulty}
                      variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className="capitalize h-9 px-3 text-xs sm:text-sm"
                    >
                      {difficulty}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 min-w-0 flex-1">
                <label className="text-sm font-medium">Category</label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    className="h-9 px-3 text-xs sm:text-sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    All
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      className="h-9 px-3 text-xs sm:text-sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Grid */}
        {filteredQuizzes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No quizzes found</h3>
              <p className="text-muted-foreground mb-4">
                No quizzes match your current filters. Try adjusting your selection.
              </p>
              <Button 
                onClick={() => {
                  setSelectedDifficulty('all')
                  setSelectedCategory('all')
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
            {filteredQuizzes.map((quiz) => (
              <QuizCard 
                key={quiz.id} 
                quiz={quiz}
                basePath="/farcaster/quiz"
              />
            ))}
          </div>
        )}

        {/* Stats Footer */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
              <div>
                <p className="text-lg sm:text-2xl font-bold text-primary">{quizzes.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Quizzes</p>
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-primary">{categories.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Categories</p>
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-primary">3</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Levels</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function QuizzesPage() {
  return (
    <NeynarProvider>
      <QuizzesContent />
    </NeynarProvider>
  )
}


