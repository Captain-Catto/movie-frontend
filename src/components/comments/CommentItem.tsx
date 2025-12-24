// CommentItem Component - Reference layout
// Individual comment display with actions and replies

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { BiLike, BiDislike, BiSolidLike, BiSolidDislike } from "react-icons/bi";
import {
  CommentItemProps,
  Comment as CommentType,
  CreateCommentDto,
} from "@/types/comment.types";
import CommentForm from "./CommentForm";
import { useAppSelector } from "@/store/hooks";
import { commentService } from "@/services/comment.service";
import { RelativeTime } from "@/utils/hydration-safe-date";

const NO_AVATAR = "/images/no-avatar.svg";

export function CommentItem({
  comment,
  depth = 0,
  maxDepth = 3,
  onReply,
  onEdit,
  onDelete,
  onLike,
  onDislike,
  onReport,
  onAddComment,
}: CommentItemProps) {
  const [currentComment, setCurrentComment] = useState(comment);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState<CommentType[]>([]);
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

  // Auto-load replies when component mounts if there are replies
  useEffect(() => {
    // Load replies function
    const loadReplies = async () => {
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
    };

    // Auto-expand and load if comment has replies (showing first few by default)
    if (currentComment.replyCount > 0 && !repliesLoaded && depth < maxDepth) {
      loadReplies();
      setShowReplies(true);
    }
  }, [currentComment.replyCount, currentComment.id, depth, maxDepth, repliesLoaded]);

  // Load replies on demand
  const loadReplies = async () => {
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
  };

  // Handle toggle replies
  const handleToggleReplies = async () => {
    if (!showReplies && !repliesLoaded) {
      await loadReplies();
    }
    setShowReplies(!showReplies);
  };

  // Handle reply submit
  const handleReplySubmit = async (commentData: CreateCommentDto) => {
    try {
      if (onAddComment) {
        await onAddComment(commentData);
      }
      setShowReplyForm(false);

      // Always refresh replies after submitting
      // Mark as not loaded and reload to show the new reply
      setRepliesLoaded(false);
      await loadReplies();

      // Auto-expand replies to show the new comment
      setShowReplies(true);

      return {} as CommentType;
    } catch (error) {
      console.error("Failed to submit reply:", error);
      throw error;
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (commentData: CreateCommentDto) => {
    const trimmed = commentData.content?.trim() || "";
    if (!trimmed) {
      return currentComment;
    }

    try {
      let updated: CommentType | undefined;

      if (onEdit) {
        updated = (await onEdit(currentComment.id, trimmed)) as
          | CommentType
          | undefined;
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

  // Handle like for nested replies (update local state)
  const handleNestedLike = async (replyId: number) => {
    try {
      // Check if this reply is in our direct children
      const isDirectChild = replies.some((r) => r.id === replyId);

      if (isDirectChild) {
        // This is a direct child - call API and update our local state
        const result = await commentService.likeComment(replyId);

        setReplies((prevReplies) => {
          return prevReplies.map((reply) =>
            reply.id === replyId
              ? {
                  ...reply,
                  likesCount: result.likeCount,
                  dislikesCount: result.dislikeCount,
                  userLike: result.userLike,
                }
              : reply
          );
        });

        // Also propagate to parent for global state management
        if (onLike) {
          await onLike(replyId);
        }
      } else {
        // Not a direct child - just propagate to parent
        if (onLike) {
          await onLike(replyId);
        }
      }
    } catch (error) {
      console.error(`❌ [CommentItem depth=${depth}] Failed to like nested reply:`, error);
    }
  };

  // Handle dislike for nested replies (update local state)
  const handleNestedDislike = async (replyId: number) => {
    try {
      // Check if this reply is in our direct children
      const isDirectChild = replies.some((r) => r.id === replyId);

      if (isDirectChild) {
        // This is a direct child - call API and update our local state
        const result = await commentService.dislikeComment(replyId);

        setReplies((prevReplies) => {
          return prevReplies.map((reply) =>
            reply.id === replyId
              ? {
                  ...reply,
                  likesCount: result.likeCount,
                  dislikesCount: result.dislikeCount,
                  userLike: result.userLike,
                }
              : reply
          );
        });

        // Also propagate to parent for global state management
        if (onDislike) {
          await onDislike(replyId);
        }
      } else if (onDislike) {
        // Not a direct child - just propagate to parent
        await onDislike(replyId);
      }
    } catch (error) {
      console.error(`❌ [CommentItem depth=${depth}] Failed to dislike nested reply:`, error);
    }
  };

  // Handle delete for nested replies (update local state)
  const handleNestedDelete = async (replyId: number) => {
    try {
      // Check if this reply is in our direct children
      const isDirectChild = replies.some((r) => r.id === replyId);

      if (isDirectChild) {
        // This is a direct child - call API and update our local state
        await commentService.deleteComment(replyId);

        // Remove from local replies
        setReplies((prevReplies) => {
          return prevReplies.filter((reply) => reply.id !== replyId);
        });

        // Decrease reply count
        setLocalReplyCount((prev) => Math.max(0, prev - 1));

        // Also propagate to parent for global state management
        if (onDelete) {
          await onDelete(replyId);
        }
      } else if (onDelete) {
        // Not a direct child - just propagate to parent
        await onDelete(replyId);
      }
    } catch (error) {
      console.error(`❌ [CommentItem depth=${depth}] Failed to delete nested reply:`, error);
    }
  };

  // Handle like for this comment - delegate to parent (useComments hook)
  const handleSelfLike = async () => {
    if (onLike) {
      await onLike(currentComment.id);
    }
  };

  // Handle dislike for this comment - delegate to parent (useComments hook)
  const handleSelfDislike = async () => {
    if (onDislike) {
      await onDislike(currentComment.id);
    }
  };

  // Handle delete for this comment - delegate to parent (useComments hook)
  const handleSelfDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this comment?");
    if (!confirmed) return;

    if (onDelete) {
      await onDelete(currentComment.id);
    }
  };

  // Hidden comment
  if (currentComment.isHidden && !canModerate) {
    return null;
  }

  return (
    <div className="d-item flex gap-3 py-4" id={`cm-${currentComment.id}`}>
      <div className="user-avatar flex-shrink-0">
        <Image
          src={avatarSrc}
          alt={currentComment.user?.name || "User"}
          width={40}
          height={40}
          className="rounded-full object-cover"
          onError={handleAvatarError}
        />
      </div>

      <div className="info flex-1 min-w-0">
        {/* Comment Header */}
        <div className="comment-header flex items-center justify-between mb-2">
          <div className="user-name line-center gr-free flex items-center gap-2">
            <span className="text-white text-sm font-medium">
              {currentComment.user?.name || "Anonymous"}
              {isAdmin && (
                <i className="fa-solid fa-infinity text-primary ms-2 text-red-500"></i>
              )}
            </span>
          </div>
          <div className="ch-logs">
            <div className="c-time text-gray-400 text-xs">
              <RelativeTime
                date={currentComment.createdAt}
                className="inline"
              />
              {currentComment.isEdited && (
                <span className="text-gray-500 ml-2">(Edited)</span>
              )}
            </div>
          </div>
        </div>

        {/* Comment Text / Edit Form */}
        {isEditing ? (
          <div className="text">
            <CommentForm
              movieId={currentComment.movieId}
              tvSeriesId={currentComment.tvSeriesId || currentComment.tvId}
              editingComment={currentComment}
              onSubmit={handleEditSubmit}
              onCancel={handleCancelEdit}
              placeholder="Chỉnh sửa bình luận"
            />
          </div>
        ) : (
          <div className="text">
            <span className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {currentComment.content}
            </span>
            {/* Display mentions */}
            {currentComment.mentions && currentComment.mentions.length > 0 && (
              <div className="mentions-list flex flex-wrap gap-1 mt-2">
                {currentComment.mentions.map((mention) => (
                  <span
                    key={mention.id}
                    className="mention-badge inline-flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs"
                  >
                    <i className="fa-solid fa-at text-xs"></i>
                    {mention.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Comment Bottom - Actions */}
        <div className="comment-bottom line-center d-flex mt-3 flex items-center gap-2">
          {/* React buttons */}
          <div className="group-react line-center flex items-center gap-2">
            <button
              type="button"
              className={`item item-up line-center flex items-center gap-1.5 px-3 py-1.5 rounded cursor-pointer transition-colors ${
                currentComment.userLike === true
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={handleSelfLike}
            >
              {currentComment.userLike === true ? (
                <BiSolidLike className="w-4 h-4" />
              ) : (
                <BiLike className="w-4 h-4" />
              )}
              {currentComment.likesCount > 0 && (
                <span className="text-xs">{currentComment.likesCount}</span>
              )}
            </button>
            <button
              type="button"
              className={`item item-down line-center flex items-center gap-1.5 px-3 py-1.5 rounded cursor-pointer transition-colors ${
                currentComment.userLike === false
                  ? "bg-red-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={handleSelfDislike}
            >
              {currentComment.userLike === false ? (
                <BiSolidDislike className="w-4 h-4" />
              ) : (
                <BiDislike className="w-4 h-4" />
              )}
              {currentComment.dislikesCount > 0 && (
                <span className="text-xs">{currentComment.dislikesCount}</span>
              )}
            </button>
          </div>

          {/* Reply button */}
          {depth < maxDepth && (
            <button
              type="button"
              className="btn btn-xs btn-basic btn-comment px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors flex items-center gap-1"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <i className="fa-solid fa-reply text-xs"></i>
              <span className="text-xs">Reply</span>
            </button>
          )}

          {/* More button - Edit/Delete */}
          {(isOwner || canModerate) && (
            <div className="flex items-center gap-2">
              {isOwner && (
                <button
                  type="button"
                  className="btn btn-xs btn-basic px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors flex items-center gap-1"
                  onClick={() => setIsEditing(true)}
                  disabled={isEditing}
                >
                  <i className="fa-solid fa-pen text-xs"></i>
                  <span className="text-xs">Edit</span>
                </button>
              )}
              <button
                type="button"
                className="btn btn-xs btn-basic btn-menu px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors flex items-center gap-1"
                onClick={handleSelfDelete}
              >
                <i className="fa-solid fa-trash text-xs"></i>
                <span className="text-xs">Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-4">
            <CommentForm
              movieId={currentComment.movieId}
              tvSeriesId={currentComment.tvSeriesId || currentComment.tvId}
              parentId={currentComment.id}
              placeholder={`Reply to ${currentComment.user?.name || ""}...`}
              onSubmit={handleReplySubmit}
              onCancel={() => setShowReplyForm(false)}
            />
          </div>
        )}

        {/* Replies Toggle */}
        {localReplyCount > 0 && (
          <div className="replies-wrap mt-3">
            <a
              className="text-primary text-red-500 cursor-pointer text-sm flex items-center gap-1 hover:text-red-400"
              onClick={handleToggleReplies}
            >
              <i className={`fa-solid ${showReplies ? 'fa-angle-up' : 'fa-angle-down'} text-xs`}></i>
              {loadingReplies
                ? "Loading..."
                : showReplies
                  ? "Hide replies"
                  : `View all replies (${localReplyCount})`
              }
            </a>
          </div>
        )}

        {/* Replies List */}
        {showReplies && replies && replies.length > 0 && (
          <div className="replies-list mt-4 pl-4 border-l-2 border-gray-700">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                maxDepth={maxDepth}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={handleNestedDelete}
                onLike={handleNestedLike}
                onDislike={handleNestedDislike}
                onReport={onReport}
                onAddComment={onAddComment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentItem;

