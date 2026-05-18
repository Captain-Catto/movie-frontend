"use client";

import { useRef } from "react";
import { Copy } from "lucide-react";
import { WatchPartyProvider, useWatchParty } from "@/contexts/WatchPartyContext";
import VideoPlayer from "@/components/ui/VideoPlayer";
import WatchPartyChat from "@/components/watch-party/WatchPartyChat";
import WatchPartyParticipants from "@/components/watch-party/WatchPartyParticipants";
import { useToast } from "@/contexts/ToastContext";

interface PartyInfo {
  id: number;
  contentTitle: string;
  posterUrl: string | null;
  movieId: number | null;
  tvId: number | null;
  season: number | null;
  episode: number | null;
  hostName: string;
  isActive: boolean;
  expiresAt: string;
}

interface Props {
  inviteCode: string;
  partyInfo: PartyInfo;
}

function WatchPartyInner({ inviteCode }: { inviteCode: string }) {
  const {
    room,
    isHost,
    isConnected,
    hostDisconnected,
    gracePeriodSeconds,
    playerRef,
    emitPlay,
    emitPause,
    emitSeek,
  } = useWatchParty();

  const { showToast } = useToast();

  const copyInviteLink = () => {
    const url = `${window.location.origin}/watch-party/${inviteCode}`;
    void navigator.clipboard.writeText(url).then(() => {
      showToast({ title: "Đã sao chép link mời!", type: "success" });
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3">
          <span className="text-red-500 font-bold text-lg">🎬 Xem chung</span>
          {room && (
            <span className="text-gray-300 text-sm truncate max-w-[300px]">
              {room.contentTitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-500"}`}
          />
          <span className="text-xs text-gray-400">
            {isConnected ? "Đã kết nối" : "Đang kết nối..."}
          </span>
          <button
            onClick={copyInviteLink}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
          >
            <Copy size={14} />
            Mời bạn bè
          </button>
        </div>
      </div>

      {/* Host disconnected banner */}
      {hostDisconnected && (
        <div className="bg-yellow-900 border-b border-yellow-700 px-4 py-2 text-yellow-200 text-sm text-center">
          Host đã mất kết nối. Phòng sẽ kết thúc sau {Math.ceil(gracePeriodSeconds / 60)} phút nếu
          host không quay lại.
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="flex-1 flex flex-col p-4 min-w-0">
          {!isHost && (
            <div className="mb-2 text-xs text-gray-400 text-center">
              Video được điều khiển bởi host
            </div>
          )}

          {room ? (
            <VideoPlayer
              ref={playerRef}
              src={room.streamUrl}
              title={room.contentTitle}
              poster={room.posterUrl ?? undefined}
              disableControls={!isHost}
              onPlay={isHost ? emitPlay : undefined}
              onPause={isHost ? emitPause : undefined}
              onSeek={isHost ? emitSeek : undefined}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-900 rounded-lg aspect-video">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
            </div>
          )}
        </div>

        {/* Sidebar: participants + chat */}
        <div className="w-80 flex flex-col border-l border-gray-800 bg-gray-900">
          <WatchPartyParticipants />
          <WatchPartyChat />
        </div>
      </div>
    </div>
  );
}

export default function WatchPartyPageClient({ inviteCode, partyInfo }: Props) {
  return (
    <WatchPartyProvider inviteCode={inviteCode}>
      <WatchPartyInner inviteCode={inviteCode} />
    </WatchPartyProvider>
  );
}
