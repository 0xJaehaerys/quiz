import { NextResponse } from 'next/server'
import { getQuizzes } from '@/lib/quizzes'

export async function GET() {
  try {
    const quizzes = getQuizzes()
    
    return NextResponse.json({
      success: true,
      quizzes
    })
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch quizzes' 
      },
      { status: 500 }
    )
  }
}
