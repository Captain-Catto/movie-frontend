/**
 * Date Formatting Utilities with Timezone Support
 * Automatically converts UTC dates from backend to user's local timezone
 */

import { formatDistanceToNow, format, isValid, parseISO } from 'date-fns';
import { getLocaleFromLanguage } from '@/constants/app.constants';

/**
 * Safely parse date string/Date object to Date
 * Backend sends UTC, browser automatically converts to local timezone
 */
export const parseDate = (dateInput: string | Date | null | undefined): Date | null => {
  if (!dateInput) return null;

  try {
    if (dateInput instanceof Date) {
      return isValid(dateInput) ? dateInput : null;
    }

    // Parse ISO string from backend (UTC)
    const parsed = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
    return isValid(parsed) ? parsed : null;
  } catch (error) {
    console.error('❌ Date parsing error:', error);
    return null;
  }
};

/**
 * Format date to localized string (user's timezone)
 * @param dateInput - UTC date from backend
 * @param formatStr - Format string (default: 'PPpp' = Dec 4, 2025, 2:30 PM)
 */
export const formatDateTime = (
  dateInput: string | Date | null | undefined,
  formatStr: string = 'PPpp'
): string => {
  const date = parseDate(dateInput);
  if (!date) return 'Unknown date';

  try {
    return format(date, formatStr);
  } catch (error) {
    console.error('❌ Date formatting error:', error);
    return 'Invalid date';
  }
};

/**
 * Format date only (no time) in user's timezone
 * @param dateInput - UTC date from backend
 */
export const formatDate = (dateInput: string | Date | null | undefined): string => {
  return formatDateTime(dateInput, 'PP'); // Dec 4, 2025
};

/**
 * Format time only (no date) in user's timezone
 * @param dateInput - UTC date from backend
 */
export const formatTime = (dateInput: string | Date | null | undefined): string => {
  return formatDateTime(dateInput, 'p'); // 2:30 PM
};

/**
 * Format date and time with timezone indicator
 * @param dateInput - UTC date from backend
 */
export const formatDateTimeWithZone = (dateInput: string | Date | null | undefined): string => {
  const date = parseDate(dateInput);
  if (!date) return 'Unknown date';

  try {
    // Use browser's Intl API for timezone-aware formatting
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  } catch (error) {
    console.error('❌ Date formatting with zone error:', error);
    return 'Invalid date';
  }
};

/**
 * Format as relative time ("2 hours ago", "just now", etc.) in user's timezone
 * @param dateInput - UTC date from backend
 */
export const formatRelativeTime = (dateInput: string | Date | null | undefined): string => {
  const date = parseDate(dateInput);
  if (!date) return 'Unknown time';

  try {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // Handle future dates
    if (diffInMinutes < 0) {
      return 'just now';
    }

    // Custom relative time for recent dates
    if (diffInMinutes < 1) {
      return 'just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    // Use date-fns for older dates
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('❌ Relative time formatting error:', error);
    return 'Unknown time';
  }
};

/**
 * Format for Vietnamese locale (optional - legacy support)
 * @param dateInput - UTC date from backend
 * @deprecated Use formatDateTime instead
 */
export const formatDateTimeVN = (dateInput: string | Date | null | undefined): string => {
  const date = parseDate(dateInput);
  if (!date) return 'Không rõ thời gian';

  try {
    return date.toLocaleString(getLocaleFromLanguage('vi'), {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch (error) {
    console.error('❌ Vietnamese date formatting error:', error);
    return 'Thời gian không hợp lệ';
  }
};

/**
 * Get user's timezone
 */
export const getUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('❌ Cannot detect timezone:', error);
    return 'UTC';
  }
};

/**
 * Check if date is today (in user's timezone)
 */
export const isToday = (dateInput: string | Date | null | undefined): boolean => {
  const date = parseDate(dateInput);
  if (!date) return false;

  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if date is yesterday (in user's timezone)
 */
export const isYesterday = (dateInput: string | Date | null | undefined): boolean => {
  const date = parseDate(dateInput);
  if (!date) return false;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};
