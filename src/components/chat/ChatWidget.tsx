"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUp,
  Bot,
  Clock3,
  Loader2,
  MessageCircle,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useChatWidget } from "@/hooks/useChatWidget";
import type { ChatRecommendation } from "@/types/chat.types";

const imageUrl = (path: string | null | undefined, size = "w185") => {
  if (!path) return "/images/no-poster.svg";
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export default function ChatWidget() {
  const {
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
    panelPos,
    dispatchUI,
    handleSubmit,
    loadSession,
    startNewChat,
    deleteSession,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleToggle,
    handleScrollToTop,
  } = useChatWidget();

  const panel = open && (
    <div
      className="absolute flex h-[min(420px,calc(100svh-8rem))] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-2xl sm:h-[min(680px,calc(100svh-7rem))]"
      style={panelPos}
    >
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-red-600">
            <Bot className="size-5 text-white" />
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
                onClick={() => dispatchUI({ showHistory: !showHistory })}
                className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                aria-label="Chat history"
                title={text.history}
              >
                <Clock3 className="size-4" />
              </button>
              <button
                type="button"
                onClick={startNewChat}
                className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                aria-label="New chat"
                title={text.newChat}
              >
                <Plus className="size-4" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => dispatchUI({ open: false })}
            className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
            aria-label="Close chat"
          >
            <X className="size-4" />
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
            <div className="border-b border-gray-800 bg-gray-950/40 p-3">
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
                        <div className="mt-0.5 text-xs opacity-70" suppressHydrationWarning>
                          {new Date(item.updatedAt).toLocaleString(
                            locale === "vi" ? "vi-VN" : "en-US"
                          )}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          dispatchUI({ confirmTarget: item });
                        }}
                        className={`rounded p-1 transition ${
                          session?.id === item.id
                            ? "text-white/75 hover:bg-red-700 hover:text-white"
                            : "text-gray-500 opacity-100 hover:bg-gray-600 hover:text-red-300 sm:opacity-0 sm:group-hover:opacity-100"
                        }`}
                        aria-label={text.deleteChat}
                        title={text.deleteChat}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
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
                    message.role === "user" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-100"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="size-4 animate-spin" />
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
              aria-label="Message movie assistant"
              value={input}
              onChange={(event) => dispatchUI({ input: event.target.value })}
              maxLength={2000}
              placeholder={text.placeholder}
              disabled={initializing && !session}
              className="min-w-0 flex-1 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending || !session}
              className="flex size-10 items-center justify-center rounded-md bg-red-600 text-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="size-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );

  return (
    <>
      {confirmTarget && (
        <dialog
          open
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onCancel={() => dispatchUI({ confirmTarget: null })}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-lg border border-gray-700 bg-gray-900 p-5 shadow-2xl"
            aria-labelledby="chat-confirm-title"
          >
            <h3 id="chat-confirm-title" className="text-base font-semibold text-white">
              {text.confirmTitle}
            </h3>
            <p className="mt-2 text-sm text-gray-400">{text.confirmMessage}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => dispatchUI({ confirmTarget: null })}
                className="rounded-md px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
              >
                {text.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSession(confirmTarget);
                  dispatchUI({ confirmTarget: null });
                }}
                className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                {text.confirm}
              </button>
            </div>
          </div>
        </dialog>
      )}

      <div
        ref={containerRef}
        className="fixed z-[110]"
        style={pos ? { left: pos.x, top: pos.y } : { bottom: "6rem", right: "1rem" }}
      >
        {panel}

        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={handleToggle}
          style={{ touchAction: "none" }}
          className="flex size-12 cursor-grab items-center justify-center rounded-full bg-red-600 text-white shadow-xl transition hover:bg-red-700 active:cursor-grabbing"
          aria-label="Open movie assistant"
        >
          {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
        </button>

        <button
          type="button"
          onClick={handleScrollToTop}
          className="absolute right-0 top-14 flex size-11 items-center justify-center rounded-full border border-white/10 bg-red-600 text-white shadow-xl transition hover:bg-red-700"
          aria-label="Back to top"
          title="Back to top"
        >
          <ArrowUp className="size-5" />
        </button>
      </div>
    </>
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
        <div className="line-clamp-1 text-sm font-semibold text-white">{item.title}</div>
        <div className="mt-1 text-xs text-gray-400">
          {item.type === "tv" ? "TV" : "Movie"} · {Number(item.voteAverage || 0).toFixed(1)}
        </div>
        {item.overview && (
          <div className="mt-1 line-clamp-2 text-xs text-gray-500">{item.overview}</div>
        )}
      </div>
    </Link>
  );
}
