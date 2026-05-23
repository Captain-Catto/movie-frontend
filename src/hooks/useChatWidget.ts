import { FormEvent, useEffect, useMemo, useReducer, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { chatApi } from "@/services/chat-api";
import type {
  ChatMessage,
  ChatSession,
} from "@/types/chat.types";

export const labels = {
  vi: {
    title: "Trợ lý gợi ý phim",
    subtitle: "Dựa trên gu xem của bạn",
    login: "Đăng nhập để nhận gợi ý phim cá nhân hóa.",
    placeholder: "Bạn muốn xem gì hôm nay?",
    empty: "Hỏi mình về phim giống phim bạn đã thích, phim chiếu rạp mới, hoặc phim bộ mới.",
    error: "Không gửi được tin nhắn. Vui lòng thử lại.",
    flagged: "Tin nhắn đã được ghi nhận để kiểm tra an toàn.",
    history: "Lịch sử",
    newChat: "Mới",
    noHistory: "Chưa có lịch sử gợi ý.",
    deleteChat: "Xoá cuộc trò chuyện",
    confirmTitle: "Xoá cuộc trò chuyện",
    confirmMessage: "Bạn có chắc chắn muốn xoá cuộc trò chuyện này không?",
    confirm: "Xoá",
    cancel: "Huỷ",
  },
  en: {
    title: "Movie assistant",
    subtitle: "Personalized from your taste",
    login: "Sign in to get personalized recommendations.",
    placeholder: "What do you want to watch today?",
    empty: "Ask for movies similar to your favorites, new theatrical movies, or new TV shows.",
    error: "Could not send message. Please try again.",
    flagged: "This message was flagged for safety review.",
    history: "History",
    newChat: "New",
    noHistory: "No recommendation history yet.",
    deleteChat: "Delete conversation",
    confirmTitle: "Delete conversation",
    confirmMessage: "Are you sure you want to delete this conversation?",
    confirm: "Delete",
    cancel: "Cancel",
  },
};

export function useChatWidget() {
  const { isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const locale = language.toLowerCase().startsWith("vi") ? "vi" : "en";
  const text = labels[locale];

  type UIState = {
    open: boolean;
    showHistory: boolean;
    input: string;
    sending: boolean;
    confirmTarget: ChatSession | null;
    pos: { x: number; y: number } | null;
  };

  const [ui, dispatchUI] = useReducer(
    (s: UIState, a: Partial<UIState>): UIState => ({ ...s, ...a }),
    { open: false, showHistory: false, input: "", sending: false, confirmTarget: null, pos: null }
  );
  const { open, showHistory, input, sending, confirmTarget, pos } = ui;

  type ChatState = {
    session: ChatSession | null;
    sessions: ChatSession[];
    messages: ChatMessage[];
    initializing: boolean;
    error: string;
  };

  const [chatState, dispatchChat] = useReducer(
    (s: ChatState, a: Partial<ChatState>): ChatState => ({ ...s, ...a }),
    { session: null, sessions: [], messages: [], initializing: false, error: "" }
  );
  const { session, sessions, messages, initializing, error } = chatState;

  const listRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ cx: number; cy: number; px: number; py: number } | null>(null);
  const hasDraggedRef = useRef(false);

  // Panel opens below when button is in top half; aligns right when button is on right side
  const panelOpensDown =
    typeof window !== "undefined" && pos !== null && pos.y + 24 < window.innerHeight / 2;
  const buttonOnRightSide =
    typeof window === "undefined" || !pos || pos.x + 24 >= window.innerWidth / 2;

  const lastRecommendations = useMemo(() => {
    const assistantMessages = messages
      .filter((message) => message.role === "assistant")
      .reverse();
    return assistantMessages[0]?.metadata?.recommendations || [];
  }, [messages]);

  useEffect(() => {
    if (!open || !isAuthenticated || session || isLoading) return;

    let cancelled = false;
    dispatchChat({ initializing: true });
    Promise.all([chatApi.createOrGetSession(), chatApi.getSessions().catch(() => [])])
      .then(async ([created, loadedSessions]) => {
        if (cancelled) return;
        dispatchChat({ sessions: loadedSessions, session: created, initializing: false });
        try {
          const existingMessages = await chatApi.getMessages(created.id);
          if (!cancelled) dispatchChat({ messages: existingMessages });
        } catch {
          if (!cancelled) dispatchChat({ messages: [] });
        }
      })
      .catch(() => {
        if (!cancelled) dispatchChat({ error: text.error });
      })
      .finally(() => {
        if (!cancelled) dispatchChat({ initializing: false });
      });

    return () => {
      cancelled = true;
    };
  }, [open, isAuthenticated, session, isLoading, text.error]);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, initializing, sending]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || !session || sending) return;

    dispatchUI({ input: "" });
    dispatchChat({ error: "" });
    const optimistic: ChatMessage = {
      id: Date.now(),
      sessionId: session.id,
      userId: session.userId,
      role: "user",
      content,
      metadata: null,
      createdAt: new Date().toISOString(),
    };
    dispatchChat({ messages: [...messages, optimistic] });
    dispatchUI({ sending: true });

    try {
      const result = await chatApi.sendMessage(session.id, content, language);
      dispatchChat({
        messages: [
          ...messages.filter((m) => m.id !== optimistic.id),
          result.userMessage,
          result.message,
        ],
      });
      chatApi.getSessions().then((s) => dispatchChat({ sessions: s })).catch(() => undefined);
      if (result.flagged) dispatchChat({ error: text.flagged });
    } catch {
      dispatchChat({ error: text.error, messages: messages.filter((m) => m.id !== optimistic.id) });
    } finally {
      dispatchUI({ sending: false });
    }
  };

  const loadSession = async (target: ChatSession) => {
    dispatchUI({ showHistory: false });
    dispatchChat({ session: target, error: "", initializing: true });
    try {
      const existingMessages = await chatApi.getMessages(target.id);
      dispatchChat({ messages: existingMessages, initializing: false });
    } catch {
      dispatchChat({ messages: [], error: text.error, initializing: false });
    }
  };

  const startNewChat = async () => {
    dispatchUI({ showHistory: false });
    dispatchChat({ messages: [], error: "", initializing: true });
    try {
      const created = await chatApi.createOrGetSession(true);
      const loadedSessions = await chatApi.getSessions();
      dispatchChat({ session: created, sessions: loadedSessions, initializing: false });
    } catch {
      dispatchChat({ error: text.error, initializing: false });
    }
  };

  const deleteSession = async (target: ChatSession) => {
    dispatchChat({ error: "" });
    try {
      await chatApi.deleteSession(target.id);
      const remainingSessions = await chatApi.getSessions();
      dispatchChat({ sessions: remainingSessions });

      if (session?.id !== target.id) return;

      const nextSession = remainingSessions[0] || (await chatApi.createOrGetSession());
      const existingMessages = await chatApi.getMessages(nextSession.id);
      const finalSessions =
        remainingSessions.length === 0 ? await chatApi.getSessions() : remainingSessions;
      dispatchChat({ session: nextSession, messages: existingMessages, sessions: finalSessions });
    } catch {
      dispatchChat({ error: text.error });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    hasDraggedRef.current = false;
    const rect = containerRef.current?.getBoundingClientRect();
    dragStartRef.current = {
      cx: e.clientX,
      cy: e.clientY,
      px: rect?.left ?? window.innerWidth - 64,
      py: rect?.top ?? window.innerHeight - 140,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.cx;
    const dy = e.clientY - dragStartRef.current.cy;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasDraggedRef.current = true;
    }
    const newX = Math.max(0, Math.min(window.innerWidth - 48, dragStartRef.current.px + dx));
    const newY = Math.max(68, Math.min(window.innerHeight - 104, dragStartRef.current.py + dy));
    dispatchUI({ pos: { x: newX, y: newY } });
  };

  const handlePointerUp = () => {
    dragStartRef.current = null;
  };

  const handleToggle = () => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }
    dispatchUI({ open: !open });
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const panelPos = {
    ...(panelOpensDown ? { top: "3.75rem" } : { bottom: "3.75rem" }),
    ...(buttonOnRightSide ? { right: 0 } : { left: 0 }),
  };

  return {
    isAuthenticated,
    isLoading,
    locale,
    text,
    open,
    showHistory,
    input,
    sending,
    confirmTarget,
    pos,
    session,
    sessions,
    messages,
    initializing,
    error,
    listRef,
    containerRef,
    lastRecommendations,
    panelOpensDown,
    buttonOnRightSide,
    panelPos,
    dispatchUI,
    dispatchChat,
    handleSubmit,
    loadSession,
    startNewChat,
    deleteSession,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleToggle,
    handleScrollToTop,
  };
}
