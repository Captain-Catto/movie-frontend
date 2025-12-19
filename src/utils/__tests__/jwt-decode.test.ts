import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { decodeJWT } from "../jwt-decode";

describe("decodeJWT", () => {
  let originalDateNow: () => number;

  beforeEach(() => {
    originalDateNow = Date.now;
  });

  afterEach(() => {
    Date.now = originalDateNow;
  });

  it("should decode a valid JWT token", () => {
    // JWT with payload: { sub: 123, email: "test@example.com", exp: 9999999999 }
    const validToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMywiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjo5OTk5OTk5OTk5fQ.mock";

    // Mock Date.now to return a time before expiration
    Date.now = vi.fn(() => 1000000000 * 1000); // Earlier than exp: 9999999999

    const result = decodeJWT(validToken);

    expect(result).toBeTruthy();
    expect(result?.sub).toBe(123);
    expect(result?.email).toBe("test@example.com");
  });

  it("should return null for expired token", () => {
    // JWT with payload: { sub: 123, email: "test@example.com", exp: 1000000000 }
    const expiredToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMywiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxMDAwMDAwMDAwfQ.mock";

    // Mock Date.now to return a time after expiration
    Date.now = vi.fn(() => 2000000000 * 1000); // Later than exp: 1000000000

    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = decodeJWT(expiredToken);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith("JWT token has expired");

    consoleSpy.mockRestore();
  });

  it("should handle token without exp claim", () => {
    // JWT with payload: { sub: 123, email: "test@example.com" } (no exp)
    const tokenWithoutExp =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMywiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIn0.mock";

    const result = decodeJWT(tokenWithoutExp);

    expect(result).toBeTruthy();
    expect(result?.sub).toBe(123);
    expect(result?.email).toBe("test@example.com");
  });

  it("should return null for malformed token", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = decodeJWT("invalid.token");

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to decode JWT:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("should return null for empty token", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = decodeJWT("");

    expect(result).toBeNull();

    consoleSpy.mockRestore();
  });

  it("should handle token with non-numeric exp", () => {
    // JWT with payload: { sub: 123, exp: "invalid" }
    const tokenWithInvalidExp =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMywiZXhwIjoiaW52YWxpZCJ9.mock";

    const result = decodeJWT(tokenWithInvalidExp);

    // Should still decode since exp validation only applies to numeric exp
    expect(result).toBeTruthy();
    expect(result?.sub).toBe(123);
  });

  it("should handle token at exact expiration time", () => {
    const currentTime = 1700000000;
    // JWT with payload: { sub: 123, exp: 1700000000 }
    const tokenAtExpiration =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMywiZXhwIjoxNzAwMDAwMDAwfQ.mock";

    // Mock Date.now to return exact expiration time
    Date.now = vi.fn(() => currentTime * 1000);

    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = decodeJWT(tokenAtExpiration);

    // Token is expired when current time >= exp
    expect(result).toBeNull();

    consoleSpy.mockRestore();
  });

  it("should decode token with special characters in payload", () => {
    // JWT with payload: { name: "Nguyễn Văn A", email: "test@example.com", exp: 9999999999 }
    const tokenWithSpecialChars =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTmd1eeG7hW4gVsSDbiAiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJleHAiOjk5OTk5OTk5OTl9.mock";

    Date.now = vi.fn(() => 1000000000 * 1000);

    const result = decodeJWT(tokenWithSpecialChars);

    expect(result).toBeTruthy();
    expect(result?.name).toContain("Nguyễn");
  });

  it("should handle token with exp as 0", () => {
    // JWT with payload: { sub: 123, exp: 0 }
    const tokenWithZeroExp =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMywiZXhwIjowfQ.mock";

    Date.now = vi.fn(() => 1000000000 * 1000);

    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = decodeJWT(tokenWithZeroExp);

    // exp: 0 is in the past, should be expired
    expect(result).toBeNull();

    consoleSpy.mockRestore();
  });
});
