import axiosInstance from "@/lib/axios-instance";

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
      console.error("Login error:", error);
      return {
        success: false,
        message: "Network error. Please try again.",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
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
      console.error("Registration error:", error);
      return {
        success: false,
        message: "Network error. Please try again.",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
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
      console.error("Google auth error:", error);
      return {
        success: false,
        message: "Network error. Please try again.",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
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
      console.error("Get profile error:", error);
      return {
        success: false,
        message: "Network error. Please try again.",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async logout(refreshToken?: string): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post("/auth/logout", { refreshToken });
      return response.data;
    } catch (error) {
      console.error("Logout error:", error);
      return {
        success: false,
        message: "Network error. Please try again.",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}

export const authApiService = new AuthApiService();
