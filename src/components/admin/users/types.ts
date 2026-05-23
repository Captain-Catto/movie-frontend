export type UserRole = "user" | "admin" | "super_admin" | "viewer";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  provider?: string;
  bannedReason?: string;
  totalWatchTime?: number;
  lastLoginAt?: string;
  lastLoginIp?: string;
  lastLoginDevice?: string;
  lastLoginCountry?: string | null;
}

export interface UserLog {
  id: number;
  userId: number;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export type WatchActionType = "all" | "view" | "play" | "complete";
export type WatchContentType = "all" | "movie" | "tv_series";
export type UserFilter = "all" | "active" | "banned";
export type AdminUsersTab = "info" | "watch" | "logs";

export type BanModalState = {
  open: boolean;
  user: User | null;
};

export type EditModalState = {
  open: boolean;
  user: User | null;
};

export type EditFormState = {
  name: string;
  role: UserRole;
  password: string;
};

export interface WatchHistoryItem {
  id: number;
  contentId: string;
  tmdbId: number | null;
  contentType: "movie" | "tv_series";
  actionType: "view" | "play" | "complete";
  contentTitle: string;
  duration: number;
  deviceType?: string | null;
  country?: string | null;
  createdAt: string;
  posterUrl?: string | null;
  href?: string | null;
}

export interface WatchHistorySummary {
  totalViews: number;
  totalPlays: number;
  totalCompletes: number;
  totalWatchTimeSeconds: number;
  lastWatchedAt: string | null;
}

export interface WatchHistoryResponse {
  data: WatchHistoryItem[];
  summary: WatchHistorySummary;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
