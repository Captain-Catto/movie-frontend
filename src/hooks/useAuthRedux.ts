import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  checkAuth,
  loginWithEmail as loginWithEmailAction,
  register as registerAction,
  loginWithGoogle as loginWithGoogleAction,
  logout as logoutAction,
  clearError,
} from "@/store/authSlice";
import type { StoredUser } from "@/lib/auth-storage";

export interface UseAuthReturn {
  user: StoredUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
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
  clearError: () => void;
}

/**
 * Redux-based Auth Hook
 * Replacement for useAuth from AuthContext
 */
export function useAuthRedux(): UseAuthReturn {
  const dispatch = useAppDispatch();
  const { user, token, isLoading, isAuthenticated, error } = useAppSelector(
    (state) => state.auth
  );

  const handleCheckAuth = useCallback(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const handleLoginWithEmail = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
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

  const handleRegister = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
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

  const handleLoginWithGoogle = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
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

  const handleLogout = useCallback(() => {
    dispatch(logoutAction());
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    error,
    login: handleLoginWithEmail, // Alias
    loginWithEmail: handleLoginWithEmail,
    register: handleRegister,
    loginWithGoogle: handleLoginWithGoogle,
    logout: handleLogout,
    checkAuth: handleCheckAuth,
    clearError: handleClearError,
  };
}
