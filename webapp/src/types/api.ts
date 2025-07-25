// API Response Types
export interface User {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface LibraryItem {
  id: string;
  title: string;
  source: string;
  dateAdded: string;
  created_at?: string;
  snippet?: string;
  summary?: string;
  flashcards?: FlashCard[];
  mcqs?: MCQ[];
  hasSummary: boolean;
  hasFlashcards: boolean;
  hasQA: boolean;
}

export interface FlashCard {
  question: string;
  answer: string;
}

export interface MCQ {
  question: string;
  options: string[];
  correct_answer: string;
  answer?: string; // For backward compatibility
  explanation?: string;
}

export interface ChatMessage {
  id: number;
  question: string;
  answer: string;
  timestamp: string;
}

export interface ChatUIMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  timestamp?: string;
}

export interface GenerateFromUrlRequest {
  url: string;
}

export interface GenerateFromUrlResponse {
  id: number;
  title: string;
  source: string;
  created_at: string;
  has_summary: boolean;
  has_flashcards: boolean;
  has_mcqs: boolean;
}

export interface AskQuestionRequest {
  question: string;
  library_item_id: number;
}

export interface AskQuestionResponse {
  answer: string;
}

export interface ApiError {
  detail: string;
}

// API client configuration
export interface ApiConfig {
  baseUrl: string;
  version: string;
  timeout?: number;
}