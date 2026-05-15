export type ChatRole = "user" | "assistant" | "system";
export type ChatContentType = "movie" | "tv";

export interface ChatSession {
  id: number;
  userId: number;
  title: string | null;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: number;
  sessionId: number;
  userId: number;
  role: ChatRole;
  content: string;
  metadata?: {
    recommendations?: ChatRecommendation[];
    followUpQuestions?: string[];
    source?: string;
  } | null;
  createdAt: string;
}

export interface ChatRecommendation {
  tmdbId: number;
  type: ChatContentType;
  title: string;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  popularity: number;
  genreIds: number[];
  href: string;
}

export interface SendChatResponse {
  userMessage: ChatMessage;
  message: ChatMessage;
  reply: string;
  recommendations: ChatRecommendation[];
  followUpQuestions: string[];
  flagged: boolean;
}
