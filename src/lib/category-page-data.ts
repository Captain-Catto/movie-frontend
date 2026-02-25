import type { ApiResponse } from "@/types/api";

export type SearchParamsRecord = Record<
  string,
  string | string[] | undefined
>;

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export function parsePageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return 1;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

export function extractCategoryItems(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data;
    if (Array.isArray(record.results)) return record.results;
  }

  return [];
}

export function extractCategoryPagination(
  response: ApiResponse<unknown>,
  fallbackTotal: number
): { totalPages: number; total: number } {
  const responsePagination =
    response.pagination && typeof response.pagination === "object"
      ? (response.pagination as unknown as Record<string, unknown>)
      : null;

  const dataRecord =
    response.data && typeof response.data === "object"
      ? (response.data as Record<string, unknown>)
      : null;

  const nestedPagination =
    dataRecord?.pagination && typeof dataRecord.pagination === "object"
      ? (dataRecord.pagination as Record<string, unknown>)
      : null;

  const pagination = responsePagination || nestedPagination;

  const totalPages =
    toNumber(pagination?.totalPages) ??
    toNumber(pagination?.total_pages) ??
    1;

  const total =
    toNumber(pagination?.total) ??
    toNumber(pagination?.totalItems) ??
    toNumber(pagination?.total_results) ??
    fallbackTotal;

  return {
    totalPages: totalPages > 0 ? totalPages : 1,
    total: total >= 0 ? total : fallbackTotal,
  };
}
