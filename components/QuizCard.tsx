"use client"

import Link from "next/link"
// import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Quiz } from "@/types"
import { getDifficultyColor, formatTime } from "@/lib/utils"
import { Clock, Users, Star, Play } from "lucide-react"

interface QuizCardProps {
  quiz: Quiz
  basePath?: string
}

export function QuizCard({ quiz, basePath = "/farcaster/quiz" }: QuizCardProps) {
  return (
    <div className="group animate-fade-in-up">
      <Card className="gelora-card-hover border-border bg-card">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <CardTitle className="text-foreground group-hover:text-accent transition-colors text-balance">
                {quiz.title}
              </CardTitle>
              <CardDescription className="line-clamp-2 leading-relaxed">
                {quiz.description}
              </CardDescription>
            </div>
            <Badge 
              variant={quiz.difficulty === 'easy' ? 'success' : 
                      quiz.difficulty === 'medium' ? 'default' : 'destructive'}
              className="shrink-0"
            >
              {quiz.difficulty}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-6 text-sm text-muted">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" strokeWidth={1.5} />
                <span>{quiz.totalQuestions} questions</span>
              </div>
              {quiz.timeLimit && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" strokeWidth={1.5} />
                  <span>{formatTime(quiz.timeLimit)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" strokeWidth={1.5} />
                <span className="truncate">{quiz.category}</span>
              </div>
            </div>
            
            <Link href={`${basePath}/${quiz.id}`}>
              <Button 
                variant="accent"
                size="lg"
                className="w-full font-medium"
              >
                <Play className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Start Quiz
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
