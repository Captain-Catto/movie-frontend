"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";

interface ChatFlag {
  id: number;
  userId: number;
  sessionId: number;
  messageId: number | null;
  reason: string;
  severity: "low" | "medium" | "high";
  status: "open" | "resolved" | "ignored";
  createdAt: string;
  user?: {
    email?: string;
    name?: string;
  };
  message?: {
    content?: string;
  };
}

interface ChatSessionDetail {
  session: {
    id: number;
    title: string | null;
    user?: { email?: string; name?: string };
  };
  messages: Array<{
    id: number;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt: string;
  }>;
  flags: ChatFlag[];
}

export default function AdminChatPage() {
  const adminApi = useAdminApi();
  const [flags, setFlags] = useState<ChatFlag[]>([]);
  const [selectedSession, setSelectedSession] =
    useState<ChatSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFlags = useCallback(async () => {
    setLoading(true);
    const response = await adminApi.get<ChatFlag[]>("/admin/chat/flags?status=open");
    if (response.success && response.data) {
      setFlags(response.data);
      setError("");
    } else {
      setError(response.error || "Failed to load chat flags");
    }
    setLoading(false);
  }, [adminApi]);

  useEffect(() => {
    void loadFlags();
  }, [loadFlags]);

  const openSession = async (sessionId: number) => {
    const response = await adminApi.get<ChatSessionDetail>(
      `/admin/chat/sessions/${sessionId}`
    );
    if (response.success && response.data) {
      setSelectedSession(response.data);
    }
  };

  const resolveFlag = async (flagId: number, status: "resolved" | "ignored") => {
    const response = await adminApi.post(`/admin/chat/flags/${flagId}/resolve`, {
      status,
    });
    if (response.success) {
      await loadFlags();
      if (selectedSession) {
        await openSession(selectedSession.session.id);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">AI Chat Moderation</h1>
        <p className="text-sm text-gray-400">
          Review flagged chatbot conversations before taking account actions.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="rounded-lg border border-gray-800 bg-gray-900">
          <div className="border-b border-gray-800 px-4 py-3">
            <h2 className="font-semibold text-white">Open Flags</h2>
          </div>
          <div className="max-h-[720px] overflow-y-auto p-3">
            {loading ? (
              <div className="p-4 text-sm text-gray-400">Loading…</div>
            ) : flags.length === 0 ? (
              <div className="p-4 text-sm text-gray-400">No open flags.</div>
            ) : (
              <div className="space-y-3">
                {flags.map((flag) => (
                  <button
                    key={flag.id}
                    onClick={() => openSession(flag.sessionId)}
                    className="w-full rounded-lg border border-gray-800 bg-gray-800/70 p-3 text-left transition hover:border-red-500/60"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-white">
                        {flag.user?.name || flag.user?.email || `User #${flag.userId}`}
                      </div>
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          flag.severity === "high"
                            ? "bg-red-500/20 text-red-200"
                            : flag.severity === "medium"
                            ? "bg-amber-500/20 text-amber-200"
                            : "bg-blue-500/20 text-blue-200"
                        }`}
                      >
                        {flag.severity}
                      </span>
                    </div>
                    <div className="mt-2 line-clamp-2 text-sm text-gray-300">
                      {flag.reason}
                    </div>
                    {flag.message?.content && (
                      <div className="mt-2 line-clamp-2 text-xs text-gray-500">
                        {flag.message.content}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-gray-800 bg-gray-900">
          <div className="border-b border-gray-800 px-4 py-3">
            <h2 className="font-semibold text-white">Conversation Context</h2>
          </div>
          {!selectedSession ? (
            <div className="p-6 text-sm text-gray-400">
              Select a flag to inspect the related chat session.
            </div>
          ) : (
            <div className="p-4">
              <div className="mb-4 rounded-lg bg-gray-800 p-3 text-sm text-gray-300">
                Session #{selectedSession.session.id} ·{" "}
                {selectedSession.session.user?.email || "unknown user"}
              </div>
              <div className="mb-4 max-h-[520px] space-y-3 overflow-y-auto">
                {selectedSession.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`rounded-lg p-3 text-sm ${
                      message.role === "user"
                        ? "bg-red-600/20 text-red-50"
                        : "bg-gray-800 text-gray-100"
                    }`}
                  >
                    <div className="mb-1 text-xs uppercase text-gray-400">
                      {message.role}
                    </div>
                    {message.content}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSession.flags.flatMap((flag) =>
                  flag.status === "open"
                    ? [
                        <div key={flag.id} className="flex gap-2">
                          <button
                            onClick={() => resolveFlag(flag.id, "resolved")}
                            className="rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                          >
                            Resolve flag #{flag.id}
                          </button>
                          <button
                            onClick={() => resolveFlag(flag.id, "ignored")}
                            className="rounded bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-700"
                          >
                            Ignore
                          </button>
                        </div>,
                      ]
                    : []
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
