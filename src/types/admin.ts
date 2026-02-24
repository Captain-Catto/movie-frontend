// Admin Panel Types - Admin dashboard and management interfaces


// Dashboard statistics
export interface DashboardStats {
  totalMovies: number;
  totalTVSeries: number;
  totalUsers: number;
  totalContent: number;
  todaySignups: number;
  monthlyGrowth: number;
  lastSyncDate: string | null;
  syncStatus: string;
}


// Notification item
export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  status: "pending" | "sent" | "failed";
  createdAt: string;
  userId?: number;
  user?: {
    name: string;
    email: string;
  };
}

// Admin user
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

// Content item
export interface ContentItem {
  id: number;
  tmdbId: number;
  title: string;
  type: "movie" | "tv";
  status: "active" | "hidden" | "archived";
  isHidden: boolean;
  hiddenReason?: string;
  createdAt: string;
  lastUpdated: string;
}

// SEO metrics
export interface SEOMetrics {
  pageTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage?: string;
  canonicalUrl: string;
  structuredData?: Record<string, unknown>;
  score: number;
}

// Sync options
export interface SyncOptions {
  target: "all" | "popular" | "trending";
  contentType?: "movie" | "tv" | "both";
  limit?: number;
}
