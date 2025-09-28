import { Quiz, Question, QuizResult, LeaderboardEntry } from '@/types'

// Mock quiz data for development
export const mockQuizzes: Quiz[] = [
  {
    id: 'crypto-basics',
    title: 'Crypto Basics',
    description: 'Test your knowledge of cryptocurrency fundamentals',
    category: 'Cryptocurrency',
    difficulty: 'easy',
    totalQuestions: 5,
    timeLimit: 300, // 5 minutes
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1640835445/crypto_basics.jpg',
    questions: [
      {
        id: 'q1',
        text: 'What does "HODL" mean in crypto?',
        options: [
          'Hold On for Dear Life',
          'High Output Digital Ledger',
          'Hybrid Online Data Link',
          'Hash Output Decentralized Logic'
        ],
        correctAnswer: 0,
        explanation: 'HODL originated from a typo of "hold" and became a popular strategy.'
      },
      {
        id: 'q2',
        text: 'What is the maximum supply of Bitcoin?',
        options: ['21 million', '100 million', '1 billion', 'Unlimited'],
        correctAnswer: 0,
        explanation: 'Bitcoin has a hard cap of 21 million coins.'
      },
      {
        id: 'q3',
        text: 'What is a blockchain?',
        options: [
          'A type of cryptocurrency',
          'A distributed ledger technology',
          'A mining algorithm',
          'A wallet application'
        ],
        correctAnswer: 1,
        explanation: 'Blockchain is a distributed ledger that records transactions across multiple computers.'
      },
      {
        id: 'q4',
        text: 'What does "DeFi" stand for?',
        options: [
          'Digital Finance',
          'Decentralized Finance',
          'Distributed Finance',
          'Dynamic Finance'
        ],
        correctAnswer: 1,
        explanation: 'DeFi stands for Decentralized Finance.'
      },
      {
        id: 'q5',
        text: 'What is a smart contract?',
        options: [
          'A legal document',
          'A trading strategy',
          'Self-executing code on blockchain',
          'A type of cryptocurrency'
        ],
        correctAnswer: 2,
        explanation: 'Smart contracts are self-executing contracts with terms directly written into code.'
      }
    ]
  },
  {
    id: 'web3-advanced',
    title: 'Web3 & DApps',
    description: 'Advanced concepts in Web3 and decentralized applications',
    category: 'Web3',
    difficulty: 'hard',
    totalQuestions: 4,
    timeLimit: 600, // 10 minutes
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1640835445/web3_advanced.jpg',
    questions: [
      {
        id: 'q1',
        text: 'What is the difference between Layer 1 and Layer 2?',
        options: [
          'Layer 1 is faster',
          'Layer 2 is built on top of Layer 1',
          'They are the same thing',
          'Layer 1 is for NFTs only'
        ],
        correctAnswer: 1,
        explanation: 'Layer 2 solutions are built on top of Layer 1 blockchains to improve scalability.'
      },
      {
        id: 'q2',
        text: 'What is gas in Ethereum?',
        options: [
          'A type of token',
          'Transaction fees',
          'Mining reward',
          'Staking mechanism'
        ],
        correctAnswer: 1,
        explanation: 'Gas refers to the fee required to execute transactions on the Ethereum network.'
      },
      {
        id: 'q3',
        text: 'What does "TVL" measure in DeFi?',
        options: [
          'Total Value Locked',
          'Transaction Volume Limit',
          'Token Velocity Level',
          'Technical Validation Logic'
        ],
        correctAnswer: 0,
        explanation: 'TVL measures the total value of assets locked in a DeFi protocol.'
      },
      {
        id: 'q4',
        text: 'What is an oracle in blockchain?',
        options: [
          'A prediction market',
          'Data feed from external sources',
          'A type of consensus mechanism',
          'A smart contract template'
        ],
        correctAnswer: 1,
        explanation: 'Oracles provide external data to blockchain networks and smart contracts.'
      }
    ]
  },
  {
    id: 'nft-knowledge',
    title: 'NFT Fundamentals',
    description: 'Understanding Non-Fungible Tokens and digital ownership',
    category: 'NFTs',
    difficulty: 'medium',
    totalQuestions: 4,
    timeLimit: 240, // 4 minutes
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1640835445/nft_fundamentals.jpg',
    questions: [
      {
        id: 'q1',
        text: 'What makes an NFT "non-fungible"?',
        options: [
          'It cannot be copied',
          'It is unique and cannot be replaced',
          'It is expensive',
          'It is stored on blockchain'
        ],
        correctAnswer: 1,
        explanation: 'Non-fungible means each token is unique and cannot be replaced by another identical token.'
      },
      {
        id: 'q2',
        text: 'What is the most common NFT standard on Ethereum?',
        options: ['ERC-20', 'ERC-721', 'ERC-1155', 'ERC-777'],
        correctAnswer: 1,
        explanation: 'ERC-721 is the most widely used standard for NFTs on Ethereum.'
      },
      {
        id: 'q3',
        text: 'What is "minting" an NFT?',
        options: [
          'Buying an NFT',
          'Creating a new NFT on the blockchain',
          'Selling an NFT',
          'Transferring an NFT'
        ],
        correctAnswer: 1,
        explanation: 'Minting is the process of creating a new NFT and recording it on the blockchain.'
      },
      {
        id: 'q4',
        text: 'What is a "rug pull" in NFT projects?',
        options: [
          'A successful launch',
          'When creators abandon the project after raising funds',
          'A type of NFT artwork',
          'A marketing strategy'
        ],
        correctAnswer: 1,
        explanation: 'A rug pull occurs when project creators disappear with investors\' money.'
      }
    ]
  }
]

export function getQuizzes(): Quiz[] {
  return mockQuizzes
}

export function getQuizById(id: string): Quiz | null {
  return mockQuizzes.find(quiz => quiz.id === id) || null
}

export function calculateQuizResult(
  quiz: Quiz,
  userAnswers: { questionId: string; selectedOption: number }[],
  timeSpent: number
): QuizResult {
  const answers = quiz.questions.map(question => {
    const userAnswer = userAnswers.find(a => a.questionId === question.id)
    const selectedOption = userAnswer?.selectedOption ?? -1
    const isCorrect = selectedOption === question.correctAnswer
    
    return {
      questionId: question.id,
      selectedOption,
      isCorrect,
      timeSpent: timeSpent / quiz.questions.length // Average time per question
    }
  })

  const correctAnswers = answers.filter(a => a.isCorrect).length
  const score = Math.round((correctAnswers / quiz.totalQuestions) * 100)

  return {
    quizId: quiz.id,
    userId: 'mock-user', // This would come from auth
    score,
    totalQuestions: quiz.totalQuestions,
    correctAnswers,
    timeSpent,
    answers,
    completedAt: new Date()
  }
}

// This function is now in lib/utils.ts to avoid circular imports

// Mock leaderboard data
export function getMockLeaderboard(quizId: string): LeaderboardEntry[] {
  return [
    {
      userId: 'user1',
      username: 'cryptomaster',
      displayName: 'Crypto Master',
      profileImage: 'https://res.cloudinary.com/demo/image/upload/v1640835445/avatar1.jpg',
      score: 100,
      timeSpent: 180,
      completedAt: new Date('2024-01-15T10:30:00Z'),
      rank: 1
    },
    {
      userId: 'user2',
      username: 'web3guru',
      displayName: 'Web3 Guru',
      profileImage: 'https://res.cloudinary.com/demo/image/upload/v1640835445/avatar2.jpg',
      score: 95,
      timeSpent: 220,
      completedAt: new Date('2024-01-15T11:15:00Z'),
      rank: 2
    },
    {
      userId: 'user3',
      username: 'defiexpert',
      displayName: 'DeFi Expert',
      profileImage: 'https://res.cloudinary.com/demo/image/upload/v1640835445/avatar3.jpg',
      score: 90,
      timeSpent: 195,
      completedAt: new Date('2024-01-15T09:45:00Z'),
      rank: 3
    }
  ]
}
