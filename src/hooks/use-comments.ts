"use client";

import { useState, useEffect, useCallback, useMemo, useRef, useReducer } from "react";
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

interface CommentsState {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

type CommentsAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: { comments: Comment[]; hasNext: boolean; page: number; append: boolean } }
  | { type: "FETCH_FAILURE"; payload: string }
  | { type: "UPDATE_PAGE"; payload: number }
  | { type: "SET_COMMENTS"; payload: Comment[] };

function commentsReducer(state: CommentsState, action: CommentsAction): CommentsState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        comments: action.payload.append ? [...state.comments, ...action.payload.comments] : action.payload.comments,
        hasMore: action.payload.hasNext,
        page: action.payload.page,
      };
    case "FETCH_FAILURE":
      return { ...state, loading: false, error: action.payload };
    case "UPDATE_PAGE":
      return { ...state, page: action.payload };
    case "SET_COMMENTS":
      return { ...state, comments: action.payload };
    default:
      return state;
  }
}

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

  const [state, dispatch] = useReducer(commentsReducer, {
    comments: [],
    loading: false,
    error: null,
    page: 1,
    hasMore: true,
  });

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
        dispatch({ type: "FETCH_START" });

        const params = { ...queryParams, page: pageNum };
        const response = await commentService.getComments(params);

        dispatch({
          type: "FETCH_SUCCESS",
          payload: {
            comments: response.comments,
            hasNext: response.hasNext,
            page: pageNum,
            append,
          },
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : labels.errorLoadingCommentsDefault;
        dispatch({ type: "FETCH_FAILURE", payload: errorMessage });
        showError(labels.errorLoadingCommentsTitle, errorMessage);
      }
    },
    [queryParams, showError, labels.errorLoadingCommentsDefault, labels.errorLoadingCommentsTitle]
  );

  // Load more comments (pagination)
  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      loadComments(state.page + 1, true);
    }
  }, [state.loading, state.hasMore, state.page, loadComments]);

  // Refresh comments
  const refresh = useCallback(() => {
    dispatch({ type: "UPDATE_PAGE", payload: 1 });
    loadComments(1, false);
  }, [loadComments]);

  const commentsRef = useRef(state.comments);
  commentsRef.current = state.comments;

  // Add new comment
  const addComment = useCallback(
    async (data: CreateCommentDto): Promise<Comment> => {
      try {
        const newComment = await commentService.createComment(data);

        // Check if this is a top-level comment or a reply
        // Use data.parentId instead of hook's parentId
        if (!data.parentId) {
          // Top-level comment - add to the current list
          dispatch({
            type: "SET_COMMENTS",
            payload: [newComment, ...commentsRef.current],
          });
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
        dispatch({
          type: "SET_COMMENTS",
          payload: commentsRef.current.map((comment) => (comment.id === id ? updatedComment : comment)),
        });

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
        dispatch({
          type: "SET_COMMENTS",
          payload: commentsRef.current.filter((comment) => comment.id !== id),
        });

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
        const activeComments = commentsRef.current;
        const isTopLevel = activeComments.some(c => c.id === id);

        // Only call API if it's a top-level comment
        // Nested comments are handled by CommentItem's handleNestedLike
        if (isTopLevel) {
          const result = await commentService.likeComment(id);

          // Update local state with backend response
          // Backend uses likeCount/dislikeCount, frontend uses likesCount/dislikesCount
          dispatch({
            type: "SET_COMMENTS",
            payload: activeComments.map((comment) => {
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
            }),
          });
        }
        // If not top-level, it's a nested comment and will be handled by handleNestedLike
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : labels.errorLikingCommentDefault;
        showError(labels.errorTitle, errorMessage);
      }
    },
    [showError, labels.errorLikingCommentDefault, labels.errorTitle]
  );

  // Dislike comment
  const dislikeComment = useCallback(
    async (id: number): Promise<void> => {
      try {
        // Check if this comment exists in our top-level comments
        const activeComments = commentsRef.current;
        const isTopLevel = activeComments.some(c => c.id === id);

        // Only call API if it's a top-level comment
        // Nested comments are handled by CommentItem's handleNestedDislike
        if (isTopLevel) {
          const result = await commentService.dislikeComment(id);

          // Update local state with backend response
          // Backend uses likeCount/dislikeCount, frontend uses likesCount/dislikesCount
          dispatch({
            type: "SET_COMMENTS",
            payload: activeComments.map((comment) => {
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
            }),
          });
        }
        // If not top-level, it's a nested comment and will be handled by handleNestedDislike
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : labels.errorDislikingCommentDefault;
        showError(labels.errorTitle, errorMessage);
      }
    },
    [showError, labels.errorDislikingCommentDefault, labels.errorTitle]
  );

  // Report comment
  const reportComment = useCallback(
    async (id: number, data: CreateCommentReportDto): Promise<void> => {
      try {
        await commentService.reportComment(id, data);

        // Update local state
        const activeComments = commentsRef.current;
        dispatch({
          type: "SET_COMMENTS",
          payload: activeComments.map((comment) => {
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
          }),
        });

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
    comments: state.comments,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
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

interface CommentState {
  comment: Comment | null;
  loading: boolean;
  error: string | null;
}

type CommentAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Comment }
  | { type: "FETCH_FAILURE"; payload: string }
  | { type: "SET_COMMENT"; payload: Comment | null };

function commentReducer(state: CommentState, action: CommentAction): CommentState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, comment: action.payload };
    case "FETCH_FAILURE":
      return { ...state, loading: false, error: action.payload };
    case "SET_COMMENT":
      return { ...state, comment: action.payload };
    default:
      return state;
  }
}

// Hook for managing single comment operations
export function useComment(commentId: number) {
  const [state, dispatch] = useReducer(commentReducer, {
    comment: null,
    loading: false,
    error: null,
  });

  const { showError } = useToast();
  const { language } = useLanguage();
  const labels = getCommentsUiMessages(language);

  const lastFetchedCommentIdRef = useRef<number | null>(null);

  const loadComment = useCallback(async () => {
    try {
      dispatch({ type: "FETCH_START" });
      const commentData = await commentService.getCommentById(commentId);
      dispatch({ type: "FETCH_SUCCESS", payload: commentData });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : labels.errorLoadingCommentDefault;
      dispatch({ type: "FETCH_FAILURE", payload: errorMessage });
      showError(labels.errorLoadingCommentTitle, errorMessage);
    }
  }, [commentId, showError, labels.errorLoadingCommentDefault, labels.errorLoadingCommentTitle]);

  useEffect(() => {
    if (!commentId) return;
    if (lastFetchedCommentIdRef.current === commentId) return;
    lastFetchedCommentIdRef.current = commentId;
    loadComment();
  }, [commentId, loadComment]);

  return {
    comment: state.comment,
    loading: state.loading,
    error: state.error,
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
