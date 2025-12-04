// Shared helpers for normalizing rating values across pages
export function normalizeRatingValue(value: unknown): number {
  const num = Number(value);
  if (Number.isFinite(num) && num >= 0) return parseFloat(num.toFixed(1));
  return 0;
}

export function normalizeRatingFromSource(
  primary: unknown,
  source?: Record<string, unknown>
): number {
  const candidates = [
    primary,
    source?.rating,
    source?.score,
    source?.voteAverage,
    source?.vote_average,
  ];

  for (const value of candidates) {
    const num = Number(value);
    if (Number.isFinite(num) && num >= 0) {
      return normalizeRatingValue(num);
    }
  }

  return 0;
}
