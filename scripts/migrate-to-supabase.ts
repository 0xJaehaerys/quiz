#!/usr/bin/env tsx
/**
 * Migration script to populate Supabase with quiz data from lib/quizzes.ts
 * 
 * Usage: npx tsx scripts/migrate-to-supabase.ts
 * 
 * This script will:
 * 1. Connect to Supabase
 * 2. Insert categories
 * 3. Insert quizzes with questions
 * 4. Verify data integrity
 */

import { createClient } from '@supabase/supabase-js'
import { mockQuizzes } from '../lib/quizzes'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   SUPABASE_URL:', !!SUPABASE_URL)
  console.error('   SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY):', !!SUPABASE_SERVICE_KEY)
  console.error('')
  console.error('Please set these in your .env.local file')
  process.exit(1)
}

// Create Supabase client with service key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Category mapping from quiz categories to UUIDs
const categoryMap = new Map<string, string>()

interface MigrationStats {
  categories: number
  quizzes: number
  questions: number
  errors: string[]
}

async function migrate(): Promise<MigrationStats> {
  const stats: MigrationStats = {
    categories: 0,
    quizzes: 0,
    questions: 0,
    errors: []
  }

  try {
    console.log('🚀 Starting migration to Supabase...\n')

    // Step 1: Get existing categories or create new ones
    console.log('📂 Processing categories...')
    await processCategories(stats)

    // Step 2: Insert quizzes and questions
    console.log('📝 Processing quizzes...')
    await processQuizzes(stats)

    // Step 3: Verify data integrity
    console.log('✅ Verifying data integrity...')
    await verifyMigration(stats)

    console.log('\n🎉 Migration completed successfully!')
    console.log(`   Categories: ${stats.categories}`)
    console.log(`   Quizzes: ${stats.quizzes}`)
    console.log(`   Questions: ${stats.questions}`)
    
    if (stats.errors.length > 0) {
      console.log(`   Errors: ${stats.errors.length}`)
      stats.errors.forEach(error => console.log(`     ⚠️  ${error}`))
    }

  } catch (error) {
    console.error('💥 Migration failed:', error)
    stats.errors.push(`Fatal error: ${error}`)
  }

  return stats
}

async function processCategories(stats: MigrationStats) {
  // Get unique categories from mock quizzes
  const uniqueCategories = [...new Set(mockQuizzes.map(quiz => quiz.category))]
  
  for (const categoryName of uniqueCategories) {
    try {
      // Check if category already exists
      const { data: existingCategory, error: selectError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('name', categoryName)
        .single()

      if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows found
        throw selectError
      }

      if (existingCategory) {
        // Category exists, use existing ID
        categoryMap.set(categoryName, existingCategory.id)
        console.log(`   ✅ Found existing category: ${categoryName}`)
      } else {
        // Insert new category
        const { data: newCategory, error: insertError } = await supabase
          .from('categories')
          .insert([{
            name: categoryName,
            description: getCategoryDescription(categoryName),
            icon: getCategoryIcon(categoryName),
            color: getCategoryColor(categoryName)
          }])
          .select('id')
          .single()

        if (insertError) throw insertError

        categoryMap.set(categoryName, newCategory.id)
        stats.categories++
        console.log(`   ➕ Created category: ${categoryName}`)
      }
    } catch (error) {
      const errorMsg = `Failed to process category ${categoryName}: ${error}`
      stats.errors.push(errorMsg)
      console.error(`   ❌ ${errorMsg}`)
    }
  }
}

async function processQuizzes(stats: MigrationStats) {
  for (const quiz of mockQuizzes) {
    try {
      // Check if quiz already exists
      const { data: existingQuiz, error: selectError } = await supabase
        .from('quizzes')
        .select('id, title')
        .eq('title', quiz.title)
        .single()

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError
      }

      let quizId: string

      if (existingQuiz) {
        console.log(`   ⚠️  Quiz already exists: ${quiz.title} (skipping)`)
        quizId = existingQuiz.id
      } else {
        // Insert new quiz
        const categoryId = categoryMap.get(quiz.category)
        if (!categoryId) {
          throw new Error(`Category not found: ${quiz.category}`)
        }

        const { data: newQuiz, error: insertError } = await supabase
          .from('quizzes')
          .insert([{
            title: quiz.title,
            description: quiz.description,
            category_id: categoryId,
            difficulty: quiz.difficulty,
            time_limit: quiz.timeLimit,
            total_questions: quiz.questions.length,
            image_url: quiz.imageUrl,
            is_active: true
          }])
          .select('id')
          .single()

        if (insertError) throw insertError

        quizId = newQuiz.id
        stats.quizzes++
        console.log(`   ➕ Created quiz: ${quiz.title}`)
      }

      // Process questions for this quiz
      await processQuestions(quiz, quizId, stats)

    } catch (error) {
      const errorMsg = `Failed to process quiz ${quiz.title}: ${error}`
      stats.errors.push(errorMsg)
      console.error(`   ❌ ${errorMsg}`)
    }
  }
}

async function processQuestions(quiz: any, quizId: string, stats: MigrationStats) {
  // Clear existing questions to avoid duplicates
  const { error: deleteError } = await supabase
    .from('questions')
    .delete()
    .eq('quiz_id', quizId)

  if (deleteError) {
    console.log(`   ⚠️  Could not clear existing questions: ${deleteError.message}`)
  }

  // Insert questions
  for (let i = 0; i < quiz.questions.length; i++) {
    const question = quiz.questions[i]
    
    try {
      const { error: insertError } = await supabase
        .from('questions')
        .insert([{
          quiz_id: quizId,
          text: question.text,
          options: JSON.stringify(question.options),
          correct_answer: question.correctAnswer,
          explanation: question.explanation,
          image_url: question.imageUrl,
          order_index: i
        }])

      if (insertError) throw insertError

      stats.questions++
    } catch (error) {
      const errorMsg = `Failed to insert question ${question.id} for quiz ${quiz.title}: ${error}`
      stats.errors.push(errorMsg)
      console.error(`     ❌ ${errorMsg}`)
    }
  }

  console.log(`     📋 Added ${quiz.questions.length} questions`)
}

async function verifyMigration(stats: MigrationStats) {
  try {
    // Verify categories count
    const { count: categoriesCount, error: catError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })

    if (catError) throw catError
    console.log(`   📂 Categories in DB: ${categoriesCount}`)

    // Verify quizzes count
    const { count: quizzesCount, error: quizError } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact', head: true })

    if (quizError) throw quizError
    console.log(`   📝 Quizzes in DB: ${quizzesCount}`)

    // Verify questions count
    const { count: questionsCount, error: qError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })

    if (qError) throw qError
    console.log(`   ❓ Questions in DB: ${questionsCount}`)

    // Verify quiz-question integrity
    const { data: quizQCounts, error: integrityError } = await supabase
      .from('quizzes')
      .select(`
        id, title, total_questions,
        questions:questions(count)
      `)

    if (integrityError) throw integrityError

    let integrityIssues = 0
    quizQCounts?.forEach(quiz => {
      const actualCount = quiz.questions?.[0]?.count || 0
      if (actualCount !== quiz.total_questions) {
        console.log(`   ⚠️  Quiz "${quiz.title}": expected ${quiz.total_questions}, got ${actualCount} questions`)
        integrityIssues++
      }
    })

    if (integrityIssues === 0) {
      console.log('   ✅ Data integrity verified')
    } else {
      console.log(`   ⚠️  Found ${integrityIssues} integrity issues`)
    }

  } catch (error) {
    const errorMsg = `Verification failed: ${error}`
    stats.errors.push(errorMsg)
    console.error(`   ❌ ${errorMsg}`)
  }
}

// Helper functions for category metadata
function getCategoryDescription(name: string): string {
  const descriptions: Record<string, string> = {
    'Cryptocurrency': 'Bitcoin, Ethereum, and digital currencies',
    'Web3 & DApps': 'Decentralized applications and Web3 concepts', 
    'NFTs': 'Non-fungible tokens and digital collectibles',
    'DeFi': 'Decentralized Finance protocols and concepts',
    'Blockchain': 'Blockchain technology and consensus mechanisms'
  }
  return descriptions[name] || `Knowledge about ${name}`
}

function getCategoryIcon(name: string): string {
  const icons: Record<string, string> = {
    'Cryptocurrency': '₿',
    'Web3 & DApps': '🌐',
    'NFTs': '🎨', 
    'DeFi': '💰',
    'Blockchain': '🔗'
  }
  return icons[name] || '📚'
}

function getCategoryColor(name: string): string {
  const colors: Record<string, string> = {
    'Cryptocurrency': '#f7931a',
    'Web3 & DApps': '#627eea',
    'NFTs': '#ff6b6b',
    'DeFi': '#1aab8e', 
    'Blockchain': '#8b5cf6'
  }
  return colors[name] || '#00d0c7'
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrate()
    .then((stats) => {
      if (stats.errors.length > 0) {
        process.exit(1)
      }
      console.log('\n✅ Ready to rock with real database! 🚀')
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error)
      process.exit(1)
    })
}

export { migrate }
