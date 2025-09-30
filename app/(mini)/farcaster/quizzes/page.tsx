"use client"

import { useEffect, useState } from 'react'
import { QuizCard } from '@/components/QuizCard'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { NeynarProvider, useFarcasterUser } from '@/components/providers/NeynarProvider'
import { Quiz } from '@/types'
import { ArrowLeft, Filter, Search, Loader2 } from "lucide-react"
import Link from 'next/link'

function QuizzesContent() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { user } = useFarcasterUser()

  useEffect(() => {
    fetchQuizzes()
  }, [])

  useEffect(() => {
    filterQuizzes()
  }, [quizzes, selectedDifficulty, selectedCategory])

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

  const filterQuizzes = () => {
    let filtered = quizzes

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(quiz => quiz.difficulty === selectedDifficulty)
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(quiz => quiz.category === selectedCategory)
    }

    setFilteredQuizzes(filtered)
  }

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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/farcaster">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Quiz Catalog</h1>
              <p className="text-muted-foreground">
                {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'es' : ''} available
              </p>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center gap-2">
              <img 
                src={user.pfpUrl || '/default-avatar.png'} 
                alt={user.displayName}
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
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Difficulty
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedDifficulty === 'all' ? 'default' : 'outline'}
                    size="sm"
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
                      className="capitalize"
                    >
                      {difficulty}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    All
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
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
          <div className="grid gap-6 md:grid-cols-2">
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
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{quizzes.length}</p>
                <p className="text-sm text-muted-foreground">Total Quizzes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{categories.length}</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">3</p>
                <p className="text-sm text-muted-foreground">Difficulty Levels</p>
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


