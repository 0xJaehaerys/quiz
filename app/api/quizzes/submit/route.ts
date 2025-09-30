import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getQuizById, saveQuizSession, getLeaderboard } from '@/lib/supabase'

const submitSchema = z.object({
  quizId: z.string(),
  answers: z.array(z.object({
    questionId: z.string(),
    selectedOption: z.number(),
    timeSpent: z.number().optional().default(0) // time spent on individual question
  })),
  timeSpent: z.number(), // total time spent
  user: z.object({
    fid: z.number(),
    username: z.string().optional(),
    displayName: z.string().optional(), 
    profileImage: z.string().optional()
  })
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📝 Received quiz submission:', {
      quizId: body.quizId,
      userFid: body.user?.fid,
      answersCount: body.answers?.length
    })
    
    const { quizId, answers, timeSpent, user } = submitSchema.parse(body)
    
    // Get quiz data from Supabase
    console.log(`📋 Fetching quiz ${quizId} for result calculation...`)
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

    // Calculate result
    console.log('🧮 Calculating quiz results...')
    const correctAnswers = answers.filter((answer, index) => {
      const question = quiz.questions[index]
      return question && answer.selectedOption === question.correctAnswer
    })

    const score = Math.round((correctAnswers.length / quiz.questions.length) * 100)
    
    // Prepare answer details for analytics
    const answerDetails = answers.map((answer, index) => {
      const question = quiz.questions[index]
      const isCorrect = question && answer.selectedOption === question.correctAnswer
      
      return {
        questionId: question?.id || answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect: !!isCorrect,
        timeSpent: answer.timeSpent || Math.round(timeSpent / answers.length)
      }
    })

    // Save quiz session to Supabase
    console.log('💾 Saving quiz session to database...')
    const sessionId = await saveQuizSession(
      quizId,
      user.fid,
      user.username || `user_${user.fid}`,
      user.displayName || user.username || `User ${user.fid}`,
      user.profileImage,
      score,
      correctAnswers.length,
      quiz.questions.length,
      timeSpent,
      answerDetails
    )

    if (!sessionId) {
      console.warn('⚠️ Failed to save quiz session, but continuing...')
    } else {
      console.log(`✅ Quiz session saved with ID: ${sessionId}`)
    }

    // Get updated leaderboard to calculate rank
    console.log('📊 Fetching updated leaderboard...')
    const leaderboard = await getLeaderboard(quizId)
    
    // Calculate user's rank
    const userRank = leaderboard.findIndex(entry => 
      entry.userId === user.fid.toString()
    ) + 1 || leaderboard.length + 1

    const result = {
      sessionId,
      quizId,
      score,
      correctAnswers: correctAnswers.length,
      totalQuestions: quiz.questions.length,
      timeSpent,
      answers: answerDetails,
      rank: userRank,
      totalParticipants: leaderboard.length,
      percentile: leaderboard.length > 0 
        ? Math.round(((leaderboard.length - userRank + 1) / leaderboard.length) * 100)
        : 100
    }

    console.log(`✅ Quiz submission complete - Score: ${score}%, Rank: ${userRank}/${leaderboard.length}`)

    return NextResponse.json({
      success: true,
      result,
      leaderboard: leaderboard.slice(0, 5) // Top 5 for immediate display
    })
    
  } catch (error) {
    console.error('❌ Error submitting quiz:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: process.env.NODE_ENV === 'development' ? error.errors : undefined
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to submit quiz',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}



