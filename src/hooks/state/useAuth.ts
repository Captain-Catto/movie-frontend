"use client";

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  checkAuth,
  loginWithEmail as loginWithEmailAction,
  register as registerAction,
  loginWithGoogle as loginWithGoogleAction,
  logoutUser,
  clearError,
} from '@/store/authSlice';
import type { StoredUser } from '@/lib/auth-storage';

/**
 * Result type for auth operations
 */
export interface AuthOperationResult {
  success: boolean;
  error?: string;
}

/**
 * Return type for useAuth hook
 */
export interface UseAuthReturn {
  /** Current authenticated user */
  user: StoredUser | null;
  /** JWT access token */
  token: string | null;
  /** JWT refresh token */
  refreshToken: string | null;
  /** Loading state for auth operations */
  isLoading: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Current error message */
  error: string | null;
  /** Login with email and password */
  login: (email: string, password: string) => Promise<AuthOperationResult>;
  /** Register new user account */
  register: (name: string, email: string, password: string) => Promise<AuthOperationResult>;
  /** Login with Google OAuth */
  loginWithGoogle: () => Promise<AuthOperationResult>;
  /** Logout current user */
  logout: () => void;
  /** Check and restore auth from storage */
  checkAuth: () => void;
  /** Clear auth error state */
  clearError: () => void;
}

/**
 * Enhanced auth hook - wrapper around Redux auth state
 * Provides simplified API for authentication operations
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { login, isLoading, error, isAuthenticated } = useAuth();
 *
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     const result = await login(email, password);
 *     if (result.success) {
 *       router.push('/');
 *     }
 *   };
 *
 *   if (isAuthenticated) return <Redirect to="/" />;
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {error && <div className="error">{error}</div>}
 *       <input type="email" />
 *       <input type="password" />
 *       <button disabled={isLoading}>
 *         {isLoading ? 'Logging in...' : 'Login'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const dispatch = useAppDispatch();
  const { user, token, refreshToken, isLoading, isAuthenticated, error } =
    useAppSelector((state) => state.auth);

  // Check and restore auth from storage
  const handleCheckAuth = useCallback(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Login with email and password
  const handleLogin = useCallback(
    async (email: string, password: string): Promise<AuthOperationResult> => {
      try {
        await dispatch(loginWithEmailAction({ email, password })).unwrap();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err as string,
        };
      }
    },
    [dispatch]
  );

  // Register new user
  const handleRegister = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ): Promise<AuthOperationResult> => {
      try {
        await dispatch(registerAction({ name, email, password })).unwrap();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err as string,
        };
      }
    },
    [dispatch]
  );

  // Login with Google OAuth
  const handleLoginWithGoogle = useCallback(async (): Promise<AuthOperationResult> => {
    try {
      await dispatch(loginWithGoogleAction()).unwrap();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err as string,
      };
    }
  }, [dispatch]);

  // Logout
  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
  }, [dispatch]);

  // Clear error
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    token,
    refreshToken,
    isLoading,
    isAuthenticated,
    error,
    login: handleLogin,
    register: handleRegister,
    loginWithGoogle: handleLoginWithGoogle,
    logout: handleLogout,
    checkAuth: handleCheckAuth,
    clearError: handleClearError,
  };
}
