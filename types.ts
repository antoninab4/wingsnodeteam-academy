
export enum QuizType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE'
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface LessonPart {
  title: string;
  content: string; // Markdown-like text
  image?: string;
}

export interface Level {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  lessons: LessonPart[];
  quiz: QuizQuestion[];
  xpReward: number; // Max XP available for perfect score
  isLocked: boolean;
  isCompleted: boolean;
}

export interface UserState {
  xp: number;
  score: number; // Total score based on correct answers
  level: number; // Current User Level (1-100 based on XP)
  completedLevelIds: number[];
  name: string;
  totalTimeSeconds: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
