"use client";

import MovieCardSkeleton from "@/components/ui/MovieCardSkeleton";

type PageSkeletonProps = {
  title?: string;
  items?: number;
  columnsClassName?: string;
  showFilters?: boolean;
};

const DEFAULT_COLUMNS =
  "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4";

export default function PageSkeleton({
  title = "Loading",
  items = 16,
  columnsClassName = DEFAULT_COLUMNS,
  showFilters = false,
}: PageSkeletonProps) {
  return (
    <div className="min-h-[60vh] bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <span className="sr-only">{title}</span>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 bg-gray-700/50 animate-pulse rounded-lg" />
            <div className="h-8 w-48 bg-gray-700/60 animate-pulse rounded" />
          </div>
          <div className="h-4 w-64 bg-gray-700/40 animate-pulse rounded" />
        </div>

        {showFilters && (
          <div className="mb-8">
            <div className="h-10 w-40 bg-gray-700/50 animate-pulse rounded mb-3" />
            <div className="h-10 w-full bg-gray-700/40 animate-pulse rounded" />
          </div>
        )}

        <div className={columnsClassName}>
          {Array.from({ length: items }).map((_, idx) => (
            <MovieCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}
