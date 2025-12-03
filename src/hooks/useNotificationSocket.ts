"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";

interface NotificationData {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "system";
  createdAt: Date;
}

interface UseNotificationSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  unreadCount: number;
  latestNotification: NotificationData | null;
  markAsRead: (notificationId: number) => void;
  markAllAsRead: () => void;
}

export function useNotificationSocket(): UseNotificationSocketReturn {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] =
    useState<NotificationData | null>(null);

  // Use refs to store current values
  const socketRef = useRef<Socket | null>(null);
  const isAuthenticatedRef = useRef(isAuthenticated);
  const tokenRef = useRef(token);

  // Update refs when values change
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
    tokenRef.current = token;
  }, [isAuthenticated, token]);

  // Socket connection management
  useEffect(() => {
    // Only connect if authenticated and has token
    if (!isAuthenticated || !token) {
      // Cleanup existing connection
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Don't create new connection if already exists with same token
    if (socketRef.current && socketRef.current.connected) {
      return;
    }

    console.log("🔗 Creating WebSocket connection...");

    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

    const newSocket = io(`${API_BASE_URL}/notifications`, {
      auth: { token },
      transports: ["polling", "websocket"],
      autoConnect: true,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      console.log("✅ Connected to notification WebSocket");
      setIsConnected(true);
      setSocket(newSocket);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from notification WebSocket:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("🔌 WebSocket connection error:", error);
      setIsConnected(false);
    });

    newSocket.on("auth:error", (error) => {
      console.error("🔐 Socket authentication failed:", error);
      setIsConnected(false);
      // Optional: Trigger token refresh or re-login
    });

    newSocket.on("notification:new", (notification: NotificationData) => {
      console.log("🔔 New notification:", notification);
      setLatestNotification(notification);
    });

    newSocket.on("notification:unread-count", (data: { count: number }) => {
      console.log("📊 Unread count:", data.count);
      setUnreadCount(data.count);
    });

    // Cleanup function
    return () => {
      console.log("🧹 Cleaning up WebSocket connection");
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, token]); // Only re-run when auth state or token changes

  const markAsRead = (notificationId: number) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("notification:mark-read", { notificationId });
    }
  };

  const markAllAsRead = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("notification:mark-all-read");
    }
  };

  return {
    socket,
    isConnected,
    unreadCount,
    latestNotification,
    markAsRead,
    markAllAsRead,
  };
}
