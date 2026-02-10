
export enum Priority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export interface Task {
  id: string;
  subjectId: string;
  subjectName: string;
  color: string;
  title: string;
  description: string;
  priority: Priority;
  estimatedMinutes: number;
  isCompleted: boolean;
  weekNumber: number;
  assignedDate: string; // ISO string for the specific day
  assignedTime?: string; // HH:mm
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface WeekPlan {
  weekNumber: number;
  theme: string;
  tasks: Task[];
}

export interface UserPreferences {
  studyDays: string[];
  hoursPerDay: number;
  durationWeeks: number;
  startDate: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  syllabusContent: string;
  notesContent?: string;
  plan: WeekPlan[];
  preferences: UserPreferences;
  createdAt: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface SyllabusData {
  content: string;
  fileName: string;
}

export const SUPPORTED_DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

export const SUBJECT_COLORS = [
  { name: 'Blue', bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
  { name: 'Indigo', bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-200', light: 'bg-indigo-50' },
  { name: 'Rose', bg: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-200', light: 'bg-rose-50' },
  { name: 'Amber', bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50' },
  { name: 'Emerald', bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50' },
  { name: 'Violet', bg: 'bg-violet-600', text: 'text-violet-600', border: 'border-violet-200', light: 'bg-violet-50' },
];

export const MOTIVATION_QUOTES = [
  "Focus on progress, not perfection.",
  "Your future self will thank you for today's effort.",
  "Discipline is choosing between what you want now and what you want most.",
  "Success is the sum of small efforts repeated daily.",
  "The secret to getting ahead is getting started."
];
