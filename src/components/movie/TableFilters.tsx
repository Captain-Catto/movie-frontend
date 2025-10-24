"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

// TMDB Genre mapping to English names
const TMDB_MOVIE_ENGLISH_GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

const TMDB_TV_ENGLISH_GENRE_MAP: Record<number, string> = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
};

export interface TableFilterOptions {
  countries: string[];
  movieType: string;
  genres: string[];
  years: string[];
  customYear: string;
  sortBy: string;
  ratings?: string[];
  versions?: string[];
  qualities?: string[];
  languages?: string[];
}

interface TableFiltersProps {
  onFilterChange?: (filters: TableFilterOptions) => void;
  onClose?: () => void;
  className?: string;
  showToggle?: boolean;
  initialFilters?: TableFilterOptions;
}

const TableFilters = ({
  onFilterChange,
  onClose,
  className = "",
  showToggle = true,
  initialFilters,
}: TableFiltersProps) => {
  const router = useRouter();
  const [filters, setFilters] = useState<TableFilterOptions>({
    countries: [],
    movieType: "",
    genres: [],
    years: [],
    customYear: "",
    sortBy: "popularity",
    ratings: [],
    versions: [],
    qualities: [],
    languages: [],
  });
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync with initialFilters from URL parameters
  useEffect(() => {
    if (initialFilters) {
      setFilters((prev) => ({
        ...prev,
        ...initialFilters,
        ratings: initialFilters.ratings ?? prev.ratings,
        versions: initialFilters.versions ?? prev.versions,
        qualities: initialFilters.qualities ?? prev.qualities,
        languages: initialFilters.languages ?? prev.languages,
      }));
    }
  }, [initialFilters]);

  const countries = [
    { value: "", label: "All" },
    { value: "US", label: "United States" },
    { value: "KR", label: "South Korea" },
    { value: "JP", label: "Japan" },
    { value: "CN", label: "China" },
    { value: "VN", label: "Vietnam" },
  ];

  const movieTypes = [
    { value: "", label: "All" },
    { value: "movie", label: "Movie" },
    { value: "tv", label: "TV Series" },
  ];

  // Dynamically get genres based on selected movie type
  const genres = useMemo(() => {
    let genreMap = {};

    if (filters.movieType === "movie") {
      genreMap = TMDB_MOVIE_ENGLISH_GENRE_MAP;
    } else if (filters.movieType === "tv") {
      genreMap = TMDB_TV_ENGLISH_GENRE_MAP;
    } else {
      // If no type selected or "All", show both movie and TV genres
      genreMap = {
        ...TMDB_MOVIE_ENGLISH_GENRE_MAP,
        ...TMDB_TV_ENGLISH_GENRE_MAP,
      };
    }

    return [
      { value: "", label: "All" },
      ...Object.entries(genreMap)
        .map(([id, name]) => ({
          value: id,
          label: name as string,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [filters.movieType]);

  const years = [
    { value: "", label: "All" },
    { value: "2025", label: "2025" },
    { value: "2024", label: "2024" },
    { value: "2023", label: "2023" },
    { value: "2022", label: "2022" },
    { value: "2021", label: "2021" },
    { value: "2020", label: "2020" },
    { value: "2019", label: "2019" },
    { value: "2018", label: "2018" },
    { value: "2017", label: "2017" },
    { value: "2016", label: "2016" },
    { value: "2015", label: "2015" },
    { value: "2014", label: "2014" },
    { value: "2013", label: "2013" },
    { value: "2012", label: "2012" },
    { value: "2011", label: "2011" },
    { value: "2010", label: "2010" },
  ];

  const sortOptions = [
    { value: "popularity", label: "Phổ biến" },
    { value: "latest", label: "Mới nhất" },
    { value: "top_rated", label: "Đánh giá cao" },
    { value: "updated", label: "Mới cập nhật" },
    { value: "imdb", label: "Điểm IMDb" },
    { value: "views", label: "Lượt xem" },
  ];

  const handleMultiFilterClick = (
    key: keyof TableFilterOptions,
    value: string
  ) => {
    if (key === "sortBy" || key === "movieType") {
      // Sort by and movie type are single selection
      if (key === "movieType") {
        // Clear selected genres when movie type changes to avoid invalid genre combinations
        setFilters((prev) => ({ ...prev, [key]: value, genres: [] }));
      } else {
        setFilters((prev) => ({ ...prev, [key]: value }));
      }
      return;
    }

    if (value === "") {
      // "All" - clear all selections for this category
      setFilters((prev) => ({ ...prev, [key]: [] }));
    } else {
      const currentValues = filters[key] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      setFilters((prev) => ({ ...prev, [key]: newValues }));
    }
  };

  const handleApplyFilters = () => {
    // Navigate to browse page with filter parameters
    const params: string[] = [];

    if (filters.countries.length > 0) {
      params.push(`countries=${filters.countries.join(",")}`);
    }
    if (filters.movieType) {
      params.push(`type=${filters.movieType}`);
    }
    if (filters.genres.length > 0) {
      params.push(`genres=${filters.genres.join(",")}`);
    }
    if (filters.years.length > 0) {
      params.push(`years=${filters.years.join(",")}`);
    }
    if (filters.sortBy && filters.sortBy !== "popularity") {
      params.push(`sortBy=${filters.sortBy}`);
    }

    // Navigate to browse page with params
    const queryString = params.length > 0 ? `?${params.join("&")}` : "";
    router.push(`/browse${queryString}`);

    // Call the optional onFilterChange callback if provided
    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  const handleYearClick = (yearValue: string) => {
    if (yearValue === "") {
      // "All" - clear all years
      setFilters((prev) => ({ ...prev, years: [], customYear: "" }));
    } else {
      const newYears = filters.years.includes(yearValue)
        ? filters.years.filter((y) => y !== yearValue)
        : [...filters.years, yearValue];
      setFilters((prev) => ({ ...prev, years: newYears }));
    }
  };

  const handleCustomYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, customYear: value }));
  };

  const handleCustomYearSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filters.customYear) {
      const year = filters.customYear;
      if (!filters.years.includes(year)) {
        setFilters((prev) => ({
          ...prev,
          years: [...prev.years, year],
          customYear: "",
        }));
      }
    }
  };

  return (
    <div
      className={`filter-elements bg-gray-800 rounded-lg ${
        showToggle && !isExpanded ? "inline-block" : ""
      } ${className}`}
    >
      {/* Filter Toggle Header */}
      {showToggle && (
        <div
          className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-750 transition-colors ${
            isExpanded ? "border-b border-gray-700" : ""
          }`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            {/* Filter Icon */}
            <svg
              className="w-4 h-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <h3 className="text-white font-small text-xs">Bộ lọc</h3>
          </div>
        </div>
      )}

      {/* Filter Content */}
      <div className={`${showToggle && !isExpanded ? "hidden" : "block"} p-4`}>
        {/* Quốc gia */}
        <div className="fe-row mb-4">
          <div className="fe-name text-white font-medium mb-2 min-w-[100px]">
            Quốc gia:
          </div>
          <div className="fe-results flex flex-wrap gap-2">
            {countries.map((country) => (
              <div
                key={country.value}
                className={`item px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                  country.value === ""
                    ? filters.countries.length === 0
                      ? "bg-red-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : filters.countries.includes(country.value)
                    ? "bg-red-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() =>
                  handleMultiFilterClick("countries", country.value)
                }
              >
                {country.label}
              </div>
            ))}
          </div>
        </div>

        {/* Loại phim */}
        <div className="fe-row mb-4">
          <div className="fe-name text-white font-medium mb-2">Loại phim:</div>
          <div className="fe-results flex flex-wrap gap-2">
            {movieTypes.map((type) => (
              <div
                key={type.value}
                className={`item px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                  filters.movieType === type.value
                    ? "bg-red-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => handleMultiFilterClick("movieType", type.value)}
              >
                {type.label}
              </div>
            ))}
          </div>
        </div>

        {/* Thể loại */}
        <div className="fe-row mb-4">
          <div className="fe-name text-white font-medium mb-2">Thể loại:</div>
          <div className="fe-results flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {genres.map((genre) => (
              <div
                key={genre.value}
                className={`item px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                  genre.value === ""
                    ? filters.genres.length === 0
                      ? "bg-red-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : filters.genres.includes(genre.value)
                    ? "bg-red-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => handleMultiFilterClick("genres", genre.value)}
              >
                {genre.label}
              </div>
            ))}
          </div>
        </div>

        {/* Năm sản xuất */}
        <div className="fe-row mb-4">
          <div className="fe-name text-white font-medium mb-2">
            Năm sản xuất:
          </div>
          <div className="fe-results flex flex-wrap gap-2 items-center">
            {years.map((year) => (
              <div
                key={year.value}
                className={`item px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                  year.value === ""
                    ? filters.years.length === 0
                      ? "bg-red-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : filters.years.includes(year.value)
                    ? "bg-red-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => handleYearClick(year.value)}
              >
                {year.label}
              </div>
            ))}
            <div className="year-input flex items-center ml-4">
              <div className="relative">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Nhập năm + Enter"
                  value={filters.customYear}
                  onChange={handleCustomYearChange}
                  onKeyPress={handleCustomYearSubmit}
                  className="form-control bg-gray-700 border border-gray-600 rounded px-8 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-32"
                />
                <div className="search-icon absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Years Display */}
          {filters.years.length > 0 && (
            <div className="mt-3">
              <div className="text-sm text-gray-400 mb-2">Năm đã chọn:</div>
              <div className="flex flex-wrap gap-2">
                {filters.years.map((selectedYear) => (
                  <span
                    key={selectedYear}
                    className="inline-flex items-center px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full"
                  >
                    {selectedYear}
                    <button
                      onClick={() => handleYearClick(selectedYear)}
                      className="ml-1 hover:text-blue-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sắp xếp */}
        <div className="fe-row mb-6">
          <div className="fe-name text-white font-medium mb-2">Sắp xếp:</div>
          <div className="fe-results flex flex-wrap gap-2">
            {sortOptions.map((option) => (
              <div
                key={option.value}
                className={`item px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                  filters.sortBy === option.value
                    ? "bg-red-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => handleMultiFilterClick("sortBy", option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="fe-row fe-row-end">
          <div className="fe-name">&nbsp;</div>
          <div className="fe-buttons flex gap-2">
            <button
              type="button"
              onClick={handleApplyFilters}
              className="btn bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center space-x-2"
            >
              <span>Lọc kết quả</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="btn bg-transparent border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-4 py-2 rounded-full font-medium transition-colors"
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableFilters;
export { TableFilters as MovieFilters };
export type { TableFilterOptions as FilterOptions };
