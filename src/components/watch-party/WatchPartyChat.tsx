"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useWatchParty } from "@/contexts/WatchPartyContext";

export default function WatchPartyChat() {
  const { chat, sendChat } = useWatchParty();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleSend = () => {
    const msg = input.trim();
    if (!msg) return;
    sendChat(msg);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 border-t border-gray-800">
      <div className="px-3 py-2 text-xs text-gray-400 font-semibold uppercase tracking-wide border-b border-gray-800">
        Chat
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
        {chat.length === 0 && (
          <p className="text-gray-600 text-xs text-center mt-4">
            Chưa có tin nhắn nào
          </p>
        )}
        {chat.map((msg, i) => (
          <div key={i} className="text-sm">
            <span className="text-red-400 font-medium mr-1">{msg.userName}:</span>
            <span className="text-gray-200 break-words">{msg.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 p-2 border-t border-gray-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, 200))}
          onKeyDown={handleKeyDown}
          placeholder="Nhắn tin..."
          className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-red-500 placeholder-gray-500"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg p-2 transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
