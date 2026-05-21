"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Dispatch, SetStateAction } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";

export interface NotificationData {
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

export interface NotificationSocketContextValue {
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

export function NotificationSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, isAuthenticated } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] =
    useState<NotificationData | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady || !isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        setUnreadCount(0);
        setLatestNotification(null);
      }
      return;
    }

    if (socketRef.current?.connected) {
      return;
    }

    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

    const newSocket = io(`${API_BASE_URL}/notifications`, {
      auth: { token },
      transports: ["polling", "websocket"],
      autoConnect: true,
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      setIsConnected(true);
      setSocket(newSocket);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      setIsConnected(false);
    });

    newSocket.on("auth:error", (error) => {
      console.error("Socket authentication failed:", error);
      setIsConnected(false);
    });

    newSocket.on("notification:new", (notification: NotificationData) => {
      const createdAt =
        notification?.createdAt instanceof Date
          ? notification.createdAt
          : new Date(notification?.createdAt || Date.now());
      setLatestNotification({ ...notification, createdAt });
    });

    newSocket.on("notification:unread-count", (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    return () => {
      newSocket.removeAllListeners();
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [isReady, isAuthenticated, token]);

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
  const context = useContext(NotificationSocketContext);
  if (!context) {
    throw new Error(
      "useNotificationSocket must be used within NotificationSocketProvider"
    );
  }
  return context;
}
