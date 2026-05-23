"use client";

import { useEffect, useReducer, useRef } from "react";
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

type AnalyticsState = {
  socket: Socket | null;
  isConnected: boolean;
  snapshot: AdminAnalyticsSnapshot | null;
  lastUpdateAt: Date | null;
};

function analyticsReducer(state: AnalyticsState, action: Partial<AnalyticsState>): AnalyticsState {
  return { ...state, ...action };
}

export function useAdminAnalyticsSocket(): UseAdminAnalyticsSocketReturn {
  const { token, isAuthenticated, user } = useAuth();

  const [state, dispatch] = useReducer(analyticsReducer, {
    socket: null,
    isConnected: false,
    snapshot: null,
    lastUpdateAt: null,
  });

  const socketRef = useRef<Socket | null>(null);
  const lastSnapshotIdRef = useRef<string | null>(null);

  useEffect(() => {
    const isAdmin = !!user?.role && ADMIN_ROLES.has(user.role);

    if (!isAuthenticated || !token || !isAdmin) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      dispatch({ socket: null, isConnected: false });
      return;
    }

    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

    let client: Socket | null = null;

    // Define handlers in outer scope so cleanup can reference them
    const handleConnect = () => dispatch({ socket: client, isConnected: true });
    const handleDisconnect = () => dispatch({ isConnected: false });
    const handleConnectError = (error: Error) => {
      console.error("[AdminAnalyticsSocket] connect_error", error);
      dispatch({ isConnected: false });
    };
    const handleAuthError = (error: Error) => {
      console.error("[AdminAnalyticsSocket] auth:error", error);
      dispatch({ isConnected: false });
    };
    const handleAnalyticsUpdate = (payload: AdminAnalyticsSnapshot) => {
      if (!payload) return;
      if (payload.snapshotId && lastSnapshotIdRef.current === payload.snapshotId) return;
      lastSnapshotIdRef.current = payload.snapshotId ?? null;
      dispatch({
        snapshot: payload,
        lastUpdateAt: payload.updatedAt ? new Date(payload.updatedAt) : new Date(),
      });
    };

    // Defer connection by 80ms as a hydration guard
    const hydrationTimer = window.setTimeout(() => {
      client = io(`${API_BASE_URL}/admin-analytics`, {
        auth: { token },
        transports: ["polling", "websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      socketRef.current = client;
      client.on("connect", handleConnect);
      client.on("disconnect", handleDisconnect);
      client.on("connect_error", handleConnectError);
      client.on("auth:error", handleAuthError);
      client.on("analytics:update", handleAnalyticsUpdate);
    }, 80);

    return () => {
      window.clearTimeout(hydrationTimer);
      if (client) {
        client.off("connect", handleConnect);
        client.off("disconnect", handleDisconnect);
        client.off("connect_error", handleConnectError);
        client.off("auth:error", handleAuthError);
        client.off("analytics:update", handleAnalyticsUpdate);
        client.disconnect();
        socketRef.current = null;
        dispatch({ socket: null, isConnected: false });
      }
    };
  }, [isAuthenticated, token, user?.role]);

  return {
    snapshot: state.snapshot,
    isConnected: state.isConnected,
    lastUpdateAt: state.lastUpdateAt,
    socket: state.socket,
  };
}
