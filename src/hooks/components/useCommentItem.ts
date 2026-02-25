"use client";

import { useCallback, useEffect, useState } from "react";
import { commentService } from "@/services/comment.service";
import { useAppSelector } from "@/store/hooks";
import type {
  Comment,
  CommentItemProps,
  CreateCommentDto,
} from "@/types/comment.types";

const NO_AVATAR = "/images/no-avatar.svg";

type MaybePromise<T> = T | Promise<T>;

export interface UseCommentItemResult {
  currentComment: Comment;
  showReplies: boolean;
  showReplyForm: boolean;
  replies: Comment[];
  loadingReplies: boolean;
  localReplyCount: number;
  isEditing: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  canModerate: boolean;
  avatarSrc: string;
  setShowReplyForm: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  handleAvatarError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  handleToggleReplies: () => Promise<void>;
  handleReplySubmit: (commentData: CreateCommentDto) => Promise<Comment>;
  handleEditSubmit: (commentData: CreateCommentDto) => Promise<Comment>;
  handleCancelEdit: () => void;
  handleNestedLike: (replyId: number) => Promise<void>;
  handleNestedDislike: (replyId: number) => Promise<void>;
  handleNestedDelete: (replyId: number) => Promise<void>;
  handleSelfLike: () => Promise<void>;
  handleSelfDislike: () => Promise<void>;
  handleSelfDelete: () => Promise<void>;
}

export function useCommentItem({
  comment,
  depth = 0,
  maxDepth = 3,
  onEdit,
  onDelete,
  onLike,
  onDislike,
  onAddComment,
}: CommentItemProps): UseCommentItemResult {
  const [currentComment, setCurrentComment] = useState(comment);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [localReplyCount, setLocalReplyCount] = useState(currentComment.replyCount);
  const [isEditing, setIsEditing] = useState(false);

  const { user } = useAppSelector((state) => state.auth);
  const isOwner = user?.id === currentComment.userId;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const canModerate = isAdmin;
  const avatarSrc = currentComment.user?.image || NO_AVATAR;

  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = NO_AVATAR;
  };

  useEffect(() => {
    setCurrentComment(comment);
    setLocalReplyCount(comment.replyCount);
  }, [comment]);

  const loadReplies = useCallback(async () => {
    if (repliesLoaded) return;

    setLoadingReplies(true);
    try {
      const response = await commentService.getReplies(currentComment.id, {
        page: 1,
        limit: 10,
      });

      setReplies(response.comments || []);
      setRepliesLoaded(true);
    } catch (error) {
      console.error("Failed to load replies:", error);
    } finally {
      setLoadingReplies(false);
    }
  }, [currentComment.id, repliesLoaded]);

  useEffect(() => {
    if (currentComment.replyCount > 0 && !repliesLoaded && depth < maxDepth) {
      void loadReplies();
      setShowReplies(true);
    }
  }, [currentComment.replyCount, depth, maxDepth, repliesLoaded, loadReplies]);

  const handleToggleReplies = async () => {
    if (!showReplies && !repliesLoaded) {
      await loadReplies();
    }
    setShowReplies((prev) => !prev);
  };

  const handleReplySubmit = async (commentData: CreateCommentDto) => {
    try {
      if (onAddComment) {
        await onAddComment(commentData);
      }
      setShowReplyForm(false);
      setRepliesLoaded(false);
      await loadReplies();
      setShowReplies(true);

      return {} as Comment;
    } catch (error) {
      console.error("Failed to submit reply:", error);
      throw error;
    }
  };

  const handleEditSubmit = async (commentData: CreateCommentDto) => {
    const trimmed = commentData.content?.trim() || "";
    if (!trimmed) {
      return currentComment;
    }

    try {
      let updated: Comment | undefined;

      if (onEdit) {
        updated = (await Promise.resolve(
          onEdit(currentComment.id, trimmed) as MaybePromise<Comment | void>
        )) as Comment | undefined;
      } else {
        updated = await commentService.updateComment(currentComment.id, {
          content: trimmed,
        });
      }

      const mergedComment = {
        ...currentComment,
        ...(updated || {}),
        content: trimmed,
        isEdited: true,
        updatedAt: updated?.updatedAt || new Date().toISOString(),
      };

      setCurrentComment(mergedComment);
      setIsEditing(false);
      return mergedComment;
    } catch (error) {
      console.error("Failed to edit comment:", error);
      throw error;
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleNestedLike = async (replyId: number) => {
    try {
      const isDirectChild = replies.some((r) => r.id === replyId);

      if (isDirectChild) {
        const result = await commentService.likeComment(replyId);

        setReplies((prevReplies) =>
          prevReplies.map((reply) =>
            reply.id === replyId
              ? {
                  ...reply,
                  likesCount: result.likeCount,
                  dislikesCount: result.dislikeCount,
                  userLike: result.userLike,
                }
              : reply
          )
        );

        if (onLike) {
          await Promise.resolve(onLike(replyId));
        }
      } else if (onLike) {
        await Promise.resolve(onLike(replyId));
      }
    } catch (error) {
      console.error(`Failed to like nested reply (depth=${depth}):`, error);
    }
  };

  const handleNestedDislike = async (replyId: number) => {
    try {
      const isDirectChild = replies.some((r) => r.id === replyId);

      if (isDirectChild) {
        const result = await commentService.dislikeComment(replyId);

        setReplies((prevReplies) =>
          prevReplies.map((reply) =>
            reply.id === replyId
              ? {
                  ...reply,
                  likesCount: result.likeCount,
                  dislikesCount: result.dislikeCount,
                  userLike: result.userLike,
                }
              : reply
          )
        );

        if (onDislike) {
          await Promise.resolve(onDislike(replyId));
        }
      } else if (onDislike) {
        await Promise.resolve(onDislike(replyId));
      }
    } catch (error) {
      console.error(`Failed to dislike nested reply (depth=${depth}):`, error);
    }
  };

  const handleNestedDelete = async (replyId: number) => {
    try {
      const isDirectChild = replies.some((r) => r.id === replyId);

      if (isDirectChild) {
        await commentService.deleteComment(replyId);
        setReplies((prevReplies) => prevReplies.filter((reply) => reply.id !== replyId));
        setLocalReplyCount((prev) => Math.max(0, prev - 1));

        if (onDelete) {
          await Promise.resolve(onDelete(replyId));
        }
      } else if (onDelete) {
        await Promise.resolve(onDelete(replyId));
      }
    } catch (error) {
      console.error(`Failed to delete nested reply (depth=${depth}):`, error);
    }
  };

  const handleSelfLike = async () => {
    if (onLike) {
      await Promise.resolve(onLike(currentComment.id));
    }
  };

  const handleSelfDislike = async () => {
    if (onDislike) {
      await Promise.resolve(onDislike(currentComment.id));
    }
  };

  const handleSelfDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this comment?");
    if (!confirmed) return;

    if (onDelete) {
      await Promise.resolve(onDelete(currentComment.id));
    }
  };

  return {
    currentComment,
    showReplies,
    showReplyForm,
    replies,
    loadingReplies,
    localReplyCount,
    isEditing,
    isOwner,
    isAdmin,
    canModerate,
    avatarSrc,
    setShowReplyForm,
    setIsEditing,
    handleAvatarError,
    handleToggleReplies,
    handleReplySubmit,
    handleEditSubmit,
    handleCancelEdit,
    handleNestedLike,
    handleNestedDislike,
    handleNestedDelete,
    handleSelfLike,
    handleSelfDislike,
    handleSelfDelete,
  };
}
