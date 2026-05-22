"use client";

import React from "react";
import Image from "next/image";
import {
  AtSign,
  ChevronDown,
  ChevronUp,
  Infinity,
  Pencil,
  Reply,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { CommentItemProps } from "@/types/comment.types";
import CommentForm from "./CommentForm";
import { RelativeTime } from "@/utils/hydration-safe-date";
import { useCommentItem } from "@/hooks/components/useCommentItem";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCommentsUiMessages } from "@/lib/ui-messages";

function CommentAvatar({
  src,
  alt,
  onError,
}: {
  src: string;
  alt: string;
  onError: React.ReactEventHandler<HTMLImageElement>;
}) {
  return (
    <div className="user-avatar flex-shrink-0">
      <Image
        src={src}
        alt={alt}
        width={40}
        height={40}
        className="rounded-full object-cover"
        onError={onError}
      />
    </div>
  );
}

function CommentRepliesToggle({
  visible,
  loading,
  count,
  labels,
  onToggle,
}: {
  visible: boolean;
  loading: boolean;
  count: number;
  labels: ReturnType<typeof getCommentsUiMessages>;
  onToggle: () => void;
}) {
  if (count <= 0) return null;

  return (
    <div className="replies-wrap mt-3">
      <button
        type="button"
        className="text-primary text-red-500 cursor-pointer text-sm flex items-center gap-1 hover:text-red-400"
        onClick={onToggle}
      >
        {visible ? (
          <ChevronUp className="text-xs size-3" />
        ) : (
          <ChevronDown className="text-xs size-3" />
        )}
        {loading
          ? labels.loading
          : visible
          ? labels.hideReplies
          : labels.viewAllReplies(count)}
      </button>
    </div>
  );
}

function CommentRepliesList({
  showReplies,
  replies,
  depth,
  maxDepth,
  onReply,
  onEdit,
  onDelete,
  onLike,
  onDislike,
  onReport,
  onAddComment,
}: {
  showReplies: boolean;
  replies: CommentItemProps["comment"][];
  depth: number;
  maxDepth?: number;
  onReply?: CommentItemProps["onReply"];
  onEdit?: CommentItemProps["onEdit"];
  onDelete?: CommentItemProps["onDelete"];
  onLike?: CommentItemProps["onLike"];
  onDislike?: CommentItemProps["onDislike"];
  onReport?: CommentItemProps["onReport"];
  onAddComment?: CommentItemProps["onAddComment"];
}) {
  if (!showReplies || replies.length === 0) return null;

  return (
    <div className="replies-list mt-4 pl-4 border-l-2 border-gray-700">
      {replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          depth={depth + 1}
          maxDepth={maxDepth}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onLike={onLike}
          onDislike={onDislike}
          onReport={onReport}
          onAddComment={onAddComment}
        />
      ))}
    </div>
  );
}

function CommentHeader({
  userName,
  isAdmin,
  createdAt,
  isEdited,
  editedLabel,
  language,
}: {
  userName: string;
  isAdmin: boolean;
  createdAt: string;
  isEdited?: boolean;
  editedLabel: string;
  language: string;
}) {
  return (
    <div className="comment-header flex items-center justify-between mb-2">
      <div className="user-name line-center gr-free flex items-center gap-2">
        <span className="text-white text-sm font-medium">
          {userName}
          {isAdmin && (
            <Infinity className="text-primary ms-2 text-red-500 inline-block size-4" />
          )}
        </span>
      </div>
      <div className="ch-logs">
        <div className="c-time text-gray-400 text-xs">
          <RelativeTime date={createdAt} className="inline" language={language} />
          {isEdited && <span className="text-gray-500 ml-2">({editedLabel})</span>}
        </div>
      </div>
    </div>
  );
}

function HiddenCommentContent({
  userName,
  createdAt,
  hiddenReason,
  language,
}: {
  userName: string;
  createdAt: string;
  hiddenReason?: string | null;
  language: string;
}) {
  return (
    <>
      <div className="comment-header flex items-center justify-between mb-2">
        <span className="text-white text-sm font-medium">{userName}</span>
        <div className="c-time text-gray-500 text-xs">
          <RelativeTime date={createdAt} className="inline" language={language} />
        </div>
      </div>
      <p className="text-gray-500 text-sm leading-relaxed italic">
        Bình luận này bị ẩn bởi admin
        {hiddenReason ? `: ${hiddenReason}` : ""}
      </p>
    </>
  );
}

function CommentBody({
  currentComment,
  isEditing,
  labels,
  onEditSubmit,
  onCancelEdit,
}: {
  currentComment: ReturnType<typeof useCommentItem>["currentComment"];
  isEditing: boolean;
  labels: ReturnType<typeof getCommentsUiMessages>;
  onEditSubmit: ReturnType<typeof useCommentItem>["handleEditSubmit"];
  onCancelEdit: ReturnType<typeof useCommentItem>["handleCancelEdit"];
}) {
  if (isEditing) {
    return (
      <div className="text">
        <CommentForm
          key={`edit-${currentComment.id}-${currentComment.updatedAt}`}
          movieId={currentComment.movieId}
          tvSeriesId={currentComment.tvSeriesId || currentComment.tvId}
          editingComment={currentComment}
          onSubmit={onEditSubmit}
          onCancel={onCancelEdit}
          placeholder={labels.editComment}
        />
      </div>
    );
  }

  return (
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
              <AtSign className="text-xs size-3" />
              {mention.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentActions({
  currentComment,
  depth,
  maxDepth,
  isOwner,
  canModerate,
  isEditing,
  labels,
  onReplyToggle,
  onEditStart,
  onLike,
  onDislike,
  onDelete,
}: {
  currentComment: ReturnType<typeof useCommentItem>["currentComment"];
  depth: number;
  maxDepth?: number;
  isOwner: boolean;
  canModerate: boolean;
  isEditing: boolean;
  labels: ReturnType<typeof getCommentsUiMessages>;
  onReplyToggle: () => void;
  onEditStart: () => void;
  onLike: () => void;
  onDislike: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="comment-bottom line-center d-flex mt-3 flex items-center gap-2">
      <div className="group-react line-center flex items-center gap-2">
        <button
          type="button"
          aria-label="Like"
          className={`item item-up line-center flex items-center gap-1.5 px-3 py-1.5 rounded cursor-pointer transition-colors ${
            currentComment.userLike === true
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
          onClick={onLike}
        >
          <ThumbsUp
            className={`size-4 ${currentComment.userLike === true ? "fill-current" : ""}`}
          />
          {currentComment.likesCount > 0 && (
            <span className="text-xs">{currentComment.likesCount}</span>
          )}
        </button>
        <button
          type="button"
          aria-label="Dislike"
          className={`item item-down line-center flex items-center gap-1.5 px-3 py-1.5 rounded cursor-pointer transition-colors ${
            currentComment.userLike === false
              ? "bg-red-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
          onClick={onDislike}
        >
          <ThumbsDown
            className={`size-4 ${currentComment.userLike === false ? "fill-current" : ""}`}
          />
          {currentComment.dislikesCount > 0 && (
            <span className="text-xs">{currentComment.dislikesCount}</span>
          )}
        </button>
      </div>

      {depth < (maxDepth ?? 3) && (
        <button
          type="button"
          className="btn btn-xs btn-basic btn-comment px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors flex items-center gap-1"
          onClick={onReplyToggle}
        >
          <Reply className="text-xs size-3" />
          <span className="text-xs">{labels.reply}</span>
        </button>
      )}

      {(isOwner || canModerate) && (
        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              type="button"
              className="btn btn-xs btn-basic px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors flex items-center gap-1"
              onClick={onEditStart}
              disabled={isEditing}
            >
              <Pencil className="text-xs size-3" />
              <span className="text-xs">{labels.edit}</span>
            </button>
          )}
          <button
            type="button"
            className="btn btn-xs btn-basic btn-menu px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors flex items-center gap-1"
            onClick={onDelete}
          >
            <Trash2 className="text-xs size-3" />
            <span className="text-xs">{labels.delete}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function CommentItem(props: CommentItemProps) {
  const { language } = useLanguage();
  const labels = getCommentsUiMessages(language);

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

  if (currentComment.isHidden) {
    return (
      <div className="d-item flex gap-3 py-4" id={`cm-${currentComment.id}`}>
        <CommentAvatar
          src={avatarSrc}
          alt={currentComment.user?.name || labels.defaultUser}
          onError={handleAvatarError}
        />

        <div className="info flex-1 min-w-0">
          <HiddenCommentContent
            userName={currentComment.user?.name || labels.anonymous}
            createdAt={currentComment.createdAt}
            hiddenReason={currentComment.hiddenReason}
            language={language}
          />
          <CommentRepliesToggle
            visible={showReplies}
            loading={loadingReplies}
            count={localReplyCount}
            labels={labels}
            onToggle={() => void handleToggleReplies()}
          />
          <CommentRepliesList
            showReplies={showReplies}
            replies={replies}
            depth={props.depth ?? 0}
            maxDepth={props.maxDepth}
            onReply={props.onReply}
            onEdit={props.onEdit}
            onDelete={handleNestedDelete}
            onLike={handleNestedLike}
            onDislike={handleNestedDislike}
            onReport={props.onReport}
            onAddComment={props.onAddComment}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="d-item flex gap-3 py-4" id={`cm-${currentComment.id}`}>
      <CommentAvatar
        src={avatarSrc}
        alt={currentComment.user?.name || labels.defaultUser}
        onError={handleAvatarError}
      />

      <div className="info flex-1 min-w-0">
        <CommentHeader
          userName={currentComment.user?.name || labels.anonymous}
          isAdmin={isAdmin}
          createdAt={currentComment.createdAt}
          isEdited={currentComment.isEdited}
          editedLabel={labels.edited}
          language={language}
        />
        <CommentBody
          currentComment={currentComment}
          isEditing={isEditing}
          labels={labels}
          onEditSubmit={handleEditSubmit}
          onCancelEdit={handleCancelEdit}
        />
        <CommentActions
          currentComment={currentComment}
          depth={props.depth ?? 0}
          maxDepth={props.maxDepth}
          isOwner={isOwner}
          canModerate={canModerate}
          isEditing={isEditing}
          labels={labels}
          onReplyToggle={() => setShowReplyForm((prev) => !prev)}
          onEditStart={() => setIsEditing(true)}
          onLike={() => void handleSelfLike()}
          onDislike={() => void handleSelfDislike()}
          onDelete={() => void handleSelfDelete()}
        />

        {showReplyForm && (
          <div className="mt-4">
            <CommentForm
              movieId={currentComment.movieId}
              tvSeriesId={currentComment.tvSeriesId || currentComment.tvId}
              parentId={currentComment.id}
              placeholder={labels.replyTo(currentComment.user?.name || "")}
              onSubmit={handleReplySubmit}
              onCancel={() => setShowReplyForm(false)}
            />
          </div>
        )}

        <CommentRepliesToggle
          visible={showReplies}
          loading={loadingReplies}
          count={localReplyCount}
          labels={labels}
          onToggle={() => void handleToggleReplies()}
        />
        <CommentRepliesList
          showReplies={showReplies}
          replies={replies}
          depth={props.depth ?? 0}
          maxDepth={props.maxDepth}
          onReply={props.onReply}
          onEdit={props.onEdit}
          onDelete={handleNestedDelete}
          onLike={handleNestedLike}
          onDislike={handleNestedDislike}
          onReport={props.onReport}
          onAddComment={props.onAddComment}
        />
      </div>
    </div>
  );
}

export default CommentItem;
