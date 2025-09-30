import { NextResponse } from 'next/server'
import { getQuizById, getLeaderboard } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = params.id
    
    console.log(`📋 Fetching quiz ${quizId} from database...`)
    
    // Get quiz data from Supabase (with fallback to mock)
    const quiz = await getQuizById(quizId)
    
    if (!quiz) {
      console.log(`❌ Quiz ${quizId} not found`)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Quiz not found' 
        },
        { status: 404 }
      )
    }

    // Get leaderboard data
    console.log(`📊 Fetching leaderboard for quiz ${quizId}...`)
    const leaderboard = await getLeaderboard(quizId)
    
    console.log(`✅ Successfully fetched quiz "${quiz.title}" with ${leaderboard.length} leaderboard entries`)
    
    return NextResponse.json({
      success: true,
      quiz,
      leaderboard,
      meta: {
        questions_count: quiz.questions.length,
        leaderboard_count: leaderboard.length
      }
    })
  } catch (error) {
    console.error(`❌ Error fetching quiz ${params.id}:`, error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch quiz',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}



