import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authStorage, type StoredUser } from "@/lib/auth-storage";
import { authApiService } from "@/services/auth-api";
import {
  openOAuthPopup,
  waitForOAuthCallback,
  type OAuthCallbackData,
} from "@/lib/oauth-popup";
import { getGoogleOAuthUrl } from "@/lib/google-oauth";
import { decodeJWT } from "@/utils/jwt-decode";

interface AuthState {
  user: StoredUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

// Async thunks
export const checkAuth = createAsyncThunk("auth/checkAuth", async () => {
  const storedToken = authStorage.getToken();
  let storedUser = authStorage.getUser();

  // If we have a token but no user data, try to decode it from JWT
  if (storedToken && !storedUser) {
    const decoded = decodeJWT(storedToken);

    if (decoded) {
      storedUser = {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        name: decoded.name,
        image: decoded.image,
        role: decoded.role || "user",
        googleId: decoded.googleId,
      } as StoredUser;
      // Save it for next time
      authStorage.setUser(storedUser);
    }
  }

  if (storedToken && storedUser) {
    return { token: storedToken, user: storedUser };
  }

  return { token: null, user: null };
});

export const loginWithEmail = createAsyncThunk(
  "auth/loginWithEmail",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authApiService.login({ email, password });

      if (response.success && response.data) {
        // Save to localStorage
        authStorage.setToken(response.data.token);
        authStorage.setUser(response.data.user);

        return {
          token: response.data.token,
          user: response.data.user,
        };
      } else {
        return rejectWithValue(response.message || "Login failed");
      }
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Login failed"
      );
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    { name, email, password }: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authApiService.register({
        name,
        email,
        password,
      });

      if (response.success && response.data) {
        // Save to localStorage
        authStorage.setToken(response.data.token);
        authStorage.setUser(response.data.user);

        return {
          token: response.data.token,
          user: response.data.user,
        };
      } else {
        return rejectWithValue(response.message || "Registration failed");
      }
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Registration failed"
      );
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (_, { rejectWithValue }) => {
    try {
      // Generate Google OAuth URL
      const oauthUrl = getGoogleOAuthUrl();

      // Open popup
      const popup = openOAuthPopup(oauthUrl, {
        width: 500,
        height: 600,
        title: "google-login",
      });

      if (!popup) {
        return rejectWithValue("Failed to open popup window");
      }

      // Wait for callback
      const callbackData: OAuthCallbackData = await waitForOAuthCallback(popup);

      // Save to localStorage
      authStorage.setToken(callbackData.token);
      const userToStore = {
        ...callbackData.user,
        name: callbackData.user.name || "User",
      };
      authStorage.setUser(userToStore);

      return {
        token: callbackData.token,
        user: userToStore,
      };
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Google login failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      // Clear localStorage
      authStorage.clearAuth();
      localStorage.removeItem("recentSearches");

      // Clear state
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = !!(action.payload.token && action.payload.user);
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Login with Email
      .addCase(loginWithEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Login with Google
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
