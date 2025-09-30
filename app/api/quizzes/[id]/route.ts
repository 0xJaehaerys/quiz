import { NextResponse } from 'next/server'
import { getQuizById, getMockLeaderboard } from '@/lib/quizzes'
import { getLeaderboard } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = params.id
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

    // Get leaderboard (either from Supabase or mock data)
    const leaderboard = await getLeaderboard(quizId)
    
    return NextResponse.json({
      success: true,
      quiz,
      leaderboard
    })
  } catch (error) {
    console.error('Error fetching quiz:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch quiz' 
      },
      { status: 500 }
    )
  }
}



