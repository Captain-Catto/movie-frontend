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
  } = options;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { showSuccess, showError } = useToast();

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
          err instanceof Error ? err.message : "Failed to load comments";
        setError(errorMessage);
        showError("Error loading comments", errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [queryParams, showError]
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
          "Bình luận đã đăng",
          "Bình luận của bạn đã được đăng thành công."
        );
        return newComment;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Không thể đăng bình luận";
        showError("Lỗi", errorMessage);
        throw err;
      }
    },
    [refresh, showSuccess, showError]
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
          "Comment updated",
          "Your comment has been updated successfully."
        );
        return updatedComment;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update comment";
        showError("Error updating comment", errorMessage);
        throw err;
      }
    },
    [showSuccess, showError]
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
          "Comment deleted",
          "Your comment has been deleted successfully."
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete comment";
        showError("Error deleting comment", errorMessage);
        throw err;
      }
    },
    [showSuccess, showError]
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
          err instanceof Error ? err.message : "Failed to like comment";
        showError("Error", errorMessage);
      }
    },
    [showError, comments]
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
          err instanceof Error ? err.message : "Failed to dislike comment";
        showError("Error", errorMessage);
      }
    },
    [showError, comments]
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
          "Comment reported",
          "Thank you for reporting this comment. We will review it shortly."
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to report comment";
        showError("Error reporting comment", errorMessage);
        throw err;
      }
    },
    [showSuccess, showError]
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

  const loadComment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const commentData = await commentService.getCommentById(commentId);
      setComment(commentData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load comment";
      setError(errorMessage);
      showError("Error loading comment", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [commentId, showError]);

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
