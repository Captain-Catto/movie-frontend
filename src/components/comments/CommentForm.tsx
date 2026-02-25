"use client";

import React from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { CommentFormProps } from "@/types/comment.types";
import { useCommentForm } from "@/hooks/components/useCommentForm";

export function CommentForm(props: CommentFormProps) {
  const {
    textareaRef,
    content,
    isSubmitting,
    contentError,
    showMentionDropdown,
    mentionQuery,
    mentionUsers,
    loadingMentions,
    checking,
    user,
    isAuthenticated,
    avatarSrc,
    handleAvatarError,
    handleContentChange,
    insertMention,
    handleSubmit,
    handleCancel,
  } = useCommentForm(props);

  if (!isAuthenticated) {
    return (
      <div className="my-area bg-gray-800 rounded-lg p-4">
        <div className="text-center text-gray-400">Please login to comment</div>
      </div>
    );
  }

  return (
    <div className={`my-area ${props.className || ""}`}>
      <div className="ma-user flex items-center gap-3 mb-3">
        <div className="user-avatar">
          <Image
            src={avatarSrc}
            alt={user?.name || "User"}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
            onError={handleAvatarError}
          />
        </div>
        <div className="info">
          <small className="text-gray-400 text-xs block">Commenting as</small>
          <span className="text-white text-sm font-medium">
            {user?.name || "User"}
          </span>
        </div>
      </div>

      <div className="textarea-wrap">
        <div className="ma-input relative">
          <textarea
            ref={textareaRef}
            className="form-control v-form-control v-form-textarea w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:border-red-500 resize-none"
            rows={4}
            cols={3}
            maxLength={1000}
            placeholder={props.placeholder || "Write a comment"}
            value={content}
            onChange={handleContentChange}
            disabled={isSubmitting || checking}
          />
          <div className="chac-left absolute bottom-2 right-2 text-xs text-gray-400">
            {content.length} / 1000
          </div>

          {showMentionDropdown && (
            <div className="mention-dropdown absolute left-0 right-0 bg-gray-800 border border-gray-600 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto z-50">
              {loadingMentions ? (
                <div className="p-3 text-center text-gray-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                  Searching...
                </div>
              ) : mentionUsers.length > 0 ? (
                <ul className="py-1">
                  {mentionUsers.map((mentionUser) => (
                    <li
                      key={mentionUser.id}
                      className="px-3 py-2 hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                      onClick={() => insertMention(mentionUser.name)}
                    >
                      <Image
                        src={mentionUser.image || "/images/no-avatar.svg"}
                        alt={mentionUser.name}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full object-cover"
                        onError={handleAvatarError}
                      />
                      <span className="text-white text-sm">{mentionUser.name}</span>
                    </li>
                  ))}
                </ul>
              ) : mentionQuery.length >= 2 ? (
                <div className="p-3 text-center text-gray-400 text-sm">
                  No users found
                </div>
              ) : (
                <div className="p-3 text-center text-gray-400 text-sm">
                  Enter at least 2 characters to search
                </div>
              )}
            </div>
          )}
        </div>

        {contentError && <div className="text-red-500 text-sm mt-2">{contentError}</div>}

        <div className="line-center d-flex gap-3 ma-buttons mt-3 flex items-center justify-end">
          {props.onCancel && (
            <button
              className="btn btn-basic text-gray-400 hover:text-white px-4 py-2"
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting || checking}
            >
              <span>Cancel</span>
            </button>
          )}

          <button
            className="btn btn-basic btn-submit bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            onClick={(e) => void handleSubmit(e)}
            disabled={
              isSubmitting || checking || !content.trim() || content.length > 1000
            }
          >
            {isSubmitting || checking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{props.editingComment ? "Update" : "Send"}</span>
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
