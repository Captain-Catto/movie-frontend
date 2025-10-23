/**
 * OAuth Popup Utility
 * Handles popup window for OAuth authentication
 */

export interface OAuthCallbackData {
  token: string;
  user: {
    id: number;
    email: string;
    name?: string;
    image?: string;
    role: string;
  };
}

export interface PopupOptions {
  width?: number;
  height?: number;
  title?: string;
}

/**
 * Open OAuth popup window centered on screen
 */
export function openOAuthPopup(
  url: string,
  options: PopupOptions = {}
): Window | null {
  const { width = 500, height = 600, title = "oauth-popup" } = options;

  // Calculate center position
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  // Window features
  const features = [
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    "toolbar=no",
    "menubar=no",
    "location=no",
    "status=no",
    "resizable=yes",
    "scrollbars=yes",
  ].join(",");

  // Open popup
  const popup = window.open(url, title, features);

  // Focus popup
  if (popup) {
    popup.focus();
  }

  return popup;
}

/**
 * Wait for OAuth callback from popup
 * Returns promise that resolves with callback data
 */
export function waitForOAuthCallback(
  popup: Window | null,
  timeoutMs: number = 300000 // 5 minutes
): Promise<OAuthCallbackData> {
  return new Promise((resolve, reject) => {
    // Timeout timer
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("OAuth timeout"));
    }, timeoutMs);

    // Check if popup closed
    const checkClosedInterval = setInterval(() => {
      if (!popup || popup.closed) {
        cleanup();
        reject(new Error("OAuth cancelled - popup closed"));
      }
    }, 500);

    // Listen for messages from popup
    const handleMessage = (event: MessageEvent) => {
      // Security: Verify origin (adjust if needed)
      const allowedOrigins = [
        window.location.origin,
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      ];

      if (!allowedOrigins.includes(event.origin)) {
        console.warn("Ignoring message from unknown origin:", event.origin);
        return;
      }

      // Check if this is OAuth callback data
      if (event.data && event.data.type === "oauth-callback") {
        cleanup();

        if (event.data.success) {
          resolve(event.data.data);
        } else {
          reject(new Error(event.data.error || "OAuth failed"));
        }

        // Close popup
        if (popup && !popup.closed) {
          popup.close();
        }
      }
    };

    // Cleanup function
    const cleanup = () => {
      clearTimeout(timeoutId);
      clearInterval(checkClosedInterval);
      window.removeEventListener("message", handleMessage);
    };

    // Add message listener
    window.addEventListener("message", handleMessage);
  });
}

/**
 * Send OAuth callback data to parent window
 * Call this from the OAuth callback page
 */
export function sendOAuthCallbackToParent(
  data: OAuthCallbackData | null,
  error?: string
): void {
  if (window.opener) {
    const message = {
      type: "oauth-callback",
      success: !!data,
      data: data,
      error: error,
    };

    // Send to parent window
    window.opener.postMessage(message, window.location.origin);
  } else {
    console.error("No parent window found");
  }
}
