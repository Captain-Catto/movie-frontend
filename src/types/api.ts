// Core API Types - Centralized type definitions for all API interactions

// ===========================
// Pagination (Single type, replaces PaginationData/PaginationInfo/PaginationMeta)
// ===========================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  currentPage?: number;
  totalItems?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  hasNext?: boolean;
  hasPrev?: boolean;
}

// ===========================
// Metadata
// ===========================

export interface MetadataInfo {
  fromCache: boolean;
  totalCastItems?: number;
  totalCrewItems?: number;
  cacheInfo?: Record<string, unknown>;
  isOnDemandSync?: boolean;
  loadedFromCache?: boolean;
  page?: number;
  appliedFilters?: {
    genre: string | null;
    year: number | null;
    language: string;
  };
}

// ===========================
// API Response (Single Source of Truth)
// ===========================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
  error?: string;
  meta?: MetadataInfo;
}
