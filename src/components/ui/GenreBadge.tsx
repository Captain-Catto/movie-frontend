import Link from "next/link";

interface GenreBadgeProps {
  /** Genre name to display */
  genre: string;
  /** Genre ID (optional, preferred for URL) */
  genreId?: number;
  /** Content type: movie or tv */
  contentType: "movie" | "tv";
  /** Style variant */
  variant?: "default" | "hero" | "detail";
  /** Custom className */
  className?: string;
}

/**
 * Unified genre badge component with proper browse links
 * Links to /browse?type={contentType}&genres={genreId}
 */
export default function GenreBadge({
  genre,
  genreId,
  contentType,
  variant = "default",
  className = "",
}: GenreBadgeProps) {
  // Construct proper browse URL
  const browseUrl = `/browse?type=${contentType}&genres=${
    genreId || encodeURIComponent(genre)
  }`;

  // Variant: Hero (for HeroSection)
  if (variant === "hero") {
    return (
      <Link
        href={browseUrl}
        className={`tag-topic inline-block px-3 py-1 bg-gray-700/80 text-white text-sm rounded hover:bg-red-600 hover:text-white transition-colors cursor-pointer ${className}`}
      >
        {genre}
      </Link>
    );
  }

  // Variant: Detail (for detail pages)
  if (variant === "detail") {
    return (
      <Link
        href={browseUrl}
        className={`px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-red-600 hover:text-white transition-colors cursor-pointer ${className}`}
      >
        {genre}
      </Link>
    );
  }

  // Variant: Default
  return (
    <Link
      href={browseUrl}
      className={`px-3 py-1 bg-gray-800/60 text-white text-sm rounded-full hover:bg-red-600 hover:text-white transition-colors cursor-pointer ${className}`}
    >
      {genre}
    </Link>
  );
}
