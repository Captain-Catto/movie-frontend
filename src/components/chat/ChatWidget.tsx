"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Clock3,
  Loader2,
  MessageCircle,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { chatApi } from "@/services/chat-api";
import type {
  ChatMessage,
  ChatRecommendation,
  ChatSession,
} from "@/types/chat.types";

const imageUrl = (path: string | null | undefined, size = "w185") => {
  if (!path) return "/images/no-poster.svg";
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

const labels = {
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
  },
};

export default function ChatWidget() {
  const { isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const locale = language.toLowerCase().startsWith("vi") ? "vi" : "en";
  const text = labels[locale];
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [initializing, setInitializing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  const lastRecommendations = useMemo(() => {
    const assistantMessages = messages
      .filter((message) => message.role === "assistant")
      .reverse();
    return assistantMessages[0]?.metadata?.recommendations || [];
  }, [messages]);

  useEffect(() => {
    if (!open || !isAuthenticated || session || isLoading) return;

    let cancelled = false;
    setInitializing(true);
    Promise.all([chatApi.createOrGetSession(), chatApi.getSessions().catch(() => [])])
      .then(async ([created, loadedSessions]) => {
        if (cancelled) return;
        setSessions(loadedSessions);
        setSession(created);
        setInitializing(false);
        try {
          const existingMessages = await chatApi.getMessages(created.id);
          if (!cancelled) setMessages(existingMessages);
        } catch {
          if (!cancelled) setMessages([]);
        }
      })
      .catch(() => {
        if (!cancelled) setError(text.error);
      })
      .finally(() => {
        if (!cancelled) setInitializing(false);
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

    setInput("");
    setError("");
    const optimistic: ChatMessage = {
      id: Date.now(),
      sessionId: session.id,
      userId: session.userId,
      role: "user",
      content,
      metadata: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setSending(true);

    try {
      const result = await chatApi.sendMessage(session.id, content, language);
      setMessages((prev) => [
        ...prev.filter((message) => message.id !== optimistic.id),
        result.userMessage,
        result.message,
      ]);
      chatApi.getSessions().then(setSessions).catch(() => undefined);
      if (result.flagged) {
        setError(text.flagged);
      }
    } catch {
      setError(text.error);
      setMessages((prev) => prev.filter((message) => message.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  const loadSession = async (target: ChatSession) => {
    setSession(target);
    setShowHistory(false);
    setError("");
    setInitializing(true);
    try {
      const existingMessages = await chatApi.getMessages(target.id);
      setMessages(existingMessages);
    } catch {
      setMessages([]);
      setError(text.error);
    } finally {
      setInitializing(false);
    }
  };

  const startNewChat = async () => {
    setShowHistory(false);
    setMessages([]);
    setError("");
    setInitializing(true);
    try {
      const created = await chatApi.createOrGetSession(true);
      setSession(created);
      const loadedSessions = await chatApi.getSessions();
      setSessions(loadedSessions);
    } catch {
      setError(text.error);
    } finally {
      setInitializing(false);
    }
  };

  const deleteSession = async (target: ChatSession) => {
    setError("");
    try {
      await chatApi.deleteSession(target.id);
      const remainingSessions = await chatApi.getSessions();
      setSessions(remainingSessions);

      if (session?.id !== target.id) return;

      const nextSession = remainingSessions[0] || (await chatApi.createOrGetSession());
      setSession(nextSession);
      const existingMessages = await chatApi.getMessages(nextSession.id);
      setMessages(existingMessages);
      if (remainingSessions.length === 0) {
        const loadedSessions = await chatApi.getSessions();
        setSessions(loadedSessions);
      }
    } catch {
      setError(text.error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open && (
        <div className="mb-3 flex h-[min(680px,calc(100vh-7rem))] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-600">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{text.title}</div>
                <div className="text-xs text-gray-400">{text.subtitle}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isAuthenticated && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowHistory((value) => !value)}
                    className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                    aria-label="Chat history"
                    title={text.history}
                  >
                    <Clock3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={startNewChat}
                    className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                    aria-label="New chat"
                    title={text.newChat}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isAuthenticated && !isLoading ? (
            <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-gray-300">
              {text.login}
            </div>
          ) : (
            <>
              {showHistory && (
                <div className="border-b border-gray-800 bg-gray-950/40 px-3 py-3">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {text.history}
                  </div>
                  <div className="max-h-40 space-y-2 overflow-y-auto">
                    {sessions.length === 0 ? (
                      <div className="rounded-md bg-gray-800 px-3 py-2 text-xs text-gray-400">
                        {text.noHistory}
                      </div>
                    ) : (
                      sessions.map((item) => (
                        <div
                          key={item.id}
                          className={`group flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
                            session?.id === item.id
                              ? "bg-red-600 text-white"
                              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => loadSession(item)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <div className="line-clamp-1 font-medium">
                              {item.title || text.title}
                            </div>
                            <div className="mt-0.5 text-xs opacity-70">
                              {new Date(item.updatedAt).toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteSession(item);
                            }}
                            className={`rounded p-1 transition ${
                              session?.id === item.id
                                ? "text-white/75 hover:bg-red-700 hover:text-white"
                                : "text-gray-500 opacity-100 hover:bg-gray-600 hover:text-red-300 sm:opacity-0 sm:group-hover:opacity-100"
                            }`}
                            aria-label={text.deleteChat}
                            title={text.deleteChat}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {messages.length === 0 && !initializing && !sending && (
                  <div className="rounded-lg border border-gray-800 bg-gray-800/60 p-3 text-sm text-gray-300">
                    {text.empty}
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={`${message.id}-${message.createdAt}`}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[82%] rounded-lg px-3 py-2 text-sm ${
                        message.role === "user"
                          ? "bg-red-600 text-white"
                          : "bg-gray-800 text-gray-100"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {sending && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {text.title}
                  </div>
                )}

                {lastRecommendations.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {lastRecommendations.map((item) => (
                      <RecommendationCard key={`${item.type}-${item.tmdbId}`} item={item} />
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="border-t border-gray-800 px-4 py-2 text-xs text-amber-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex gap-2 border-t border-gray-800 p-3">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  maxLength={2000}
                  placeholder={text.placeholder}
                  disabled={initializing && !session}
                  className="min-w-0 flex-1 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending || !session}
                  className="flex h-10 w-10 items-center justify-center rounded-md bg-red-600 text-white disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-xl transition hover:bg-red-700"
        aria-label="Open movie assistant"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </div>
  );
}

function RecommendationCard({ item }: { item: ChatRecommendation }) {
  return (
    <Link
      href={item.href}
      className="flex gap-3 rounded-lg border border-gray-800 bg-gray-800/70 p-2 transition hover:border-red-500/60"
    >
      <Image
        src={imageUrl(item.posterPath)}
        alt={item.title}
        width={46}
        height={68}
        className="h-[68px] w-[46px] rounded object-cover"
      />
      <div className="min-w-0">
        <div className="line-clamp-1 text-sm font-semibold text-white">
          {item.title}
        </div>
        <div className="mt-1 text-xs text-gray-400">
          {item.type === "tv" ? "TV" : "Movie"} · {Number(item.voteAverage || 0).toFixed(1)}
        </div>
        {item.overview && (
          <div className="mt-1 line-clamp-2 text-xs text-gray-500">
            {item.overview}
          </div>
        )}
      </div>
    </Link>
  );
}
