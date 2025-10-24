// CommentForm Component
// Form for creating and editing comments with reference layout

"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { CommentFormProps, CreateCommentDto } from "@/types/comment.types";
import { useContentFilter } from "@/hooks/use-comments";
import { useAppSelector } from "@/store/hooks";
import { commentService } from "@/services/comment.service";

export function CommentForm({
  movieId,
  tvSeriesId,
  parentId,
  editingComment,
  onSubmit,
  onCancel,
  placeholder = "Viết bình luận",
  className = "",
}: CommentFormProps) {
  const [content, setContent] = useState(editingComment?.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mention autocomplete state
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionUsers, setMentionUsers] = useState<Array<{ id: number; name: string; image?: string }>>([]);
  const [mentionCursorPos, setMentionCursorPos] = useState(0);
  const [loadingMentions, setLoadingMentions] = useState(false);

  const { checkContent, checking } = useContentFilter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Focus on mount
  useEffect(() => {
    if (textareaRef.current && parentId) {
      textareaRef.current.focus();
    }
  }, [parentId]);

  // Reset form when editing comment changes
  useEffect(() => {
    setContent(editingComment?.content || "");
    setContentError(null);
  }, [editingComment]);

  // Handle mention search
  const searchMentions = async (query: string) => {
    if (query.length < 2) {
      setMentionUsers([]);
      return;
    }

    setLoadingMentions(true);
    try {
      const users = await commentService.searchUsers(query, 10);
      setMentionUsers(users);
    } catch (error) {
      console.error("Failed to search users:", error);
      setMentionUsers([]);
    } finally {
      setLoadingMentions(false);
    }
  };

  // Handle content change with mention detection
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const cursorPos = e.target.selectionStart;

    setContent(newContent);

    // Check if we're typing a mention
    const textBeforeCursor = newContent.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      setMentionCursorPos(cursorPos);
      setShowMentionDropdown(true);
      searchMentions(query);
    } else {
      setShowMentionDropdown(false);
      setMentionQuery("");
      setMentionUsers([]);
    }
  };

  // Insert mention into content
  const insertMention = (userName: string) => {
    const beforeMention = content.substring(0, mentionCursorPos - mentionQuery.length - 1);
    const afterMention = content.substring(mentionCursorPos);
    const newContent = `${beforeMention}@${userName} ${afterMention}`;

    setContent(newContent);
    setShowMentionDropdown(false);
    setMentionQuery("");
    setMentionUsers([]);

    // Focus back to textarea
    if (textareaRef.current) {
      const newCursorPos = beforeMention.length + userName.length + 2;
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setContentError("Bạn cần đăng nhập để bình luận");
      return;
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setContentError("Nội dung không được để trống");
      return;
    }

    if (trimmedContent.length > 1000) {
      setContentError("Nội dung quá dài (tối đa 1000 ký tự)");
      return;
    }

    try {
      setIsSubmitting(true);
      setContentError(null);

      // Check content filter
      const filterResult = await checkContent(trimmedContent);
      if (!filterResult.isAllowed) {
        setContentError(
          filterResult.reason || "Nội dung không phù hợp"
        );
        return;
      }

      // Prepare comment data
      const commentData: CreateCommentDto = {
        content: trimmedContent,
        movieId,
        tvId: tvSeriesId,
        parentId,
      };

      // Call parent submit handler
      if (onSubmit) {
        await onSubmit(commentData);
      }

      // Reset form
      setContent("");
      setContentError(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Không thể gửi bình luận";
      setContentError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent(editingComment?.content || "");
    setContentError(null);
    if (onCancel) {
      onCancel();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="my-area bg-gray-800 rounded-lg p-4">
        <div className="text-center text-gray-400">
          Vui lòng đăng nhập để bình luận
        </div>
      </div>
    );
  }

  return (
    <div className={`my-area ${className}`}>
      {/* User Info */}
      <div className="ma-user flex items-center gap-3 mb-3">
        <div className="user-avatar">
          <Image
            src={user?.image || "/images/avatars/pack5/02.jpg"}
            alt={user?.name || "User"}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>
        <div className="info">
          <small className="text-gray-400 text-xs block">Bình luận với tên</small>
          <span className="text-white text-sm font-medium">{user?.name || "User"}</span>
        </div>
      </div>

      {/* Textarea */}
      <div className="textarea-wrap">
        <div className="ma-input relative">
          <textarea
            ref={textareaRef}
            className="form-control v-form-control v-form-textarea w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:border-red-500 resize-none"
            rows={4}
            cols={3}
            maxLength={1000}
            placeholder={placeholder}
            value={content}
            onChange={handleContentChange}
            disabled={isSubmitting || checking}
          />
          <div className="chac-left absolute bottom-2 right-2 text-xs text-gray-400">
            {content.length} / 1000
          </div>

          {/* Mention Dropdown */}
          {showMentionDropdown && (
            <div className="mention-dropdown absolute left-0 right-0 bg-gray-800 border border-gray-600 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto z-50">
              {loadingMentions ? (
                <div className="p-3 text-center text-gray-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                  Đang tìm...
                </div>
              ) : mentionUsers.length > 0 ? (
                <ul className="py-1">
                  {mentionUsers.map((user) => (
                    <li
                      key={user.id}
                      className="px-3 py-2 hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                      onClick={() => insertMention(user.name)}
                    >
                      <Image
                        src={user.image || "/images/avatars/pack2/03.jpg"}
                        alt={user.name}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-white text-sm">{user.name}</span>
                    </li>
                  ))}
                </ul>
              ) : mentionQuery.length >= 2 ? (
                <div className="p-3 text-center text-gray-400 text-sm">
                  Không tìm thấy người dùng
                </div>
              ) : (
                <div className="p-3 text-center text-gray-400 text-sm">
                  Nhập ít nhất 2 ký tự để tìm kiếm
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {contentError && (
          <div className="text-red-500 text-sm mt-2">{contentError}</div>
        )}

        {/* Action Buttons */}
        <div className="line-center d-flex gap-3 ma-buttons mt-3 flex items-center justify-end">
          {onCancel && (
            <button
              className="btn btn-basic text-gray-400 hover:text-white px-4 py-2"
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting || checking}
            >
              <span>Hủy</span>
            </button>
          )}

          <button
            className="btn btn-basic btn-submit bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              checking ||
              !content.trim() ||
              content.length > 1000
            }
          >
            {isSubmitting || checking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{editingComment ? "Cập nhật" : "Gửi"}</span>
                <div className="inc-icon icon-20">
                  <svg
                    fill="none"
                    height="512"
                    viewBox="0 0 24 24"
                    width="512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                  >
                    <path
                      d="m22.1012 10.5616-19.34831-9.43824c-.1664-.08117-.34912-.12336-.53427-.12336-.67302 0-1.21862.5456-1.21862 1.21862v.03517c0 .16352.02005.32643.05971.48507l1.85597 7.42384c.05069.2028.22214.3526.42986.3757l8.15756.9064c.2829.0314.4969.2705.4969.5552s-.214.5238-.4969.5552l-8.15756.9064c-.20772.0231-.37917.1729-.42986.3757l-1.85597 7.4238c-.03966.1587-.05971.3216-.05971.4851v.0352c0 .673.5456 1.2186 1.21862 1.2186.18515 0 .36787-.0422.53427-.1234l19.34831-9.4382c.5499-.2682.8988-.8265.8988-1.4384s-.3489-1.1702-.8988-1.4384z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentForm;
