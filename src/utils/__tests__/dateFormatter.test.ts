import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  parseDate,
  formatDateTime,
  formatDate,
  formatTime,
  formatDateTimeWithZone,
  formatRelativeTime,
  formatDateTimeVN,
  getUserTimezone,
  isToday,
  isYesterday,
} from "../dateFormatter";

describe("parseDate", () => {
  it("should parse valid ISO date strings", () => {
    const date = parseDate("2025-01-15T10:30:00Z");
    expect(date).toBeInstanceOf(Date);
    expect(date?.toISOString()).toBe("2025-01-15T10:30:00.000Z");
  });

  it("should parse Date objects", () => {
    const now = new Date();
    const parsed = parseDate(now);
    expect(parsed).toBeInstanceOf(Date);
    expect(parsed?.getTime()).toBe(now.getTime());
  });

  it("should return null for invalid dates", () => {
    expect(parseDate("invalid-date")).toBeNull();
    expect(parseDate("")).toBeNull();
  });

  it("should return null for null/undefined", () => {
    expect(parseDate(null)).toBeNull();
    expect(parseDate(undefined)).toBeNull();
  });

  it("should handle various date formats", () => {
    expect(parseDate("2025-01-15")).toBeInstanceOf(Date);
    expect(parseDate("2025-01-15T10:30:00")).toBeInstanceOf(Date);
    expect(parseDate("2025-01-15T10:30:00.000Z")).toBeInstanceOf(Date);
  });

  it("should return null for invalid Date object", () => {
    const invalidDate = new Date("invalid");
    expect(parseDate(invalidDate)).toBeNull();
  });
});

describe("formatDateTime", () => {
  it("should format valid dates", () => {
    const date = "2025-01-15T10:30:00Z";
    const formatted = formatDateTime(date);
    expect(formatted).toContain("2025");
    expect(formatted).not.toBe("Unknown date");
  });

  it("should use custom format string", () => {
    const date = "2025-01-15T10:30:00Z";
    const formatted = formatDateTime(date, "yyyy-MM-dd");
    expect(formatted).toBe("2025-01-15");
  });

  it('should return "Unknown date" for null/undefined', () => {
    expect(formatDateTime(null)).toBe("Unknown date");
    expect(formatDateTime(undefined)).toBe("Unknown date");
  });

  it('should return "Invalid date" for invalid dates', () => {
    expect(formatDateTime("invalid-date")).toBe("Unknown date");
  });
});

describe("formatDate", () => {
  it("should format date without time", () => {
    const date = "2025-01-15T10:30:00Z";
    const formatted = formatDate(date);
    expect(formatted).toContain("2025");
    expect(formatted).not.toContain(":");
  });

  it('should return "Unknown date" for invalid input', () => {
    expect(formatDate(null)).toBe("Unknown date");
  });
});

describe("formatTime", () => {
  it("should format time without date", () => {
    const date = "2025-01-15T10:30:00Z";
    const formatted = formatTime(date);
    // Should contain time format (AM/PM or 24h)
    expect(formatted).not.toBe("Unknown date");
  });

  it('should return "Unknown date" for invalid input', () => {
    expect(formatTime(null)).toBe("Unknown date");
  });
});

describe("formatDateTimeWithZone", () => {
  it("should format date with timezone", () => {
    const date = "2025-01-15T10:30:00Z";
    const formatted = formatDateTimeWithZone(date);
    expect(formatted).toContain("2025");
    expect(formatted).not.toBe("Unknown date");
  });

  it('should return "Unknown date" for invalid input', () => {
    expect(formatDateTimeWithZone(null)).toBe("Unknown date");
  });
});

describe("formatRelativeTime", () => {
  beforeEach(() => {
    // Mock current time to a fixed point for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return 'just now' for very recent dates", () => {
    const thirtySecondsAgo = new Date("2025-01-15T11:59:30Z");
    expect(formatRelativeTime(thirtySecondsAgo)).toBe("just now");
  });

  it("should return 'just now' for future dates", () => {
    const future = new Date("2025-01-15T12:30:00Z");
    expect(formatRelativeTime(future)).toBe("just now");
  });

  it("should format minutes ago", () => {
    const fiveMinutesAgo = new Date("2025-01-15T11:55:00Z");
    expect(formatRelativeTime(fiveMinutesAgo)).toBe("5 minutes ago");

    const oneMinuteAgo = new Date("2025-01-15T11:59:00Z");
    expect(formatRelativeTime(oneMinuteAgo)).toBe("1 minute ago");
  });

  it("should format hours ago", () => {
    const twoHoursAgo = new Date("2025-01-15T10:00:00Z");
    expect(formatRelativeTime(twoHoursAgo)).toBe("2 hours ago");

    const oneHourAgo = new Date("2025-01-15T11:00:00Z");
    expect(formatRelativeTime(oneHourAgo)).toBe("1 hour ago");
  });

  it("should format days ago", () => {
    const twoDaysAgo = new Date("2025-01-13T12:00:00Z");
    expect(formatRelativeTime(twoDaysAgo)).toBe("2 days ago");

    const oneDayAgo = new Date("2025-01-14T12:00:00Z");
    expect(formatRelativeTime(oneDayAgo)).toBe("1 day ago");
  });

  it("should use date-fns for dates older than 7 days", () => {
    const tenDaysAgo = new Date("2025-01-05T12:00:00Z");
    const formatted = formatRelativeTime(tenDaysAgo);
    expect(formatted).toContain("ago");
    expect(formatted).not.toBe("Unknown time");
  });

  it('should return "Unknown time" for invalid input', () => {
    expect(formatRelativeTime(null)).toBe("Unknown time");
    expect(formatRelativeTime(undefined)).toBe("Unknown time");
  });
});

describe("formatDateTimeVN", () => {
  it("should format date in Vietnamese locale", () => {
    const date = "2025-01-15T10:30:00Z";
    const formatted = formatDateTimeVN(date);
    expect(formatted).toContain("2025");
    expect(formatted).not.toBe("Không rõ thời gian");
  });

  it('should return "Không rõ thời gian" for invalid input', () => {
    expect(formatDateTimeVN(null)).toBe("Không rõ thời gian");
  });
});

describe("getUserTimezone", () => {
  it("should return a timezone string", () => {
    const timezone = getUserTimezone();
    expect(typeof timezone).toBe("string");
    expect(timezone.length).toBeGreaterThan(0);
  });

  it("should return a valid IANA timezone", () => {
    const timezone = getUserTimezone();
    // Common timezones or UTC fallback
    expect(timezone).toMatch(/^[A-Za-z_\/]+$/);
  });
});

describe("isToday", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return true for today's date", () => {
    const today = new Date("2025-01-15T08:00:00Z");
    expect(isToday(today)).toBe(true);
  });

  it("should return false for yesterday", () => {
    const yesterday = new Date("2025-01-14T12:00:00Z");
    expect(isToday(yesterday)).toBe(false);
  });

  it("should return false for tomorrow", () => {
    const tomorrow = new Date("2025-01-16T12:00:00Z");
    expect(isToday(tomorrow)).toBe(false);
  });

  it("should return false for null/undefined", () => {
    expect(isToday(null)).toBe(false);
    expect(isToday(undefined)).toBe(false);
  });
});

describe("isYesterday", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return true for yesterday's date", () => {
    const yesterday = new Date("2025-01-14T12:00:00Z");
    expect(isYesterday(yesterday)).toBe(true);
  });

  it("should return false for today", () => {
    const today = new Date("2025-01-15T12:00:00Z");
    expect(isYesterday(today)).toBe(false);
  });

  it("should return false for two days ago", () => {
    const twoDaysAgo = new Date("2025-01-13T12:00:00Z");
    expect(isYesterday(twoDaysAgo)).toBe(false);
  });

  it("should return false for null/undefined", () => {
    expect(isYesterday(null)).toBe(false);
    expect(isYesterday(undefined)).toBe(false);
  });
});
