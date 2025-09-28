export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: Question[];
  timeLimit?: number; // in seconds
  totalQuestions: number;
  imageUrl?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
  imageUrl?: string;
}

export interface Answer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

export interface QuizResult {
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  answers: Answer[];
  completedAt: Date;
  rank?: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName: string;
  profileImage?: string;
  score: number;
  timeSpent: number;
  completedAt: Date;
  rank: number;
}

export interface FarcasterProfile {
  fid: number;
  username: string;
  displayName: string;
  bio?: string;
  pfpUrl?: string;
  followerCount?: number;
  followingCount?: number;
  verifications?: string[];
}

export interface AppState {
  user: FarcasterProfile | null;
  currentQuiz: Quiz | null;
  isLoading: boolean;
  error: string | null;
}

export interface QuizSession {
  quizId: string;
  currentQuestionIndex: number;
  answers: Answer[];
  startTime: Date;
  timeRemaining?: number;
}