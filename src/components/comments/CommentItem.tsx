"use client";

import React from "react";
import Image from "next/image";
import { BiLike, BiDislike, BiSolidLike, BiSolidDislike } from "react-icons/bi";
import { CommentItemProps } from "@/types/comment.types";
import CommentForm from "./CommentForm";
import { RelativeTime } from "@/utils/hydration-safe-date";
import { useCommentItem } from "@/hooks/components/useCommentItem";

export function CommentItem(props: CommentItemProps) {
  const {
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
  } = useCommentItem(props);

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
              <RelativeTime date={currentComment.createdAt} className="inline" />
              {currentComment.isEdited && (
                <span className="text-gray-500 ml-2">(Edited)</span>
              )}
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="text">
            <CommentForm
              movieId={currentComment.movieId}
              tvSeriesId={currentComment.tvSeriesId || currentComment.tvId}
              editingComment={currentComment}
              onSubmit={handleEditSubmit}
              onCancel={handleCancelEdit}
              placeholder="Edit comment"
            />
          </div>
        ) : (
          <div className="text">
            <span className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {currentComment.content}
            </span>
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

        <div className="comment-bottom line-center d-flex mt-3 flex items-center gap-2">
          <div className="group-react line-center flex items-center gap-2">
            <button
              type="button"
              className={`item item-up line-center flex items-center gap-1.5 px-3 py-1.5 rounded cursor-pointer transition-colors ${
                currentComment.userLike === true
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => void handleSelfLike()}
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
              onClick={() => void handleSelfDislike()}
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

          {(props.depth ?? 0) < (props.maxDepth ?? 3) && (
            <button
              type="button"
              className="btn btn-xs btn-basic btn-comment px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors flex items-center gap-1"
              onClick={() => setShowReplyForm((prev) => !prev)}
            >
              <i className="fa-solid fa-reply text-xs"></i>
              <span className="text-xs">Reply</span>
            </button>
          )}

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
                onClick={() => void handleSelfDelete()}
              >
                <i className="fa-solid fa-trash text-xs"></i>
                <span className="text-xs">Delete</span>
              </button>
            </div>
          )}
        </div>

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

        {localReplyCount > 0 && (
          <div className="replies-wrap mt-3">
            <a
              className="text-primary text-red-500 cursor-pointer text-sm flex items-center gap-1 hover:text-red-400"
              onClick={() => void handleToggleReplies()}
            >
              <i
                className={`fa-solid ${
                  showReplies ? "fa-angle-up" : "fa-angle-down"
                } text-xs`}
              ></i>
              {loadingReplies
                ? "Loading..."
                : showReplies
                ? "Hide replies"
                : `View all replies (${localReplyCount})`}
            </a>
          </div>
        )}

        {showReplies && replies.length > 0 && (
          <div className="replies-list mt-4 pl-4 border-l-2 border-gray-700">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                depth={(props.depth ?? 0) + 1}
                maxDepth={props.maxDepth}
                onReply={props.onReply}
                onEdit={props.onEdit}
                onDelete={handleNestedDelete}
                onLike={handleNestedLike}
                onDislike={handleNestedDislike}
                onReport={props.onReport}
                onAddComment={props.onAddComment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentItem;
