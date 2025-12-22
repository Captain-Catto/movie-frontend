import axiosInstance from "@/lib/axios-instance";
import axios from "axios";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      email: string;
      name: string;
      image?: string;
      role: string;
    };
    token?: string;
    refreshToken?: string;
  };
  error?: string;
}

class AuthApiService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      return this.handleAxiosError(error);
    }
  }

  /**
   * Register new user with email and password
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      return this.handleAxiosError(error);
    }
  }

  /**
   * Authenticate with Google OAuth data
   */
  async googleAuth(googleData: {
    email: string;
    name: string;
    image?: string;
    googleId: string;
  }): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post("/auth/google", googleData);
      return response.data;
    } catch (error) {
      return this.handleAxiosError(error);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(token: string): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return this.handleAxiosError(error);
    }
  }

  async logout(refreshToken?: string): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post("/auth/logout", { refreshToken });
      return response.data;
    } catch (error) {
      return this.handleAxiosError(error);
    }
  }

  private handleAxiosError(error: unknown): AuthResponse {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as {
        message?: string | string[];
        error?: string;
      };
      const msgArray = Array.isArray(data?.message)
        ? data?.message.join(", ")
        : data?.message;

      return {
        success: false,
        message: msgArray || "API request failed",
        error: data?.error || msgArray || error.message,
      };
    }

    return {
      success: false,
      message: "Network error. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export const authApiService = new AuthApiService();
