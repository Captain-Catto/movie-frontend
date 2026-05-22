"use client";

import React from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { CommentFormProps } from "@/types/comment.types";
import { useCommentForm } from "@/hooks/components/useCommentForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCommentsUiMessages } from "@/lib/ui-messages";

export function CommentForm(props: CommentFormProps) {
  const { language } = useLanguage();
  const labels = getCommentsUiMessages(language);

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
        <div className="text-center text-gray-400">
          {labels.pleaseLoginToComment}
        </div>
      </div>
    );
  }

  return (
    <div className={`my-area ${props.className || ""}`}>
      <div className="ma-user flex items-center gap-3 mb-3">
        <div className="user-avatar">
          <Image
            src={avatarSrc}
            alt={user?.name || labels.defaultUser}
            width={40}
            height={40}
            className="size-10 rounded-full object-cover"
            onError={handleAvatarError}
          />
        </div>
        <div className="info">
          <small className="text-gray-400 text-xs block">
            {labels.commentingAs}
          </small>
          <span className="text-white text-sm font-medium">
            {user?.name || labels.defaultUser}
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
            aria-label={props.placeholder || labels.writeComment}
            placeholder={
              props.placeholder || labels.writeComment
            }
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
                  <Loader2 className="size-4 animate-spin inline-block mr-2" />
                  {labels.searching}
                </div>
              ) : mentionUsers.length > 0 ? (
                <ul className="py-1">
                  {mentionUsers.map((mentionUser) => (
                    <li key={mentionUser.id}>
                      <button
                        type="button"
                        className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left hover:bg-gray-700"
                        onClick={() => insertMention(mentionUser.name)}
                      >
                        <Image
                          src={mentionUser.image || "/images/no-avatar.svg"}
                          alt={mentionUser.name}
                          width={24}
                          height={24}
                          className="size-6 rounded-full object-cover"
                          onError={handleAvatarError}
                        />
                        <span className="text-white text-sm">{mentionUser.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : mentionQuery.length >= 2 ? (
                <div className="p-3 text-center text-gray-400 text-sm">
                  {labels.noUsersFound}
                </div>
              ) : (
                <div className="p-3 text-center text-gray-400 text-sm">
                  {labels.enterAtLeast2CharsToSearch}
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
              <span>{labels.cancel}</span>
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
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <span>
                  {props.editingComment
                    ? labels.update
                    : labels.send}
                </span>
                <div className="inc-icon icon-20">
                  <svg
                    fill="none"
                    height="512"
                    viewBox="0 0 24 24"
                    width="512"
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-4"
                  >
                    <path
                      d="m22.1 10.6-19.3-9.4c-.2-.1-.4-.1-.5-.1-.7 0-1.2.5-1.2 1.2v0c0 .2 0 .3.1.5l1.9 7.4c0 .2.2.4.4.4l8.2.9c.3 0 .5.3.5.6s-.2.5-.5.6l-8.2.9c-.2 0-.4.2-.4.4l-1.9 7.4c0 .2-.1.3-.1.5v0c0 .7.5 1.2 1.2 1.2.2 0 .4 0 .5-.1l19.3-9.4c.6-.3.9-.8.9-1.4s-.3-1.2-.9-1.4z"
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
