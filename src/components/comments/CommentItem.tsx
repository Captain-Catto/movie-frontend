// CommentItem Component - Reference layout
// Individual comment display with actions and replies

"use client";

import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
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
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState<CommentType[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [localReplyCount, setLocalReplyCount] = useState(comment.replyCount);

  const { user } = useAppSelector((state) => state.auth);
  const isOwner = user?.id === comment.userId;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const canModerate = isAdmin;

  // Format timestamp to Vietnamese
  const formatTimestamp = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        return `${diffInMinutes} phút trước`;
      } else if (diffInHours < 24) {
        return `${diffInHours} giờ trước`;
      } else if (diffInHours < 48) {
        return "một ngày trước";
      } else if (diffInHours < 72) {
        return "2 ngày trước";
      } else if (diffInHours < 168) {
        return `${Math.floor(diffInHours / 24)} ngày trước`;
      } else {
        return formatDistanceToNow(date, { addSuffix: true, locale: vi });
      }
    } catch {
      return "Unknown time";
    }
  };

  // Auto-load replies when component mounts if there are replies
  useEffect(() => {
    // Load replies function
    const loadReplies = async () => {
      if (repliesLoaded) return;

      setLoadingReplies(true);
      try {
        const response = await commentService.getReplies(comment.id, {
          page: 1,
          limit: 10,
        });

        console.log(`📥 [CommentItem depth=${depth}] Loaded replies for comment ${comment.id}:`, response.comments);
        setReplies(response.comments || []);
        setRepliesLoaded(true);
      } catch (error) {
        console.error("Failed to load replies:", error);
      } finally {
        setLoadingReplies(false);
      }
    };

    // Auto-expand and load if comment has replies (showing first few by default)
    if (comment.replyCount > 0 && !repliesLoaded && depth < maxDepth) {
      loadReplies();
      setShowReplies(true);
    }
  }, [comment.replyCount, comment.id, depth, maxDepth, repliesLoaded]);

  // Load replies on demand
  const loadReplies = async () => {
    if (repliesLoaded) return;

    setLoadingReplies(true);
    try {
      const response = await commentService.getReplies(comment.id, {
        page: 1,
        limit: 10,
      });

      console.log(`📥 [CommentItem depth=${depth}] Loaded replies for comment ${comment.id}:`, response.comments);
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

  // Handle like for nested replies (update local state)
  const handleNestedLike = async (replyId: number) => {
    console.log(`🔵 [CommentItem depth=${depth}] handleNestedLike called for reply:`, replyId);

    try {
      // Check if this reply is in our direct children
      const isDirectChild = replies.some(r => r.id === replyId);

      if (isDirectChild) {
        // This is a direct child - call API and update our local state
        console.log(`🔵 [CommentItem depth=${depth}] This is a direct child, calling API...`);
        const result = await commentService.likeComment(replyId);
        console.log(`🔵 [CommentItem depth=${depth}] Like result:`, result);

        setReplies((prevReplies) => {
          const updated = prevReplies.map((reply) =>
            reply.id === replyId
              ? {
                  ...reply,
                  likesCount: result.likeCount,
                  dislikesCount: result.dislikeCount,
                  userLike: result.userLike,
                }
              : reply
          );
          console.log(`🔵 [CommentItem depth=${depth}] Updated local replies state`);
          return updated;
        });

        // Also propagate to parent for global state management
        if (onLike) {
          console.log(`🔵 [CommentItem depth=${depth}] Propagating to parent...`);
          onLike(replyId);
        }
      } else {
        // Not a direct child - just propagate to parent
        console.log(`🔵 [CommentItem depth=${depth}] Not a direct child, propagating to parent...`);
        if (onLike) {
          onLike(replyId);
        }
      }
    } catch (error) {
      console.error(`❌ [CommentItem depth=${depth}] Failed to like nested reply:`, error);
    }
  };

  // Handle dislike for nested replies (update local state)
  const handleNestedDislike = async (replyId: number) => {
    console.log(`🔴 [CommentItem depth=${depth}] handleNestedDislike called for reply:`, replyId);

    try {
      // Check if this reply is in our direct children
      const isDirectChild = replies.some(r => r.id === replyId);

      if (isDirectChild) {
        // This is a direct child - call API and update our local state
        console.log(`🔴 [CommentItem depth=${depth}] This is a direct child, calling API...`);
        const result = await commentService.dislikeComment(replyId);
        console.log(`🔴 [CommentItem depth=${depth}] Dislike result:`, result);

        setReplies((prevReplies) => {
          const updated = prevReplies.map((reply) =>
            reply.id === replyId
              ? {
                  ...reply,
                  likesCount: result.likeCount,
                  dislikesCount: result.dislikeCount,
                  userLike: result.userLike,
                }
              : reply
          );
          console.log(`🔴 [CommentItem depth=${depth}] Updated local replies state`);
          return updated;
        });

        // Also propagate to parent for global state management
        if (onDislike) {
          console.log(`🔴 [CommentItem depth=${depth}] Propagating to parent...`);
          onDislike(replyId);
        }
      } else {
        // Not a direct child - just propagate to parent
        console.log(`🔴 [CommentItem depth=${depth}] Not a direct child, propagating to parent...`);
        if (onDislike) {
          onDislike(replyId);
        }
      }
    } catch (error) {
      console.error(`❌ [CommentItem depth=${depth}] Failed to dislike nested reply:`, error);
    }
  };

  // Handle delete for nested replies (update local state)
  const handleNestedDelete = async (replyId: number) => {
    console.log(`🗑️ [CommentItem depth=${depth}] handleNestedDelete called for reply:`, replyId);

    try {
      // Check if this reply is in our direct children
      const isDirectChild = replies.some(r => r.id === replyId);

      if (isDirectChild) {
        // This is a direct child - call API and update our local state
        console.log(`🗑️ [CommentItem depth=${depth}] This is a direct child, calling API...`);
        await commentService.deleteComment(replyId);
        console.log(`🗑️ [CommentItem depth=${depth}] Delete successful`);

        // Remove from local replies
        setReplies((prevReplies) => {
          const filtered = prevReplies.filter((reply) => reply.id !== replyId);
          console.log(`🗑️ [CommentItem depth=${depth}] Updated local replies state, removed reply ${replyId}`);
          return filtered;
        });

        // Decrease reply count
        setLocalReplyCount((prev) => Math.max(0, prev - 1));
        console.log(`🗑️ [CommentItem depth=${depth}] Decreased reply count`);

        // Also propagate to parent for global state management
        if (onDelete) {
          console.log(`🗑️ [CommentItem depth=${depth}] Propagating to parent...`);
          onDelete(replyId);
        }
      } else {
        // Not a direct child - just propagate to parent
        console.log(`🗑️ [CommentItem depth=${depth}] Not a direct child, propagating to parent...`);
        if (onDelete) {
          onDelete(replyId);
        }
      }
    } catch (error) {
      console.error(`❌ [CommentItem depth=${depth}] Failed to delete nested reply:`, error);
    }
  };

  // Handle like for this comment - delegate to parent (useComments hook)
  const handleSelfLike = async () => {
    if (onLike) {
      await onLike(comment.id);
    }
  };

  // Handle dislike for this comment - delegate to parent (useComments hook)
  const handleSelfDislike = async () => {
    if (onDislike) {
      await onDislike(comment.id);
    }
  };

  // Handle delete for this comment - delegate to parent (useComments hook)
  const handleSelfDelete = async () => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa bình luận này?");
    if (!confirmed) return;

    if (onDelete) {
      await onDelete(comment.id);
    }
  };

  // Hidden comment
  if (comment.isHidden && !canModerate) {
    return null;
  }

  return (
    <div className="d-item flex gap-3 py-4" id={`cm-${comment.id}`}>
      <div className="user-avatar flex-shrink-0">
        <Image
          src={comment.user?.image || "/images/avatars/pack2/03.jpg"}
          alt={comment.user?.name || "User"}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
      </div>

      <div className="info flex-1 min-w-0">
        {/* Comment Header */}
        <div className="comment-header flex items-center justify-between mb-2">
          <div className="user-name line-center gr-free flex items-center gap-2">
            <span className="text-white text-sm font-medium">
              {comment.user?.name || "Anonymous"}
              {isAdmin && (
                <i className="fa-solid fa-infinity text-primary ms-2 text-red-500"></i>
              )}
            </span>
          </div>
          <div className="ch-logs">
            <div className="c-time text-gray-400 text-xs">
              {formatTimestamp(comment.createdAt)}
            </div>
          </div>
        </div>

        {/* Comment Text */}
        <div className="text">
          <span className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </span>
          {/* Display mentions */}
          {comment.mentions && comment.mentions.length > 0 && (
            <div className="mentions-list flex flex-wrap gap-1 mt-2">
              {comment.mentions.map((mention) => (
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

        {/* Comment Bottom - Actions */}
        <div className="comment-bottom line-center d-flex mt-3 flex items-center gap-2">
          {/* React buttons */}
          <div className="group-react line-center flex items-center gap-2">
            <button
              type="button"
              className={`item item-up line-center flex items-center gap-1.5 px-3 py-1.5 rounded cursor-pointer transition-colors ${
                comment.userLike === true
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={handleSelfLike}
            >
              {comment.userLike === true ? (
                <BiSolidLike className="w-4 h-4" />
              ) : (
                <BiLike className="w-4 h-4" />
              )}
              {comment.likesCount > 0 && (
                <span className="text-xs">{comment.likesCount}</span>
              )}
            </button>
            <button
              type="button"
              className={`item item-down line-center flex items-center gap-1.5 px-3 py-1.5 rounded cursor-pointer transition-colors ${
                comment.userLike === false
                  ? "bg-red-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={handleSelfDislike}
            >
              {comment.userLike === false ? (
                <BiSolidDislike className="w-4 h-4" />
              ) : (
                <BiDislike className="w-4 h-4" />
              )}
              {comment.dislikesCount > 0 && (
                <span className="text-xs">{comment.dislikesCount}</span>
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
              <span className="text-xs">Trả lời</span>
            </button>
          )}

          {/* More button - Edit/Delete */}
          {(isOwner || canModerate) && (
            <div className="dropdown">
              <button
                type="button"
                className="btn btn-xs btn-basic btn-menu px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors flex items-center gap-1"
                onClick={handleSelfDelete}
              >
                <i className="fa-solid fa-ellipsis text-xs"></i>
                <span className="text-xs">Xóa</span>
              </button>
            </div>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-4">
            <CommentForm
              movieId={comment.movieId}
              tvSeriesId={comment.tvSeriesId || comment.tvId}
              parentId={comment.id}
              placeholder={`Trả lời ${comment.user?.name || ""}...`}
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
                ? "Đang tải..."
                : showReplies
                  ? "Ẩn bình luận"
                  : `Xem tất cả bình luận (${localReplyCount})`
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
