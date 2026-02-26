/**
 * Force TMDB image URLs to a target size segment (e.g. w500, w780).
 * Keeps non-TMDB URLs untouched.
 */
export function normalizeTmdbImageUrl(
  url: string | null | undefined,
  targetSize: string
): string | undefined {
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "image.tmdb.org") {
      return url;
    }

    const segments = parsed.pathname.split("/");
    const pIndex = segments.findIndex((segment) => segment === "p");
    const sizeIndex = pIndex + 1;

    if (pIndex === -1 || sizeIndex >= segments.length) {
      return url;
    }

    segments[sizeIndex] = targetSize;
    parsed.pathname = segments.join("/");
    return parsed.toString();
  } catch {
    return url;
  }
}
