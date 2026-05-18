"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import type { VideoPlayerRef } from "@/components/ui/VideoPlayer";

export interface ParticipantInfo {
  socketId: string;
  userId: number | null;
  userName: string;
  isHost: boolean;
}

export interface ChatMessage {
  userId: number | null;
  userName: string;
  message: string;
  timestamp: number;
}

export interface WatchPartySnapshot {
  currentTime: number;
  isPlaying: boolean;
  serverTime: number;
}

export interface WatchPartyRoom {
  partyId: number;
  inviteCode: string;
  contentTitle: string;
  streamUrl: string;
  posterUrl: string | null;
  movieId: number | null;
  tvId: number | null;
  hostId: number;
  isHost: boolean;
}

interface SyncPayload {
  currentTime: number;
  isPlaying: boolean;
  serverTime: number;
  triggeredBy?: string;
}

interface WatchPartyContextValue {
  room: WatchPartyRoom | null;
  participants: ParticipantInfo[];
  chat: ChatMessage[];
  isHost: boolean;
  isConnected: boolean;
  hostDisconnected: boolean;
  gracePeriodSeconds: number;
  playerRef: React.RefObject<VideoPlayerRef | null>;
  sendChat: (message: string) => void;
  emitPlay: (currentTime: number) => void;
  emitPause: (currentTime: number) => void;
  emitSeek: (currentTime: number) => void;
}

const WatchPartyContext = createContext<WatchPartyContextValue | null>(null);

export function WatchPartyProvider({
  inviteCode,
  children,
}: {
  inviteCode: string;
  children: React.ReactNode;
}) {
  const { token } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState<WatchPartyRoom | null>(null);
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [hostDisconnected, setHostDisconnected] = useState(false);
  const [gracePeriodSeconds, setGracePeriodSeconds] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const playerRef = useRef<VideoPlayerRef | null>(null);

  // Hydration guard
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

    const socket = io(`${API_BASE_URL}/watch-party`, {
      auth: { token: token ?? null },
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("party:join", { inviteCode });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("[WatchParty] connection error:", err);
      setIsConnected(false);
    });

    socket.on(
      "party:joined",
      (data: {
        partyId: number;
        inviteCode: string;
        contentTitle: string;
        streamUrl: string;
        posterUrl: string | null;
        movieId: number | null;
        tvId: number | null;
        hostId: number;
        isHost: boolean;
        snapshot: WatchPartySnapshot;
        recentChat: ChatMessage[];
        participants: ParticipantInfo[];
      }) => {
        setRoom({
          partyId: data.partyId,
          inviteCode: data.inviteCode,
          contentTitle: data.contentTitle,
          streamUrl: data.streamUrl,
          posterUrl: data.posterUrl,
          movieId: data.movieId,
          tvId: data.tvId,
          hostId: data.hostId,
          isHost: data.isHost,
        });
        setParticipants(data.participants);
        setChat(data.recentChat ?? []);

        // Apply snapshot after player is ready
        const { currentTime, isPlaying, serverTime } = data.snapshot;
        const lag = (Date.now() - serverTime) / 1000;
        const adjustedTime = currentTime + (isPlaying ? lag : 0);

        setTimeout(() => {
          playerRef.current?.seekTo(adjustedTime);
          if (isPlaying) playerRef.current?.play();
        }, 500);
      }
    );

    socket.on("party:sync", (payload: SyncPayload) => {
      const lag = (Date.now() - payload.serverTime) / 1000;
      const adjustedTime = payload.currentTime + (payload.isPlaying ? lag : 0);
      playerRef.current?.seekTo(adjustedTime);
      if (payload.isPlaying) {
        playerRef.current?.play();
      } else {
        playerRef.current?.pause();
      }
    });

    socket.on(
      "party:member:joined",
      (data: { userName: string; userId: number | null; isHost: boolean; participantCount: number }) => {
        // Re-emit join to refresh list — server has authoritative state
        // Optimistically add participant
        setParticipants((prev) => {
          const exists = prev.some((p) => p.userName === data.userName && p.userId === data.userId);
          if (exists) return prev;
          return [...prev, { socketId: "", userId: data.userId, userName: data.userName, isHost: data.isHost }];
        });
      }
    );

    socket.on(
      "party:member:left",
      (data: { userName: string; userId: number | null; participantCount: number }) => {
        setParticipants((prev) =>
          prev.filter((p) => !(p.userName === data.userName && p.userId === data.userId))
        );
      }
    );

    socket.on("party:chat:message", (entry: ChatMessage) => {
      setChat((prev) => [...prev.slice(-199), entry]);
    });

    socket.on("party:host:disconnected", (data: { gracePeriodSeconds: number }) => {
      setHostDisconnected(true);
      setGracePeriodSeconds(data.gracePeriodSeconds);
    });

    socket.on("party:host:reconnected", () => {
      setHostDisconnected(false);
      setGracePeriodSeconds(0);
    });

    socket.on("party:ended", () => {
      setRoom(null);
      window.location.href = "/";
    });

    socket.on("party:error", (data: { message: string }) => {
      console.error("[WatchParty] error:", data.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isReady, inviteCode, token]);

  const emitPlay = useCallback((currentTime: number) => {
    if (!socketRef.current?.connected || !room) return;
    socketRef.current.emit("party:play", { partyId: room.partyId, currentTime });
  }, [room]);

  const emitPause = useCallback((currentTime: number) => {
    if (!socketRef.current?.connected || !room) return;
    socketRef.current.emit("party:pause", { partyId: room.partyId, currentTime });
  }, [room]);

  const emitSeek = useCallback((currentTime: number) => {
    if (!socketRef.current?.connected || !room) return;
    socketRef.current.emit("party:seek", { partyId: room.partyId, currentTime });
  }, [room]);

  const sendChat = useCallback((message: string) => {
    if (!socketRef.current?.connected || !room) return;
    socketRef.current.emit("party:chat", { partyId: room.partyId, message });
  }, [room]);

  return (
    <WatchPartyContext.Provider
      value={{
        room,
        participants,
        chat,
        isHost: room?.isHost ?? false,
        isConnected,
        hostDisconnected,
        gracePeriodSeconds,
        playerRef,
        sendChat,
        emitPlay,
        emitPause,
        emitSeek,
      }}
    >
      {children}
    </WatchPartyContext.Provider>
  );
}

export function useWatchParty() {
  const ctx = useContext(WatchPartyContext);
  if (!ctx) throw new Error("useWatchParty must be used inside WatchPartyProvider");
  return ctx;
}
