"use client";

import { Users } from "lucide-react";
import { useWatchParty } from "@/contexts/WatchPartyContext";

export default function WatchPartyParticipants() {
  const { participants } = useWatchParty();

  return (
    <div className="px-3 py-2 border-b border-gray-800">
      <div className="flex items-center gap-2 mb-2">
        <Users size={14} className="text-gray-400" />
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
          Người xem ({participants.length})
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {participants.map((p, i) => (
          <div key={p.socketId || i} className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white font-medium flex-shrink-0">
              {p.userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-300 max-w-[80px] truncate">{p.userName}</span>
            {p.isHost && (
              <span className="text-[10px] bg-red-700 text-white px-1 rounded">Host</span>
            )}
            {p.userId === null && (
              <span className="text-[10px] bg-gray-700 text-gray-400 px-1 rounded">Khách</span>
            )}
          </div>
        ))}
        {participants.length === 0 && (
          <span className="text-xs text-gray-600">Đang kết nối...</span>
        )}
      </div>
    </div>
  );
}
