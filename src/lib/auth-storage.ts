/**
 * Authentication Storage Utility
 * Manages JWT tokens and user data in localStorage
 */

const AUTH_TOKEN_KEY = "authToken";
const USER_DATA_KEY = "userData";
const REFRESH_TOKEN_KEY = "refreshToken";
const hasStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export interface StoredUser {
  id: number;
  email: string;
  name: string;
  image?: string;
  role: string;
  googleId?: string;
}

/**
 * Token Management
 */
export const authStorage = {
  /**
   * Save JWT token to localStorage
   */
  setToken(token: string): void {
    try {
      if (!hasStorage()) return;
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch (error) {
      console.error("Failed to save token:", error);
    }
  },

  /**
   * Get JWT token from localStorage
   */
  getToken(): string | null {
    try {
      if (!hasStorage()) return null;
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error("Failed to get token:", error);
      return null;
    }
  },

  /**
   * Remove JWT token from localStorage
   */
  removeToken(): void {
    try {
      if (!hasStorage()) return;
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error("Failed to remove token:", error);
    }
  },

  /**
   * Save refresh token to localStorage
   */
  setRefreshToken(token: string): void {
    try {
      if (!hasStorage()) return;
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error("Failed to save refresh token:", error);
    }
  },

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken(): string | null {
    try {
      if (!hasStorage()) return null;
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Failed to get refresh token:", error);
      return null;
    }
  },

  /**
   * Remove refresh token from localStorage
   */
  removeRefreshToken(): void {
    try {
      if (!hasStorage()) return;
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Failed to remove refresh token:", error);
    }
  },

  /**
   * Save user data to localStorage
   */
  setUser(user: StoredUser): void {
    try {
      if (!hasStorage()) return;
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Failed to save user data:", error);
    }
  },

  /**
   * Get user data from localStorage
   */
  getUser(): StoredUser | null {
    try {
      if (!hasStorage()) return null;
      const userData = localStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Failed to get user data:", error);
      return null;
    }
  },

  /**
   * Remove user data from localStorage
   */
  removeUser(): void {
    try {
      if (!hasStorage()) return;
      localStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error("Failed to remove user data:", error);
    }
  },

  /**
   * Clear all authentication data
   */
  clearAuth(): void {
    if (!hasStorage()) return;
    this.removeToken();
    this.removeRefreshToken();
    this.removeUser();
  },

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
