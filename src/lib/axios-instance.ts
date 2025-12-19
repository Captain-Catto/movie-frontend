import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authStorage } from './auth-storage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - add auth token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 and refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Skip refresh logic for auth endpoints
    const requestUrl = originalRequest?.url || "";
    if (
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/google") ||
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/logout")
    ) {
      return Promise.reject(error);
    }

    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = authStorage.getRefreshToken();

    if (!refreshToken) {
      // No refresh token, logout user
      isRefreshing = false;
      processQueue(new Error('No refresh token'), null);

      // Clear tokens and trigger logout event
      authStorage.clearAuth();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event('auth:logout'));
        // Don't redirect - let the app handle it via AuthLoader
      }

      return Promise.reject(error);
    }

    try {
      // Call refresh endpoint
      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
        refreshToken,
      });

      if (response.data.success && response.data.data) {
        const { token, refreshToken: newRefreshToken } = response.data.data;

        // Save new tokens
        authStorage.setToken(token);
        authStorage.setRefreshToken(newRefreshToken);
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("auth:token-refreshed", {
              detail: { token, refreshToken: newRefreshToken },
            })
          );
        }

        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }

        // Process queued requests
        processQueue(null, token);
        isRefreshing = false;

        // Retry original request
        return axiosInstance(originalRequest);
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (refreshError) {
      // Refresh failed, logout user
      processQueue(refreshError as Error, null);
      isRefreshing = false;

      // Clear tokens and redirect to login
      authStorage.clearAuth();

      // Dispatch logout event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event('auth:logout'));
      }

      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;
