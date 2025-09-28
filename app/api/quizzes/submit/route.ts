import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getQuizById, calculateQuizResult } from '@/lib/quizzes'
import { saveQuizResult } from '@/lib/supabase'

const submitSchema = z.object({
  quizId: z.string(),
  answers: z.array(z.object({
    questionId: z.string(),
    selectedOption: z.number()
  })),
  timeSpent: z.number()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { quizId, answers, timeSpent } = submitSchema.parse(body)
    
    // Get quiz
    const quiz = getQuizById(quizId)
    if (!quiz) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Quiz not found' 
        },
        { status: 404 }
      )
    }

    // Calculate result
    const result = calculateQuizResult(quiz, answers, timeSpent)
    
    // Save result (to Supabase if configured, otherwise just return)
    const saved = await saveQuizResult(result)
    
    if (!saved) {
      console.warn('Failed to save quiz result')
    }

    // Calculate rank (mock implementation)
    const rank = Math.floor(Math.random() * 50) + 1 // Random rank for now

    return NextResponse.json({
      success: true,
      result: {
        ...result,
        rank
      }
    })
  } catch (error) {
    console.error('Error submitting quiz:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to submit quiz' 
      },
      { status: 500 }
    )
  }
}
