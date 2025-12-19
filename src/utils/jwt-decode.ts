/**
 * JWT decoder with expiration validation
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
    const decoded = JSON.parse(jsonPayload);

    // Check if token is expired
    if (typeof decoded.exp === "number") {
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp <= currentTime) {
        console.warn("JWT token has expired");
        return null;
      }
    }

    return decoded;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}
