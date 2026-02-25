// useComments Hook
// Custom hook for managing comment state and operations

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { commentService } from "@/services/comment.service";
import {
  Comment,
  CreateCommentDto,
  UpdateCommentDto,
  CreateCommentReportDto,
  UseCommentsOptions,
  UseCommentsReturn,
} from "@/types/comment.types";
import { useToast } from "@/hooks/useToast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCommentsUiMessages } from "@/lib/ui-messages";

export function useComments(
  options: UseCommentsOptions = {}
): UseCommentsReturn {
  const {
    movieId,
    tvSeriesId,
    parentId,
    sortBy = "newest",
    limit = 10,
    autoRefresh = false,
    enableRealtime = true,
    realtimeIntervalMs = 15000,
  } = options;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { showSuccess, showError } = useToast();
  const { language } = useLanguage();
  const labels = getCommentsUiMessages(language);

  // Memoized query parameters
  const queryParams = useMemo(
    () => ({
      movieId,
      tvSeriesId,
      parentId,
      sortBy,
      limit,
      page: 1,
    }),
    [movieId, tvSeriesId, parentId, sortBy, limit]
  );

  // Load comments
  const loadComments = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      try {
        setLoading(true);
        setError(null);

        const params = { ...queryParams, page: pageNum };
        const response = await commentService.getComments(params);

        setComments((prev) =>
          append ? [...prev, ...response.comments] : response.comments
        );
        setHasMore(response.hasNext);
        setPage(pageNum);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : labels.errorLoadingCommentsDefault;
        setError(errorMessage);
        showError(labels.errorLoadingCommentsTitle, errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [queryParams, showError, labels.errorLoadingCommentsDefault, labels.errorLoadingCommentsTitle]
  );

  // Load more comments (pagination)
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadComments(page + 1, true);
    }
  }, [loading, hasMore, page, loadComments]);

  // Refresh comments
  const refresh = useCallback(() => {
    setPage(1);
    loadComments(1, false);
  }, [loadComments]);

  // Add new comment
  const addComment = useCallback(
    async (data: CreateCommentDto): Promise<Comment> => {
      try {
        const newComment = await commentService.createComment(data);

        // Check if this is a top-level comment or a reply
        // Use data.parentId instead of hook's parentId
        if (!data.parentId) {
          // Top-level comment - add to the current list
          setComments((prev) => [newComment, ...prev]);
        } else {
          // This is a reply - refresh to update reply counts and show in nested view
          // We need to refresh the whole list to show updated reply counts
          setTimeout(() => refresh(), 100);
        }

        showSuccess(
          labels.commentPostedTitle,
          labels.commentPostedDescription
        );
        return newComment;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : labels.errorPostingCommentDefault;
        showError(labels.errorTitle, errorMessage);
        throw err;
      }
    },
    [
      refresh,
      showSuccess,
      showError,
      labels.commentPostedTitle,
      labels.commentPostedDescription,
      labels.errorPostingCommentDefault,
      labels.errorTitle,
    ]
  );

  // Update comment
  const updateComment = useCallback(
    async (id: number, data: UpdateCommentDto): Promise<Comment> => {
      try {
        const updatedComment = await commentService.updateComment(id, data);

        // Update local state
        setComments((prev) =>
          prev.map((comment) => (comment.id === id ? updatedComment : comment))
        );

        showSuccess(
          labels.commentUpdatedTitle,
          labels.commentUpdatedDescription
        );
        return updatedComment;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : labels.errorUpdatingCommentDefault;
        showError(labels.errorUpdatingCommentTitle, errorMessage);
        throw err;
      }
    },
    [
      showSuccess,
      showError,
      labels.commentUpdatedTitle,
      labels.commentUpdatedDescription,
      labels.errorUpdatingCommentDefault,
      labels.errorUpdatingCommentTitle,
    ]
  );

  // Delete comment
  const deleteComment = useCallback(
    async (id: number): Promise<void> => {
      try {
        await commentService.deleteComment(id);

        // Remove from local state
        // For top-level comments: remove directly
        // For nested comments: CommentItem will handle via handleNestedDelete
        setComments((prev) => prev.filter((comment) => comment.id !== id));

        showSuccess(
          labels.commentDeletedTitle,
          labels.commentDeletedDescription
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : labels.errorDeletingCommentDefault;
        showError(labels.errorDeletingCommentTitle, errorMessage);
        throw err;
      }
    },
    [
      showSuccess,
      showError,
      labels.commentDeletedTitle,
      labels.commentDeletedDescription,
      labels.errorDeletingCommentDefault,
      labels.errorDeletingCommentTitle,
    ]
  );

  // Like comment
  const likeComment = useCallback(
    async (id: number): Promise<void> => {
      try {
        // Check if this comment exists in our top-level comments
        const isTopLevel = comments.some(c => c.id === id);

        // Only call API if it's a top-level comment
        // Nested comments are handled by CommentItem's handleNestedLike
        if (isTopLevel) {
          const result = await commentService.likeComment(id);

          // Update local state with backend response
          // Backend uses likeCount/dislikeCount, frontend uses likesCount/dislikesCount
          setComments((prev) =>
            prev.map((comment) => {
              if (comment.id === id) {
                return {
                  ...comment,
                  likesCount: result.likeCount,
                  dislikesCount: result.dislikeCount,
                  userLike: result.userLike,
                  userInteraction: {
                    ...comment.userInteraction,
                    hasLiked: result.userLike === true,
                    hasDisliked: result.userLike === false,
                    hasReported: comment.userInteraction?.hasReported || false,
                  },
                };
              }
              return comment;
            })
          );
        }
        // If not top-level, it's a nested comment and will be handled by handleNestedLike
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : labels.errorLikingCommentDefault;
        showError(labels.errorTitle, errorMessage);
      }
    },
    [showError, comments, labels.errorLikingCommentDefault, labels.errorTitle]
  );

  // Dislike comment
  const dislikeComment = useCallback(
    async (id: number): Promise<void> => {
      try {
        // Check if this comment exists in our top-level comments
        const isTopLevel = comments.some(c => c.id === id);

        // Only call API if it's a top-level comment
        // Nested comments are handled by CommentItem's handleNestedDislike
        if (isTopLevel) {
          const result = await commentService.dislikeComment(id);

          // Update local state with backend response
          // Backend uses likeCount/dislikeCount, frontend uses likesCount/dislikesCount
          setComments((prev) =>
            prev.map((comment) => {
              if (comment.id === id) {
                return {
                  ...comment,
                  likesCount: result.likeCount,
                  dislikesCount: result.dislikeCount,
                  userLike: result.userLike,
                  userInteraction: {
                    ...comment.userInteraction,
                    hasLiked: result.userLike === true,
                    hasDisliked: result.userLike === false,
                    hasReported: comment.userInteraction?.hasReported || false,
                  },
                };
              }
              return comment;
            })
          );
        }
        // If not top-level, it's a nested comment and will be handled by handleNestedDislike
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : labels.errorDislikingCommentDefault;
        showError(labels.errorTitle, errorMessage);
      }
    },
    [showError, comments, labels.errorDislikingCommentDefault, labels.errorTitle]
  );

  // Report comment
  const reportComment = useCallback(
    async (id: number, data: CreateCommentReportDto): Promise<void> => {
      try {
        await commentService.reportComment(id, data);

        // Update local state
        setComments((prev) =>
          prev.map((comment) => {
            if (comment.id === id) {
              return {
                ...comment,
                userInteraction: {
                  ...comment.userInteraction,
                  hasLiked: comment.userInteraction?.hasLiked || false,
                  hasDisliked: comment.userInteraction?.hasDisliked || false,
                  hasReported: true,
                },
              };
            }
            return comment;
          })
        );

        showSuccess(
          labels.commentReportedTitle,
          labels.commentReportedDescription
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : labels.errorReportingCommentDefault;
        showError(labels.errorReportingCommentTitle, errorMessage);
        throw err;
      }
    },
    [
      showSuccess,
      showError,
      labels.commentReportedTitle,
      labels.commentReportedDescription,
      labels.errorReportingCommentDefault,
      labels.errorReportingCommentTitle,
    ]
  );

  // Load comments on mount and when dependencies change
  useEffect(() => {
    loadComments(1, false);
  }, [loadComments]);

  // Auto refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refresh]);

  // Lightweight polling subscription until WebSocket is available
  useEffect(() => {
    if (!enableRealtime || autoRefresh) return;

    const unsubscribe = commentService.subscribeToComments(
      refresh,
      realtimeIntervalMs
    );

    return () => {
      unsubscribe();
    };
  }, [enableRealtime, autoRefresh, movieId, tvSeriesId, refresh, realtimeIntervalMs]);

  return {
    comments,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    addComment,
    updateComment,
    deleteComment,
    likeComment,
    dislikeComment,
    reportComment,
  };
}

// Hook for managing single comment operations
export function useComment(commentId: number) {
  const [comment, setComment] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { showError } = useToast();
  const { language } = useLanguage();
  const labels = getCommentsUiMessages(language);

  const loadComment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const commentData = await commentService.getCommentById(commentId);
      setComment(commentData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : labels.errorLoadingCommentDefault;
      setError(errorMessage);
      showError(labels.errorLoadingCommentTitle, errorMessage);
    } finally {
      setLoading(false);
    }
  }, [commentId, showError, labels.errorLoadingCommentDefault, labels.errorLoadingCommentTitle]);

  useEffect(() => {
    if (commentId) {
      loadComment();
    }
  }, [commentId, loadComment]);

  return {
    comment,
    loading,
    error,
    refresh: loadComment,
  };
}

// Hook for content filtering check
export function useContentFilter() {
  const [checking, setChecking] = useState(false);

  const checkContent = useCallback(async (content: string) => {
    try {
      setChecking(true);
      const result = await commentService.checkContentFilter(content);
      return result;
    } catch (err) {
      console.error("Content filter check failed:", err);
      return { isAllowed: true }; // Default to allowing content if check fails
    } finally {
      setChecking(false);
    }
  }, []);

  return {
    checkContent,
    checking,
  };
}
