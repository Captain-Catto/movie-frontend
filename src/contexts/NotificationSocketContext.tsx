"use client";

import {
  createContext,
  useCallback,
  use,
  useEffect,
  useReducer,
  useRef,
} from "react";
import type { Dispatch, SetStateAction } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";

interface NotificationData {
  id: number;
  title: string;
  message: string;
  titleVi?: string;
  messageVi?: string;
  titleEn?: string;
  messageEn?: string;
  type: "info" | "success" | "warning" | "error" | "system";
  createdAt: Date;
  metadata?: {
    movieId?: number;
    tvId?: number;
    commentId?: number;
    parentId?: number;
    [key: string]: unknown;
  };
}

interface NotificationSocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  unreadCount: number;
  latestNotification: NotificationData | null;
  markAsRead: (notificationId: number) => boolean;
  markAllAsRead: () => boolean;
  setUnreadCount: Dispatch<SetStateAction<number>>;
}

const NotificationSocketContext =
  createContext<NotificationSocketContextValue | null>(null);

type NotifSocketState = {
  socket: Socket | null;
  isConnected: boolean;
  unreadCount: number;
  latestNotification: NotificationData | null;
};

export function NotificationSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, isAuthenticated } = useAuth();
  const [socketState, dispatchSocket] = useReducer(
    (s: NotifSocketState, a: Partial<NotifSocketState>): NotifSocketState => ({ ...s, ...a }),
    { socket: null, isConnected: false, unreadCount: 0, latestNotification: null }
  );
  const { socket, isConnected, unreadCount, latestNotification } = socketState;
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        dispatchSocket({ socket: null, isConnected: false, unreadCount: 0, latestNotification: null });
      }
      return;
    }

    let newSocket: Socket | null = null;

    const handleConnect = () => {
      if (newSocket) dispatchSocket({ isConnected: true, socket: newSocket });
    };
    const handleDisconnect = () => dispatchSocket({ isConnected: false });
    const handleConnectError = (error: Error) => {
      console.error("WebSocket connection error:", error);
      dispatchSocket({ isConnected: false });
    };
    const handleAuthError = (error: Error) => {
      console.error("Socket authentication failed:", error);
      dispatchSocket({ isConnected: false });
    };
    const handleNewNotification = (notification: NotificationData) => {
      const createdAt =
        notification?.createdAt instanceof Date
          ? notification.createdAt
          : new Date(notification?.createdAt || Date.now());
      dispatchSocket({ latestNotification: { ...notification, createdAt } });
    };
    const handleUnreadCount = (data: { count: number }) => {
      dispatchSocket({ unreadCount: data.count });
    };

    const timer = setTimeout(() => {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
      newSocket = io(`${API_BASE_URL}/notifications`, {
        auth: { token },
        transports: ["polling", "websocket"],
        autoConnect: true,
        forceNew: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });
      socketRef.current = newSocket;
      newSocket.on("connect", handleConnect);
      newSocket.on("disconnect", handleDisconnect);
      newSocket.on("connect_error", handleConnectError);
      newSocket.on("auth:error", handleAuthError);
      newSocket.on("notification:new", handleNewNotification);
      newSocket.on("notification:unread-count", handleUnreadCount);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (newSocket) {
        newSocket.off("connect", handleConnect);
        newSocket.off("disconnect", handleDisconnect);
        newSocket.off("connect_error", handleConnectError);
        newSocket.off("auth:error", handleAuthError);
        newSocket.off("notification:new", handleNewNotification);
        newSocket.off("notification:unread-count", handleUnreadCount);
        newSocket.disconnect();
        socketRef.current = null;
        dispatchSocket({ socket: null, isConnected: false });
      }
    };
  }, [isAuthenticated, token]);

  const setUnreadCount = useCallback<Dispatch<SetStateAction<number>>>((value) => {
    dispatchSocket({ unreadCount: typeof value === "function" ? value(socketState.unreadCount) : value });
  }, [socketState.unreadCount]);

  const markAsRead = useCallback((notificationId: number) => {
    if (!socketRef.current?.connected) return false;
    socketRef.current.emit("notification:mark-read", { notificationId });
    return true;
  }, []);

  const markAllAsRead = useCallback(() => {
    if (!socketRef.current?.connected) return false;
    socketRef.current.emit("notification:mark-all-read");
    return true;
  }, []);

  return (
    <NotificationSocketContext.Provider
      value={{
        socket,
        isConnected,
        unreadCount,
        latestNotification,
        markAsRead,
        markAllAsRead,
        setUnreadCount,
      }}
    >
      {children}
    </NotificationSocketContext.Provider>
  );
}

export function useNotificationSocketContext(): NotificationSocketContextValue {
  const context = use(NotificationSocketContext);
  if (!context) {
    throw new Error(
      "useNotificationSocket must be used within NotificationSocketProvider"
    );
  }
  return context;
}
