const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

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
    token: string;
  };
  error?: string;
}

class AuthApiService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      return data;
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
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      return data;
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
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(googleData),
      });

      const data = await response.json();
      return data;
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
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
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
}

export const authApiService = new AuthApiService();
