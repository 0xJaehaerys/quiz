import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { QuizResult, LeaderboardEntry } from '@/types'

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

export async function saveQuizResult(result: QuizResult): Promise<boolean> {
  const client = getSupabaseClient()
  if (!client) return true // Mock success

  try {
    const { error } = await client
      .from('quiz_results')
      .insert([result])

    return !error
  } catch (error) {
    console.error('Failed to save quiz result:', error)
    return false
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
      .from('quiz_results')
      .select('*')
      .eq('quiz_id', quizId)
      .order('score', { ascending: false })
      .limit(10)

    if (error) return []
    return data.map((entry: any, index: number) => ({
      ...entry,
      rank: index + 1
    }))
  } catch (error) {
    return []
  }
}