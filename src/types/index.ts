export interface Level {
  id: string;
  name: string;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Topic {
  id: string;
  levelId: string;
  name: string;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vocabulary {
  id: string;
  topicId: string;
  word: string;
  reading: string;
  meaning: string;
  example: string;
  exampleMeaning: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AudioTest {
  id: string;
  levelId: string;
  name: string;
  audioUrl: string;
  passCondition: number;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  testId: string;
  content: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  order: number;
}

export interface Learner {
  id: string;
  email: string;
  username: string;
  fullName: string;
  status: 'active' | 'locked' | 'deleted';
  createdAt: Date;
  lastLogin: Date;
}

export interface LearnerProfile {
  id: string;
  learnerId: string;
  status: 'Learning' | 'Pass' | 'Not Pass';
  completedLevels: number;
  completedTopics: number;
  totalScore: number;
}

export interface TestResult {
  id: string;
  learnerId: string;
  testId: string;
  mode: 'Practice' | 'Exam';
  score: number;
  passed: boolean;
  completedAt: Date;
  answers: LearnerAnswer[];
}

export interface LearnerAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}
