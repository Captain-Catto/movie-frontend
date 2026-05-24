import type { ImageLoaderProps } from "next/image";

const TMDB_SIZE_BREAKPOINTS: [number, string][] = [
  [92, "w92"],
  [154, "w154"],
  [185, "w185"],
  [342, "w342"],
  [500, "w500"],
  [780, "w780"],
];

export function tmdbImageLoader({ src, width }: ImageLoaderProps): string {
  if (!src.includes("image.tmdb.org")) return src;

  const size =
    TMDB_SIZE_BREAKPOINTS.find(([bp]) => width <= bp)?.[1] ?? "original";

  return src.replace(/\/w\d+\/|\/original\//, `/${size}/`);
}
