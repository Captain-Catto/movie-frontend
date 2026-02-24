// Authentication Types

import type { ApiResponse } from "./api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface GoogleAuthData {
  email: string;
  name: string;
  image?: string;
  googleId: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  image?: string;
  role: string;
}

export interface AuthData {
  user: AuthUser;
  token?: string;
  refreshToken?: string;
}

export type AuthResponse = ApiResponse<AuthData | undefined>;
