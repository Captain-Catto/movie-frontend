"use client";

import { useCallback, useEffect, useState } from "react";
import {
  parseOAuthCallback,
  extractGoogleUserInfo,
} from "@/lib/google-oauth";
import { sendOAuthCallbackToParent } from "@/lib/oauth-popup";
import { authApiService } from "@/services/auth-api";
import { useLanguage } from "@/contexts/LanguageContext";
import { getOAuthCallbackUiMessages } from "@/lib/ui-messages";

export default function GoogleOAuthCallbackPage() {
  const { language } = useLanguage();
  const labels = getOAuthCallbackUiMessages(language);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState(labels.initialMessage);
  const handleOAuthCallback = useCallback(async () => {
    try {
      // Parse hash parameters from Google OAuth redirect
      const hash = window.location.hash;
      const params = parseOAuthCallback(hash);

      if (!params || !params.id_token) {
        throw new Error(labels.noIdTokenReceived);
      }

      // Extract user info from ID token
      const googleUser = extractGoogleUserInfo(params.id_token);

      if (!googleUser) {
        throw new Error(labels.failedToExtractUserInfo);
      }

      // Authenticate with backend
      setMessage(labels.authenticatingWithServer);
      const response = await authApiService.googleAuth(googleUser);

      if (
        response.success &&
        response.data?.token &&
        response.data?.refreshToken
      ) {
        // Send success message to parent window
        sendOAuthCallbackToParent({
          token: response.data.token,
          refreshToken: response.data.refreshToken,
          user: response.data.user,
        });

        setStatus("success");
        setMessage(labels.loginSuccessfulClosingWindow);

        // Try to close if allowed; if blocked by COOP, show success state
        setTimeout(() => {
          try {
            window.close();
          } catch {
            // ignore; COOP may block close
          }
        }, 1000);
      } else {
        throw new Error(response.message || labels.authenticationFailed);
      }
    } catch (error) {
      console.error("❌ [OAUTH-CALLBACK] Error:", error);

      const errorMessage = error instanceof Error ? error.message : labels.unknownError;

      // Send error to parent window
      sendOAuthCallbackToParent(null, errorMessage);

      setStatus("error");
      setMessage(`${labels.errorPrefix} ${errorMessage}`);

      // Try to close window after delay (COOP may block)
      setTimeout(() => {
        try {
          window.close();
        } catch {
          // ignore
        }
      }, 3000);
    }
  }, [labels]);

  useEffect(() => {
    void handleOAuthCallback();
  }, [handleOAuthCallback]);

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
            {status === "loading" && labels.processingStatus}
            {status === "success" && labels.successStatus}
            {status === "error" && labels.errorStatus}
          </h2>
          <p className="text-gray-300">{message}</p>

          {status === "error" && (
            <button
              onClick={() => {
                try {
                  window.close();
                } catch {
                  // If blocked, reload to parent origin as fallback
                  window.location.href = "/";
                }
              }}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              {labels.closeWindow}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
