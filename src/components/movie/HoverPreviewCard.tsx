import Link from "next/link";
import Image from "next/image";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import { Play, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface HoverPreviewCardProps {
  title: string;
  subtitle?: string;
  image: string;
  watchHref: string;
  detailHref: string;
  rating?: string | number | null;
  year?: string | number | null;
  overview?: string | null;
  contentType?: "movie" | "tv";
  genreIds?: number[];
  genreNames?: string[];
  favoriteButton?: {
    id: number | string;
    tmdbId?: number;
    title: string;
    poster_path?: string;
    vote_average?: number;
    media_type?: "movie" | "tv";
    overview?: string;
    genres?: Array<{ id: number; name: string }> | string[];
    className?: string;
    activeClassName?: string;
    size?: "default" | "compact";
    iconOnly?: boolean;
  };
  className?: string;
  placement?: "center" | "left" | "right";
}

/**
 * Reusable desktop hover card (96rem wide) used for recommendation/tooltips.
 */
export function HoverPreviewCard({
  title,
  image,
  watchHref,
  detailHref,
  rating,
  year,
  overview,
  contentType = "movie",
  genreIds,
  genreNames,
  favoriteButton,
  className,
  placement = "center",
}: HoverPreviewCardProps) {
  const displayRating =
    typeof rating === "number"
      ? rating > 0
        ? rating.toFixed(1)
        : null
      : rating || null;

  const displayYear =
    typeof year === "number"
      ? year
      : year && !Number.isNaN(Number(year))
      ? Number(year)
      : null;

  const placementClasses =
    placement === "left"
      ? "left-0 translate-x-0"
      : placement === "right"
      ? "right-0 translate-x-0"
      : "left-1/2 -translate-x-1/2";

  return (
    <div
      className={cn(
        "w-96 bg-gray-900 rounded-xl shadow-2xl overflow-hidden",
        "transition-all duration-300 transform scale-95 group-hover:scale-100",
        "opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto",
        "absolute top-1/2 -translate-y-1/2 z-30",
        placementClasses,
        className
      )}
    >
      <div className="relative h-52">
        <Image
          src={image}
          alt={title}
          fill
          sizes="384px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
      </div>

      <div className="p-5 space-y-4">
        <div className="text-center space-y-1">
          <h3 className="text-white font-bold text-lg line-clamp-2">{title}</h3>
          {overview && (
            <span className="bg-gray-800 text-gray-200 px-2 py-1 rounded text-[11px] font-medium line-clamp-2">
              {overview}
            </span>
          )}
        </div>

        <div className="flex space-x-2">
          <Link
            href={watchHref}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            Watch
          </Link>

          {favoriteButton && (
            <FavoriteButton
              movie={{
                id: favoriteButton.id,
                tmdbId: favoriteButton.tmdbId ?? Number(favoriteButton.id),
                title: favoriteButton.title,
                poster_path: favoriteButton.poster_path,
                vote_average: favoriteButton.vote_average,
                media_type: favoriteButton.media_type ?? contentType,
                overview: favoriteButton.overview,
                genres: favoriteButton.genres,
              }}
              iconOnly
              size={favoriteButton.size ?? "compact"}
              className={cn(
                "!w-auto !h-auto !p-2 !rounded font-semibold text-xs",
                "!bg-gray-700 hover:!bg-gray-600",
                "[data-state=on]:!bg-red-500 [data-state=on]:hover:!bg-red-600 [data-state=on]:!text-white",
                favoriteButton.className
              )}
              activeClassName={favoriteButton.activeClassName}
            />
          )}

          <Link
            href={detailHref}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Info className="w-4 h-4" />
            Details
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {displayRating && (
            <span className="bg-yellow-500 text-black px-2 py-1 rounded flex items-center space-x-1 font-bold text-xs">
              <span>★</span>
              <span>{displayRating}</span>
            </span>
          )}
          {displayYear && (
            <span className="bg-gray-700 text-white px-2 py-1 rounded font-medium text-xs">
              {displayYear}
            </span>
          )}
          {/* Prefer links when we have IDs; otherwise show names as static badges */}
          {genreIds && genreIds.length > 0
            ? genreIds.slice(0, 3).map((id, idx) => {
                const name = genreNames?.[idx];
                const label = name || `Genre ${id}`;
                return (
                  <Link
                    key={id}
                    href={`/browse?genres=${id}&type=${contentType}`}
                    className="bg-gray-800 text-gray-200 px-2 py-1 rounded text-[11px] font-medium hover:bg-gray-700 transition-colors"
                  >
                    {label}
                  </Link>
                );
              })
            : genreNames &&
              genreNames.slice(0, 3).map((name, idx) => (
                <span
                  key={`${name}-${idx}`}
                  className="bg-gray-800 text-gray-200 px-2 py-1 rounded text-[11px] font-medium"
                >
                  {name}
                </span>
              ))}
        </div>
      </div>
    </div>
  );
}
