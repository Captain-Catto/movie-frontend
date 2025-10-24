/**
 * Google OAuth Configuration
 * Generates Google OAuth URLs and handles OAuth flow
 */

const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export interface GoogleOAuthParams {
  clientId?: string;
  redirectUri?: string;
  scope?: string[];
  state?: string;
}

/**
 * Generate Google OAuth authorization URL
 */
export function getGoogleOAuthUrl(params?: GoogleOAuthParams): string {
  const {
    clientId = GOOGLE_CLIENT_ID,
    redirectUri = `${window.location.origin}/auth/google/callback`,
    scope = ["openid", "email", "profile"],
    state = generateRandomState(),
  } = params || {};

  if (!clientId) {
    throw new Error(
      "Google Client ID is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env"
    );
  }

  const searchParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "token id_token",
    scope: scope.join(" "),
    state: state,
    nonce: generateRandomState(),
    prompt: "select_account",
  });

  return `${GOOGLE_OAUTH_URL}?${searchParams.toString()}`;
}

/**
 * Generate random state for OAuth security
 */
function generateRandomState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/**
 * Parse OAuth callback hash parameters
 */
export function parseOAuthCallback(
  hash: string
): Record<string, string> | null {
  if (!hash || !hash.startsWith("#")) {
    return null;
  }

  const params = new URLSearchParams(hash.substring(1));
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

/**
 * Decode JWT token (without verification - for display only)
 */
export function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

function isGoogleIdTokenPayload(
  payload: Record<string, unknown>
): payload is {
  email: string;
  name?: string;
  picture?: string;
  sub: string;
} {
  return (
    typeof payload.email === "string" &&
    typeof payload.sub === "string"
  );
}

/**
 * Extract user info from Google ID token
 */
export function extractGoogleUserInfo(idToken: string): {
  email: string;
  name: string;
  image?: string;
  googleId: string;
} | null {
  const decoded = decodeJWT(idToken);

  if (!decoded || !isGoogleIdTokenPayload(decoded)) {
    return null;
  }

  return {
    email: decoded.email,
    name:
      typeof decoded.name === "string" && decoded.name.length > 0
        ? decoded.name
        : decoded.email,
    image:
      typeof decoded.picture === "string" && decoded.picture.length > 0
        ? decoded.picture
        : undefined,
    googleId: decoded.sub,
  };
}
