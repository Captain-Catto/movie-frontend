"use client";

import { useEffect, useState } from "react";
import {
  parseOAuthCallback,
  extractGoogleUserInfo,
} from "@/lib/google-oauth";
import { sendOAuthCallbackToParent } from "@/lib/oauth-popup";
import { authApiService } from "@/services/auth-api";

export default function GoogleOAuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Processing Google login...");

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      // Parse hash parameters from Google OAuth redirect
      const hash = window.location.hash;
      const params = parseOAuthCallback(hash);

      console.log("📥 [OAUTH-CALLBACK] Received params:", params);

      if (!params || !params.id_token) {
        throw new Error("No ID token received from Google");
      }

      // Extract user info from ID token
      const googleUser = extractGoogleUserInfo(params.id_token);

      if (!googleUser) {
        throw new Error("Failed to extract user info from ID token");
      }

      console.log("👤 [OAUTH-CALLBACK] Extracted user:", googleUser);

      // Authenticate with backend
      setMessage("Authenticating with server...");
      const response = await authApiService.googleAuth(googleUser);

      if (response.success && response.data) {
        console.log("✅ [OAUTH-CALLBACK] Backend authentication successful");

        // Send success message to parent window
        sendOAuthCallbackToParent({
          token: response.data.token,
          user: response.data.user,
        });

        setStatus("success");
        setMessage("Login successful! Closing window...");

        // Close window after short delay
        setTimeout(() => {
          window.close();
        }, 1000);
      } else {
        throw new Error(response.message || "Authentication failed");
      }
    } catch (error) {
      console.error("❌ [OAUTH-CALLBACK] Error:", error);

      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      // Send error to parent window
      sendOAuthCallbackToParent(null, errorMessage);

      setStatus("error");
      setMessage(`Error: ${errorMessage}`);

      // Try to close window after delay
      setTimeout(() => {
        window.close();
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Icon */}
          <div className="mb-4">
            {status === "loading" && (
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
            )}
            {status === "success" && (
              <div className="inline-block text-6xl text-green-500">✓</div>
            )}
            {status === "error" && (
              <div className="inline-block text-6xl text-red-500">✕</div>
            )}
          </div>

          {/* Message */}
          <h2
            className={`text-xl font-semibold mb-2 ${
              status === "error" ? "text-red-400" : "text-white"
            }`}
          >
            {status === "loading" && "Đang xử lý..."}
            {status === "success" && "Thành công!"}
            {status === "error" && "Lỗi"}
          </h2>
          <p className="text-gray-300">{message}</p>

          {status === "error" && (
            <button
              onClick={() => window.close()}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              Đóng cửa sổ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
