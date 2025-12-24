"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./useAuth";

export interface AdminAnalyticsSnapshot {
  views: number;
  clicks: number;
  plays: number;
  favorites: number;
  snapshotId: string;
  updatedAt: string;
}

interface UseAdminAnalyticsSocketReturn {
  snapshot: AdminAnalyticsSnapshot | null;
  isConnected: boolean;
  lastUpdateAt: Date | null;
  socket: Socket | null;
}

const ADMIN_ROLES = new Set(["admin", "super_admin", "viewer"]);

export function useAdminAnalyticsSocket(): UseAdminAnalyticsSocketReturn {
  const { token, isAuthenticated, user } = useAuth();

  const [isReady, setIsReady] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [snapshot, setSnapshot] = useState<AdminAnalyticsSnapshot | null>(null);
  const [lastUpdateAt, setLastUpdateAt] = useState<Date | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const lastSnapshotIdRef = useRef<string | null>(null);

  // Hydration guard
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 80);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const isAdmin = !!user?.role && ADMIN_ROLES.has(user.role);

    if (!isReady || !isAuthenticated || !token || !isAdmin) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

    const client = io(`${API_BASE_URL}/admin-analytics`, {
      auth: { token },
      transports: ["polling", "websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = client;

    client.on("connect", () => {
      setIsConnected(true);
      setSocket(client);
    });

    client.on("disconnect", () => {
      setIsConnected(false);
    });

    client.on("connect_error", (error) => {
      console.error("[AdminAnalyticsSocket] connect_error", error);
      setIsConnected(false);
    });

    client.on("auth:error", (error) => {
      console.error("[AdminAnalyticsSocket] auth:error", error);
      setIsConnected(false);
    });

    client.on("analytics:update", (payload: AdminAnalyticsSnapshot) => {
      if (!payload) return;

      if (
        payload.snapshotId &&
        lastSnapshotIdRef.current === payload.snapshotId
      ) {
        return;
      }

      lastSnapshotIdRef.current = payload.snapshotId ?? null;
      setSnapshot(payload);
      setLastUpdateAt(
        payload.updatedAt ? new Date(payload.updatedAt) : new Date()
      );
    });

    return () => {
      client.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [isReady, isAuthenticated, token, user?.role]);

  return {
    snapshot,
    isConnected,
    lastUpdateAt,
    socket,
  };
}
