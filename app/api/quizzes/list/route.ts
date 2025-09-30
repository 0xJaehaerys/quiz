import { NextResponse } from 'next/server'
import { getAllQuizzes } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('📋 Fetching quizzes from database...')
    const quizzes = await getAllQuizzes()
    
    console.log(`✅ Successfully fetched ${quizzes.length} quizzes`)
    
    return NextResponse.json({
      success: true,
      quizzes,
      count: quizzes.length
    })
  } catch (error) {
    console.error('❌ Error fetching quizzes:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch quizzes',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}



