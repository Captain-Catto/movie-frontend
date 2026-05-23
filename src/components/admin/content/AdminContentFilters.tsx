import { ContentStatusFilter } from "@/hooks/useAdminContent";

export default function AdminContentFilters({
  isTrendingTab,
  filter,
  searchTerm,
  onFilterChange,
  onSearchTermChange,
  onSearch,
}: {
  isTrendingTab: boolean;
  filter: ContentStatusFilter;
  searchTerm: string;
  onFilterChange: (status: ContentStatusFilter) => void;
  onSearchTermChange: (value: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="min-h-[88px] md:min-h-[44px]">
      {!isTrendingTab ? (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-x-2">
            {(["all", "active", "blocked"] as ContentStatusFilter[]).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => onFilterChange(status)}
                className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? "bg-red-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex w-full items-center gap-2 md:w-auto">
            <input
              type="text"
              placeholder="Search content..."
              aria-label="Search content"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSearch();
                }
              }}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 md:w-80"
            />
            <button
              type="button"
              onClick={onSearch}
              className="cursor-pointer px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-300">
          Trending data is fetched from TMDB daily. Use the actions below to hide
          or re-enable specific items in the trending carousel.
        </div>
      )}
    </div>
  );
}
