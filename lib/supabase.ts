import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Quiz, Question, QuizResult, LeaderboardEntry } from '@/types'

let supabase: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured. Using mock data.')
    return null
  }

  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseKey)
  }

  return supabase
}

// Client for server-side operations with service key
export function getSupabaseServerClient(): SupabaseClient | null {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase server client not configured.')
    return getSupabaseClient() // fallback to anon client
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}


// ================================================
// QUIZ DATA FUNCTIONS
// ================================================

export async function getAllQuizzes(): Promise<Quiz[]> {
  const client = getSupabaseClient()
  if (!client) {
    const { getQuizzes } = await import('./quizzes')
    return getQuizzes()
  }

  try {
    const { data, error } = await client
      .from('quizzes')
      .select(`
        id,
        title,
        description,
        difficulty,
        time_limit,
        total_questions,
        image_url,
        is_active,
        categories (name),
        questions (
          id,
          text,
          options,
          correct_answer,
          explanation,
          image_url,
          order_index
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(transformQuizFromDB)
  } catch (error) {
    console.error('Error fetching quizzes from Supabase:', error)
    // Fallback to mock data
    const { getQuizzes } = await import('./quizzes')
    return getQuizzes()
  }
}

export async function getQuizById(id: string): Promise<Quiz | null> {
  const client = getSupabaseClient()
  if (!client) {
    const { getQuizById: getMockQuiz } = await import('./quizzes')
    return getMockQuiz(id)
  }

  try {
    const { data, error } = await client
      .from('quizzes')
      .select(`
        id,
        title,
        description,
        difficulty,
        time_limit,
        total_questions,
        image_url,
        is_active,
        categories (name),
        questions (
          id,
          text,
          options,
          correct_answer,
          explanation,
          image_url,
          order_index
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) throw error

    return transformQuizFromDB(data)
  } catch (error) {
    console.error(`Error fetching quiz ${id} from Supabase:`, error)
    // Fallback to mock data
    const { getQuizById: getMockQuiz } = await import('./quizzes')
    return getMockQuiz(id)
  }
}

// Transform database quiz data to our Quiz interface
function transformQuizFromDB(dbQuiz: any): Quiz {
  return {
    id: dbQuiz.id,
    title: dbQuiz.title,
    description: dbQuiz.description,
    category: dbQuiz.categories?.name || 'Unknown',
    difficulty: dbQuiz.difficulty,
    timeLimit: dbQuiz.time_limit,
    totalQuestions: dbQuiz.total_questions,
    imageUrl: dbQuiz.image_url,
    questions: (dbQuiz.questions || [])
      .sort((a: any, b: any) => a.order_index - b.order_index)
      .map((dbQuestion: any): Question => ({
        id: dbQuestion.id,
        text: dbQuestion.text,
        options: JSON.parse(dbQuestion.options),
        correctAnswer: dbQuestion.correct_answer,
        explanation: dbQuestion.explanation,
        imageUrl: dbQuestion.image_url
      }))
  }
}

// ================================================
// QUIZ SESSION & RESULTS FUNCTIONS
// ================================================

export async function saveQuizSession(
  quizId: string,
  fid: number,
  username: string,
  displayName: string,
  profileImage: string | undefined,
  score: number,
  correctAnswers: number,
  totalQuestions: number,
  timeSpent: number,
  answers: Array<{
    questionId: string
    selectedOption: number
    isCorrect: boolean
    timeSpent: number
  }>
): Promise<string | null> {
  const client = getSupabaseServerClient()
  if (!client) {
    console.warn('No Supabase client available for saving quiz session')
    return null
  }

  try {
    // Insert quiz session
    const { data: session, error: sessionError } = await client
      .from('quiz_sessions')
      .insert([{
        quiz_id: quizId,
        fid,
        username,
        display_name: displayName,
        profile_image: profileImage,
        score,
        correct_answers: correctAnswers,
        total_questions: totalQuestions,
        time_spent: timeSpent,
        completed_at: new Date().toISOString(),
        is_completed: true
      }])
      .select('id')
      .single()

    if (sessionError) throw sessionError

    const sessionId = session.id

    // Insert individual answers for analytics
    if (answers.length > 0) {
      const answerRows = answers.map(answer => ({
        session_id: sessionId,
        question_id: answer.questionId,
        selected_option: answer.selectedOption,
        is_correct: answer.isCorrect,
        time_spent: answer.timeSpent
      }))

      const { error: answersError } = await client
        .from('user_answers')
        .insert(answerRows)

      if (answersError) {
        console.warn('Failed to save individual answers:', answersError)
        // Don't fail the entire operation if answers fail
      }
    }

    return sessionId
  } catch (error) {
    console.error('Error saving quiz session:', error)
    return null
  }
}

export async function getLeaderboard(quizId: string): Promise<LeaderboardEntry[]> {
  const client = getSupabaseClient()
  if (!client) {
    const { getMockLeaderboard } = await import('./quizzes')
    return getMockLeaderboard(quizId)
  }

  try {
    const { data, error } = await client
      .from('quiz_sessions')
      .select(`
        fid,
        username,
        display_name,
        profile_image,
        score,
        time_spent,
        completed_at
      `)
      .eq('quiz_id', quizId)
      .eq('is_completed', true)
      .order('score', { ascending: false })
      .order('time_spent', { ascending: true })
      .order('completed_at', { ascending: false })
      .limit(10)

    if (error) throw error

    return data.map((entry: any, index: number): LeaderboardEntry => ({
      userId: entry.fid.toString(),
      username: entry.username || `user_${entry.fid}`,
      displayName: entry.display_name || entry.username || `User ${entry.fid}`,
      profileImage: entry.profile_image,
      score: entry.score,
      timeSpent: entry.time_spent,
      completedAt: new Date(entry.completed_at),
      rank: index + 1
    }))
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    // Fallback to mock data
    const { getMockLeaderboard } = await import('./quizzes')
    return getMockLeaderboard(quizId)
  }
}

// Legacy function for backward compatibility
export async function saveQuizResult(result: QuizResult): Promise<boolean> {
  console.warn('saveQuizResult is deprecated, use saveQuizSession instead')
  return true
}