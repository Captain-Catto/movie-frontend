"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { checkAuth } from "@/store/authSlice";

/**
 * AuthLoader - Automatically checks authentication status on app load
 * and listens for storage events (e.g., login in another tab)
 */
export function AuthLoader() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check auth on mount
    dispatch(checkAuth());

    // Listen for storage events (e.g., login in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === "authToken" ||
        e.key === "refreshToken" ||
        e.key === "userData"
      ) {
        dispatch(checkAuth());
      }
    };

    const handleAuthLogout = () => {
      dispatch(checkAuth());
    };

    const handleTokenRefreshed = () => {
      dispatch(checkAuth());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth:logout", handleAuthLogout as EventListener);
    window.addEventListener(
      "auth:token-refreshed",
      handleTokenRefreshed as EventListener
    );
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth:logout", handleAuthLogout as EventListener);
      window.removeEventListener(
        "auth:token-refreshed",
        handleTokenRefreshed as EventListener
      );
    };
  }, [dispatch]);

  return null; // This component doesn't render anything
}
