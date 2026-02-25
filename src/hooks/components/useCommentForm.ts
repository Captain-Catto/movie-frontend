"use client";

import { useEffect, useRef, useState } from "react";
import type { CommentFormProps, CreateCommentDto } from "@/types/comment.types";
import { useContentFilter } from "@/hooks/use-comments";
import { useAppSelector } from "@/store/hooks";
import { commentService } from "@/services/comment.service";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCommentsUiMessages } from "@/lib/ui-messages";

const NO_AVATAR = "/images/no-avatar.svg";

interface MentionUser {
  id: number;
  name: string;
  image?: string;
}

export interface UseCommentFormResult {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  content: string;
  isSubmitting: boolean;
  contentError: string | null;
  showMentionDropdown: boolean;
  mentionQuery: string;
  mentionUsers: MentionUser[];
  loadingMentions: boolean;
  checking: boolean;
  user: {
    id: number;
    name: string;
    image?: string;
    role?: string;
  } | null;
  isAuthenticated: boolean;
  avatarSrc: string;
  handleAvatarError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  handleContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  insertMention: (userName: string) => void;
  handleSubmit: (e: React.FormEvent | React.MouseEvent) => Promise<void>;
  handleCancel: () => void;
}

export function useCommentForm({
  movieId,
  tvSeriesId,
  parentId,
  editingComment,
  onSubmit,
  onCancel,
}: CommentFormProps): UseCommentFormResult {
  const { language } = useLanguage();
  const labels = getCommentsUiMessages(language);
  const [content, setContent] = useState(editingComment?.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
  const [mentionCursorPos, setMentionCursorPos] = useState(0);
  const [loadingMentions, setLoadingMentions] = useState(false);

  const { checkContent, checking } = useContentFilter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const avatarSrc = user?.image || NO_AVATAR;

  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = NO_AVATAR;
  };

  useEffect(() => {
    if (textareaRef.current && parentId) {
      textareaRef.current.focus();
    }
  }, [parentId]);

  useEffect(() => {
    setContent(editingComment?.content || "");
    setContentError(null);
  }, [editingComment]);

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

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const cursorPos = e.target.selectionStart;

    setContent(newContent);

    const textBeforeCursor = newContent.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      setMentionCursorPos(cursorPos);
      setShowMentionDropdown(true);
      void searchMentions(query);
    } else {
      setShowMentionDropdown(false);
      setMentionQuery("");
      setMentionUsers([]);
    }
  };

  const insertMention = (userName: string) => {
    const beforeMention = content.substring(
      0,
      mentionCursorPos - mentionQuery.length - 1
    );
    const afterMention = content.substring(mentionCursorPos);
    const newContent = `${beforeMention}@${userName} ${afterMention}`;

    setContent(newContent);
    setShowMentionDropdown(false);
    setMentionQuery("");
    setMentionUsers([]);

    if (textareaRef.current) {
      const newCursorPos = beforeMention.length + userName.length + 2;
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setContentError(labels.needLoginToComment);
      return;
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setContentError(labels.contentCannotBeEmpty);
      return;
    }

    if (trimmedContent.length > 1000) {
      setContentError(labels.contentTooLongMax1000);
      return;
    }

    try {
      setIsSubmitting(true);
      setContentError(null);

      const filterResult = await checkContent(trimmedContent);
      if (!filterResult.isAllowed) {
        setContentError(filterResult.reason || labels.inappropriateContent);
        return;
      }

      const commentData: CreateCommentDto = {
        content: trimmedContent,
        movieId,
        tvId: tvSeriesId,
        parentId,
      };

      if (onSubmit) {
        await onSubmit(commentData);
      }

      setContent("");
      setContentError(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : labels.unableToSendComment;
      setContentError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent(editingComment?.content || "");
    setContentError(null);
    onCancel?.();
  };

  return {
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
  };
}
