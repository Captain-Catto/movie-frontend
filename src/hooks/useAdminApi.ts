import { useCallback } from "react";
import axiosInstance from "@/lib/axios-instance";
import { useAuth } from "./useAuth";

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Hook for admin API calls with automatic token handling and refresh
 */
export function useAdminApi() {
  const { token, isAuthenticated } = useAuth();

  /**
   * Make authenticated API request using axios
   */
  const request = useCallback(
    async <T = unknown>(
      endpoint: string,
      options?: ApiOptions
    ): Promise<ApiResponse<T>> => {
      if (!isAuthenticated || !token) {
        return {
          success: false,
          error: "Not authenticated",
          message: "Please login to continue",
        };
      }

      try {
        const { method = "GET", body, headers = {} } = options || {};

        const config = {
          method,
          url: endpoint,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          data: body,
        };

        const response = await axiosInstance.request(config);

        // Handle different response formats
        if (response.data?.success !== undefined) {
          return response.data as ApiResponse<T>;
        }

        // Fallback for direct data responses
        return {
          success: true,
          data: response.data as T,
        };
      } catch (error: unknown) {
        console.error(`Admin API error [${endpoint}]:`, error);

        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response?: { data?: { message?: string } };
            message?: string;
          };
          return {
            success: false,
            error:
              axiosError.response?.data?.message ||
              axiosError.message ||
              "API request failed",
          };
        }

        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    [token, isAuthenticated]
  );

  /**
   * GET request
   */
  const get = useCallback(
    <T = unknown>(endpoint: string, headers?: Record<string, string>) => {
      return request<T>(endpoint, { method: "GET", headers });
    },
    [request]
  );

  /**
   * POST request
   */
  const post = useCallback(
    <T = unknown>(
      endpoint: string,
      body?: unknown,
      headers?: Record<string, string>
    ) => {
      return request<T>(endpoint, { method: "POST", body, headers });
    },
    [request]
  );

  /**
   * PUT request
   */
  const put = useCallback(
    <T = unknown>(
      endpoint: string,
      body?: unknown,
      headers?: Record<string, string>
    ) => {
      return request<T>(endpoint, { method: "PUT", body, headers });
    },
    [request]
  );

  /**
   * PATCH request
   */
  const patch = useCallback(
    <T = unknown>(
      endpoint: string,
      body?: unknown,
      headers?: Record<string, string>
    ) => {
      return request<T>(endpoint, { method: "PATCH", body, headers });
    },
    [request]
  );

  /**
   * DELETE request
   */
  const del = useCallback(
    <T = unknown>(endpoint: string, headers?: Record<string, string>) => {
      return request<T>(endpoint, { method: "DELETE", headers });
    },
    [request]
  );

  return {
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    isAuthenticated,
    token,
  };
}
