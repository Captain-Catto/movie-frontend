// CommentSection Component - Reference layout
// Main component that manages the entire comment system for a movie/TV show

"use client";

import React, { useState } from "react";
import {
  CommentSectionProps,
  CommentSortOption,
  CreateCommentDto,
} from "@/types/comment.types";
import { useComments } from "@/hooks/use-comments";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

export function CommentSection({
  movieId,
  tvSeriesId,
  className = "",
}: CommentSectionProps) {
  const [sortBy] = useState<CommentSortOption>("newest");

  const {
    comments,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    addComment,
    deleteComment,
    likeComment,
    dislikeComment,
    reportComment,
  } = useComments({
    movieId,
    tvSeriesId,
    sortBy,
    limit: 20,
    autoRefresh: false,
  });

  // Handle new comment submission
  const handleCommentSubmit = async (commentData: CreateCommentDto) => {
    try {
      const newComment = await addComment(commentData);
      return newComment;
    } catch (error) {
      console.error("Failed to submit comment:", error);
      throw error;
    }
  };

  // Handle reply action
  const handleReply = async () => {
    refresh();
  };

  // Handle edit action
  const handleEdit = (commentId: number) => {
    console.log("Edit comment:", commentId);
  };

  // Handle delete action - use hook's deleteComment
  const handleDelete = async (commentId: number) => {
    await deleteComment(commentId);
  };

  // Handle like action - use hook's likeComment
  const handleLike = async (commentId: number) => {
    await likeComment(commentId);
  };

  // Handle dislike action - use hook's dislikeComment
  const handleDislike = async (commentId: number) => {
    await dislikeComment(commentId);
  };

  // Handle report action
  const handleReport = async (commentId: number) => {
    try {
      await reportComment(commentId, {
        reason: "inappropriate",
        description: "Reported via comment section",
      });
    } catch (error) {
      console.error("Failed to report comment:", error);
    }
  };

  return (
    <div className={`child-content ${className}`}>
      <div className="discuss-wrap bg-gray-800 rounded-lg p-6">
        {/* Comment Form */}
        <div data-main-comment-form>
          <CommentForm
            movieId={movieId}
            tvSeriesId={tvSeriesId}
            placeholder="Write a comment"
            onSubmit={handleCommentSubmit}
            className="mb-6"
          />
        </div>

        {/* Comments List */}
        <div className="discuss-list space-y-4">
          {loading && (!comments || comments.length === 0) ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              <p className="text-gray-400 mt-3">Loading comments...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : comments && comments.length > 0 ? (
            <>
              {comments.map((comment, index) => (
                <CommentItem
                  key={comment.id || `comment-${index}`}
                  comment={comment}
                  depth={0}
                  maxDepth={3}
                  onReply={handleReply}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  onReport={handleReport}
                  onAddComment={addComment}
                />
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="d-item py-3 more">
                  <a
                    className="primary-text text-red-500 cursor-pointer hover:text-red-400 block text-center"
                    onClick={loadMore}
                  >
                    {loading ? "Loading..." : "Load more comments..."}
                  </a>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-2">No comments yet</p>
              <p className="text-gray-500 text-sm">
                Be the first to share your thoughts!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommentSection;
