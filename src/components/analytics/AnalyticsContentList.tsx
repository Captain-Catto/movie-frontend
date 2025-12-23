import Image from "next/image";
import Link from "next/link";
import {
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZE,
  FALLBACK_POSTER,
} from "@/constants/app.constants";
import { formatNumber } from "@/utils/analyticsUtils";
import { exportToCSV } from "@/utils/analyticsUtils";

interface ContentItem {
  id: number | string;
  title: string;
  contentType: string;
  posterPath?: string | null;
  viewCount?: number;
  favoriteCount?: number;
  count?: number;
}

interface AnalyticsContentListProps {
  title: string;
  data: ContentItem[];
  exportFilename: string;
  emptyMessage?: string;
}

export default function AnalyticsContentList({
  title,
  data,
  exportFilename,
  emptyMessage = "No data available",
}: AnalyticsContentListProps) {
  const getHref = (item: ContentItem) => {
    const type =
      item.contentType === "tv_series" || item.contentType === "tv"
        ? "tv"
        : "movie";
    return `/${type}/${item.id}`;
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {data.length > 0 && (
          <button
            onClick={() => exportToCSV(data, exportFilename)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Export
          </button>
        )}
      </div>
      {data.length > 0 ? (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {data.map((item, index) => (
            <Link
              key={`${item.contentType}-${item.id}-${index}`}
              href={getHref(item)}
              className="flex items-center gap-3 p-3 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-colors cursor-pointer"
            >
              <span className="text-2xl font-bold text-gray-500 w-8">
                #{index + 1}
              </span>
              {item.posterPath && (
                <div className="relative w-12 h-18 flex-shrink-0">
                  <Image
                    src={
                      item.posterPath
                        ? `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${item.posterPath}`
                        : FALLBACK_POSTER
                    }
                    alt={item.title}
                    fill
                    className="object-cover rounded"
                    sizes="48px"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">{item.title}</h3>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                  <span className="capitalize">{item.contentType}</span>
                  {item.viewCount !== undefined && (
                    <span>{formatNumber(item.viewCount)} views</span>
                  )}
                  {item.favoriteCount !== undefined && (
                    <span>{formatNumber(item.favoriteCount)} favorites</span>
                  )}
                  {item.count !== undefined && (
                    <span>{formatNumber(item.count)} events</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="h-[400px] flex items-center justify-center text-gray-400">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
