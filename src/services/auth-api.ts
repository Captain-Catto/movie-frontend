import axiosInstance from "@/lib/axios-instance";
import axios from "axios";
import type {
  LoginCredentials,
  RegisterData,
  GoogleAuthData,
  AuthResponse,
} from "@/types/auth.types";

class AuthApiService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      return this.handleAxiosError(error);
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      return this.handleAxiosError(error);
    }
  }

  async googleAuth(googleData: GoogleAuthData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post("/auth/google", googleData);
      return response.data;
    } catch (error) {
      return this.handleAxiosError(error);
    }
  }

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
        data: undefined,
        error: data?.error || msgArray || error.message,
      };
    }

    return {
      success: false,
      message: "Network error. Please try again.",
      data: undefined,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export const authApiService = new AuthApiService();
