// Comment System Types
// Frontend types for the movie comment system

export interface Comment {
  id: number;
  content: string;
  userId: number;
  movieId?: number;
  tvSeriesId?: number; // Frontend field for compatibility
  tvId?: number; // Backend field (alias for tvSeriesId)
  parentId?: number;
  isHidden: boolean;
  hideReason?: string;
  hiddenBy?: number;
  hiddenAt?: string;
  likesCount: number; // Frontend field
  dislikesCount: number; // Frontend field
  likeCount?: number; // Backend field (alias for likesCount)
  dislikeCount?: number; // Backend field (alias for dislikesCount)
  replyCount: number;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;

  // Populated relations
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    image?: string;
  };
  replies?: Comment[];
  userLike?: boolean | null; // true = liked, false = disliked, null = no interaction
  userInteraction?: {
    hasLiked: boolean;
    hasDisliked: boolean;
    hasReported: boolean;
  };
  mentions?: Array<{
    id: number;
    name: string;
    image?: string | null;
  }>;
}

export interface CommentLike {
  id: number;
  commentId: number;
  userId: number;
  isLike: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentReport {
  id: number;
  commentId: number;
  reporterId: number;
  reason: string;
  description?: string;
  status: "pending" | "reviewed" | "dismissed";
  reviewedBy?: number;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BannedWord {
  id: number;
  word: string;
  severity: "low" | "medium" | "high";
  action: "filter" | "block" | "flag";
  createdAt: string;
  updatedAt: string;
}

// API Request/Response Types
export interface CreateCommentDto {
  content: string;
  movieId?: number;
  tvId?: number; // Match backend DTO
  parentId?: number;
}

export interface UpdateCommentDto {
  content: string;
}

export interface CreateCommentReportDto {
  reason: string;
  description?: string;
}

export interface CommentQueryDto {
  page?: number;
  limit?: number;
  sortBy?: "newest" | "oldest" | "likes";
  movieId?: number;
  tvSeriesId?: number;
  parentId?: number;
}

export interface CommentResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CommentStats {
  totalComments: number;
  totalLikes: number;
  totalReports: number;
  hiddenComments: number;
  averageCommentsPerDay: number;
}

// Admin Types
export interface AdminCommentQueryDto extends CommentQueryDto {
  isHidden?: boolean;
  userId?: number;
  hasReports?: boolean;
  reportStatus?: "pending" | "reviewed" | "dismissed";
}

export interface BulkCommentActionDto {
  commentIds: number[];
  action: "hide" | "unhide" | "delete";
  reason?: string;
}

export interface BannedWordCreateDto {
  word: string;
  severity: "low" | "medium" | "high";
  action: "filter" | "block" | "flag";
}

// Component Props Types
export interface CommentSectionProps {
  movieId?: number;
  tvSeriesId?: number;
  className?: string;
}

export interface CommentItemProps {
  comment: Comment;
  depth?: number;
  maxDepth?: number;
  onReply?: (commentId: number) => void;
  onEdit?: (commentId: number, content: string) => Promise<Comment | void> | void;
  onDelete?: (commentId: number) => void;
  onLike?: (commentId: number) => void;
  onDislike?: (commentId: number) => void;
  onReport?: (commentId: number) => void;
  onAddComment?: (comment: CreateCommentDto) => Promise<Comment>; // Add this for reply submission
}

export interface CommentFormProps {
  movieId?: number;
  tvSeriesId?: number;
  parentId?: number;
  editingComment?: Comment;
  onSubmit?: (comment: CreateCommentDto) => Promise<Comment>;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
}

export interface CommentActionsProps {
  comment: Comment;
  onLike: () => void;
  onDislike: () => void;
  onReply: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport: () => void;
  isOwner: boolean;
  className?: string;
}

// Hook Types
export interface UseCommentsOptions {
  movieId?: number;
  tvSeriesId?: number;
  parentId?: number;
  sortBy?: "newest" | "oldest" | "likes";
  limit?: number;
  autoRefresh?: boolean;
  enableRealtime?: boolean;
  realtimeIntervalMs?: number;
}

export interface UseCommentsReturn {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  addComment: (comment: CreateCommentDto) => Promise<Comment>;
  updateComment: (id: number, data: UpdateCommentDto) => Promise<Comment>;
  deleteComment: (id: number) => Promise<void>;
  likeComment: (id: number) => Promise<void>;
  dislikeComment: (id: number) => Promise<void>;
  reportComment: (id: number, data: CreateCommentReportDto) => Promise<void>;
}

// Context Types
export interface CommentContextType {
  currentUser: {
    id: number;
    username: string;
    role: string;
  } | null;
  moderationEnabled: boolean;
  maxDepth: number;
  pageSize: number;
}

// Utility Types
export type CommentSortOption = "newest" | "oldest" | "likes";
export type ReportReason =
  | "spam"
  | "harassment"
  | "inappropriate"
  | "misinformation"
  | "other";
export type CommentAction =
  | "like"
  | "dislike"
  | "reply"
  | "edit"
  | "delete"
  | "report";
