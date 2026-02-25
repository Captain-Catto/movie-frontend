"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getLocalizedGenreMap,
} from "@/utils/genreMapping";
import type { TableFilterOptions, TableFiltersProps } from "@/types/ui";
import { useLanguage } from "@/contexts/LanguageContext";

export type { TableFilterOptions };

const TableFilters = ({
  onFilterChange,
  onClose,
  className = "",
  showToggle = true,
  initialFilters,
}: TableFiltersProps) => {
  const router = useRouter();
  const { language } = useLanguage();
  const isVietnamese = language.toLowerCase().startsWith("vi");
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

  const labels = useMemo(
    () =>
      isVietnamese
        ? {
            all: "Tat ca",
            filters: "Bo loc",
            country: "Quoc gia",
            type: "Loai",
            genre: "The loai",
            year: "Nam",
            sortBy: "Sap xep",
            selectedYears: "Nam da chon",
            applyFilters: "Ap dung",
            close: "Dong",
            customYearPlaceholder: "Nhap nam + Enter",
          }
        : {
            all: "All",
            filters: "Filters",
            country: "Country",
            type: "Type",
            genre: "Genre",
            year: "Year",
            sortBy: "Sort by",
            selectedYears: "Selected years",
            applyFilters: "Apply Filters",
            close: "Close",
            customYearPlaceholder: "Enter year + Enter",
          },
    [isVietnamese]
  );

  const countries = useMemo(
    () => [
      { value: "", label: labels.all },
      { value: "US", label: isVietnamese ? "My" : "United States" },
      { value: "KR", label: isVietnamese ? "Han Quoc" : "South Korea" },
      { value: "JP", label: isVietnamese ? "Nhat Ban" : "Japan" },
      { value: "CN", label: isVietnamese ? "Trung Quoc" : "China" },
      { value: "VN", label: isVietnamese ? "Viet Nam" : "Vietnam" },
    ],
    [isVietnamese, labels.all]
  );

  const movieTypes = useMemo(
    () => [
      { value: "", label: labels.all },
      { value: "movie", label: isVietnamese ? "Phim le" : "Movie" },
      { value: "tv", label: isVietnamese ? "Phim bo" : "TV Series" },
      { value: "trending", label: "Trending" },
    ],
    [isVietnamese, labels.all]
  );

  // Dynamically get genres based on selected movie type
  const genres = useMemo(() => {
    const mapType =
      filters.movieType === "movie" || filters.movieType === "tv"
        ? filters.movieType
        : undefined;
    const genreMap = getLocalizedGenreMap(language, mapType);

    return [
      { value: "", label: labels.all },
      ...Object.entries(genreMap)
        .map(([id, name]) => ({
          value: id,
          label: name as string,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, language)),
    ];
  }, [filters.movieType, labels.all, language]);

  const years = [
    { value: "", label: labels.all },
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
    {
      value: "popularity",
      label: isVietnamese ? "Pho bien" : "Popular",
    },
    { value: "latest", label: isVietnamese ? "Moi nhat" : "Latest" },
    {
      value: "top_rated",
      label: isVietnamese ? "Danh gia cao" : "Top Rated",
    },
    {
      value: "updated",
      label: isVietnamese ? "Cap nhat gan day" : "Recently Updated",
    },
    { value: "imdb", label: isVietnamese ? "Diem IMDb" : "IMDb Score" },
    { value: "views", label: isVietnamese ? "Xem nhieu" : "Most Viewed" },
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

    // Collapse the filter panel after applying filters
    setIsExpanded(false);
    onClose?.();
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
            <h3 className="text-white font-small text-xs">{labels.filters}</h3>
          </div>
        </div>
      )}

      {/* Filter Content */}
      <div className={`${showToggle && !isExpanded ? "hidden" : "block"} p-4`}>
        {/* Country */}
        <div className="fe-row mb-4">
          <div className="fe-name text-white font-medium mb-2 min-w-[100px]">
            {labels.country}:
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

        {/* Movie Type */}
        <div className="fe-row mb-4">
          <div className="fe-name text-white font-medium mb-2">{labels.type}:</div>
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

        {/* Genre */}
        <div className="fe-row mb-4">
          <div className="fe-name text-white font-medium mb-2">{labels.genre}:</div>
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

        {/* Release Year */}
        <div className="fe-row mb-4">
          <div className="fe-name text-white font-medium mb-2">
            {labels.year}:
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
                  placeholder={labels.customYearPlaceholder}
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
              <div className="text-sm text-gray-400 mb-2">
                {labels.selectedYears}:
              </div>
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

        {/* Sort By */}
        <div className="fe-row mb-6">
          <div className="fe-name text-white font-medium mb-2">
            {labels.sortBy}:
          </div>
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
              className="btn bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <span>{labels.applyFilters}</span>
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
                className="btn bg-transparent border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-4 py-2 rounded-full font-medium transition-colors cursor-pointer"
              >
                {labels.close}
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
