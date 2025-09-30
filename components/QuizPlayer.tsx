"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Quiz, Question, QuizResult, Answer } from "@/types"
import { formatTime, calculateScore, getDifficultyColor } from "@/lib/utils"
import { Clock, CheckCircle, XCircle, RotateCcw, Share2, ArrowRight, Timer } from "lucide-react"
import { useToast } from "@/hooks/useToast"
import { QuizCompletionNFT } from '@/components/QuizCompletionNFT'

interface QuizPlayerProps {
  quiz: Quiz
  onComplete?: (result: QuizResult) => void
  onShare?: (result: QuizResult, quiz: Quiz) => void
}

export function QuizPlayer({ quiz, onComplete, onShare }: QuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit || 0)
  const [startTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  const completeQuiz = useCallback(async (finalAnswers = answers) => {
    setIsLoading(true)
    const totalTime = (new Date().getTime() - startTime.getTime()) / 1000

    try {
      // Calculate result
      const correctCount = finalAnswers.filter(a => a.isCorrect).length
      const score = calculateScore(correctCount, quiz.questions.length)

      const quizResult: QuizResult = {
        quizId: quiz.id,
        userId: "current-user", // This would come from auth
        score,
        totalQuestions: quiz.questions.length,
        correctAnswers: correctCount,
        timeSpent: totalTime,
        answers: finalAnswers,
        completedAt: new Date()
      }

      // Save result via API
      const response = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quiz.id,
          answers: finalAnswers.map(a => ({
            questionId: a.questionId,
            selectedOption: a.selectedOption
          })),
          timeSpent: totalTime
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data.result)
        setShowResult(true)
        
        toast({
          title: "Quiz completed!",
          description: `You scored ${score}% (${correctCount}/${quiz.questions.length})`,
        })

        onComplete?.(data.result)
      } else {
        throw new Error('Failed to submit quiz')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save quiz result",
        variant: "destructive"
      })
      console.error('Quiz submission error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [answers, quiz.id, quiz.questions.length, startTime, toast, onComplete])

  const handleTimeUp = useCallback(() => {
    toast({
      title: "Time's up!",
      description: "Quiz completed due to time limit",
      variant: "destructive"
    })
    completeQuiz()
  }, [completeQuiz, toast])

  // Timer effect
  useEffect(() => {
    if (!quiz.timeLimit || showResult) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quiz.timeLimit, showResult, handleTimeUp])

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex)
  }

  const handleNextQuestion = async () => {
    if (selectedOption === null) return

    const timeSpent = (new Date().getTime() - startTime.getTime()) / 1000
    const isCorrect = selectedOption === currentQuestion.correctAnswer

    const answer: Answer = {
      questionId: currentQuestion.id,
      selectedOption,
      isCorrect,
      timeSpent: timeSpent / (currentQuestionIndex + 1)
    }

    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)

    if (isLastQuestion) {
      completeQuiz(newAnswers)
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedOption(null)
    }
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setAnswers([])
    setSelectedOption(null)
    setShowResult(false)
    setResult(null)
    setTimeRemaining(quiz.timeLimit || 0)
  }

  const handleShare = () => {
    if (result) {
      onShare?.(result, quiz)
    }
  }

  // Results view with NFT minting
  if (showResult && result) {
    return (
      <div className="space-y-8 animate-fade-in">
        <QuizCompletionNFT 
          quiz={quiz} 
          result={result}
          onClose={() => {
            setShowResult(false)
            setResult(null)
            setCurrentQuestionIndex(0)
            setAnswers([])
            setSelectedOption(null)
            setTimeRemaining(quiz.timeLimit || 0)
          }}
        />

        {/* Review section - kept for educational value */}
        <div className="space-y-6">
          <h3 className="gelora-typography-h1 text-foreground">Review Your Answers</h3>
          <div className="space-y-4">
            {quiz.questions.map((question, index) => {
              const answer = result.answers[index]
              return (
                <div
                  key={question.id}
                  className="animate-fade-in-up"
                >
                  <Card className={`border-l-4 ${answer.isCorrect ? 'border-l-accent bg-accent/5' : 'border-l-destructive bg-destructive/5'}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        {answer.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-accent shrink-0" strokeWidth={1.5} />
                        ) : (
                          <XCircle className="w-5 h-5 text-destructive shrink-0" strokeWidth={1.5} />
                        )}
                        <CardTitle className="text-base font-medium text-foreground">Question {index + 1}</CardTitle>
                      </div>
                      <CardDescription className="leading-relaxed">{question.text}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-panel border border-border">
                          <p className="text-sm">
                            <span className="font-medium text-muted">Your answer:</span>{" "}
                            <span className="text-foreground">{question.options[answer.selectedOption]}</span>
                          </p>
                        </div>
                        {!answer.isCorrect && (
                          <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                            <p className="text-sm">
                              <span className="font-medium text-muted">Correct answer:</span>{" "}
                              <span className="text-accent font-medium">{question.options[question.correctAnswer]}</span>
                            </p>
                          </div>
                        )}
                        {question.explanation && (
                          <div className="p-3 rounded-xl bg-muted/10 border border-border">
                            <p className="text-sm text-muted italic leading-relaxed">
                              {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Quiz playing view
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge 
            variant={quiz.difficulty === 'easy' ? 'success' : 
                    quiz.difficulty === 'medium' ? 'default' : 'destructive'}
          >
            {quiz.difficulty}
          </Badge>
          <span className="text-sm text-muted font-mono">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
        </div>
        {quiz.timeLimit && timeRemaining > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Timer className="w-4 h-4" strokeWidth={1.5} />
            <span className={`font-mono ${
              timeRemaining <= 60 ? "text-destructive" : "text-muted"
            }`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-2 bg-panel" />
        <div className="text-xs text-muted text-center">
          {Math.round(progress)}% complete
        </div>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="gelora-typography-h1 text-foreground leading-tight">
            {currentQuestion.text}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`quiz-option w-full text-left hover:scale-[1.01] transition-transform ${
                  selectedOption === index ? 'selected' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedOption === index
                      ? 'border-accent bg-accent text-accent-foreground'
                      : 'border-border bg-panel'
                  }`}>
                    <span className="text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                  </div>
                  <span className="text-foreground leading-relaxed">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted">
          {selectedOption === null ? "Select an answer to continue" : "Ready to proceed"}
        </div>
        <Button 
          onClick={handleNextQuestion}
          disabled={selectedOption === null || isLoading}
          variant="accent"
          size="lg"
          className="min-w-[140px]"
        >
          {isLoading ? (
            <span>Submitting...</span>
          ) : (
            <>
              {isLastQuestion ? "Complete Quiz" : "Next Question"}
              {!isLastQuestion && <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}