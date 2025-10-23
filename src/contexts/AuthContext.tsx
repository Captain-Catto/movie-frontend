"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authStorage, type StoredUser } from "@/lib/auth-storage";
import { authApiService } from "@/services/auth-api";
import {
  openOAuthPopup,
  waitForOAuthCallback,
  type OAuthCallbackData,
} from "@/lib/oauth-popup";
import { getGoogleOAuthUrl } from "@/lib/google-oauth";
import { decodeJWT } from "@/utils/jwt-decode";

export interface AuthContextValue {
  user: StoredUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithEmail: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Check if user is authenticated
   */
  const checkAuth = useCallback(() => {
    try {
      const storedToken = authStorage.getToken();
      let storedUser = authStorage.getUser();

      // If we have a token but no user data, try to decode it from JWT
      if (storedToken && !storedUser) {
        const decoded = decodeJWT(storedToken);

        if (decoded) {
          storedUser = {
            id: decoded.sub || decoded.id,
            email: decoded.email,
            name: decoded.name,
            image: decoded.image,
            role: decoded.role || "user",
            googleId: decoded.googleId,
          } as StoredUser;
          // Save it for next time
          authStorage.setUser(storedUser);
        }
      }

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      } else {
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to check auth:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check authentication on mount and when localStorage changes
  useEffect(() => {
    checkAuth();

    // Listen for storage events (e.g., login in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "authToken" || e.key === "userData") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [checkAuth]);

  /**
   * Login with email and password
   */
  const loginWithEmail = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApiService.login({ email, password });

      if (response.success && response.data) {
        // Save to localStorage
        authStorage.setToken(response.data.token);
        authStorage.setUser(response.data.user);

        // Update state
        setToken(response.data.token);
        setUser(response.data.user);

        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  };

  /**
   * Register new user
   */
  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApiService.register({
        name,
        email,
        password,
      });

      if (response.success && response.data) {
        // Save to localStorage
        authStorage.setToken(response.data.token);
        authStorage.setUser(response.data.user);

        // Update state
        setToken(response.data.token);
        setUser(response.data.user);

        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error: unknown) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Registration failed",
      };
    }
  };

  /**
   * Login with Google OAuth (popup flow)
   */
  const loginWithGoogle = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      // Generate Google OAuth URL
      const oauthUrl = getGoogleOAuthUrl();

      // Open popup
      const popup = openOAuthPopup(oauthUrl, {
        width: 500,
        height: 600,
        title: "google-login",
      });

      if (!popup) {
        return { success: false, error: "Failed to open popup window" };
      }

      // Wait for callback
      const callbackData: OAuthCallbackData = await waitForOAuthCallback(popup);

      // Save to localStorage
      authStorage.setToken(callbackData.token);
      const userToStore = {
        ...callbackData.user,
        name: callbackData.user.name || "User",
      };
      authStorage.setUser(userToStore);

      // Update state
      setToken(callbackData.token);
      setUser(userToStore);

      return { success: true };
    } catch (error: unknown) {
      console.error("Google login error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Google login failed",
      };
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    // Clear localStorage
    authStorage.clearAuth();

    // Clear state - this triggers re-render across all components using useAuth
    setToken(null);
    setUser(null);

    // Clear search history
    localStorage.removeItem("recentSearches");

    // No page reload needed - React context handles state updates automatically
  };

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login: loginWithEmail, // Alias for compatibility
    loginWithEmail,
    register,
    loginWithGoogle,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth hook
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
