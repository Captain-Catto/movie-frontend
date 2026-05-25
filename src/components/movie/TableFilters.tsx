"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { getLocalizedGenreMap } from "@/utils/genreMapping";
import type { TableFilterOptions, TableFiltersProps } from "@/types/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTableFiltersUiMessages } from "@/lib/ui-messages";

// ----------------- Extracted Subcomponents -----------------

interface FilterSectionRowProps {
  label: string;
  children: React.ReactNode;
}

function FilterSectionRow({ label, children }: FilterSectionRowProps) {
  return (
    <div className="fe-row mb-4">
      <div className="fe-name text-white font-medium mb-2 min-w-[100px]">
        {label}:
      </div>
      <div className="fe-results flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  );
}

interface FilterToggleHeaderProps {
  isExpanded: boolean;
  onToggle: () => void;
  label: string;
}

function FilterToggleHeader({ isExpanded, onToggle, label }: FilterToggleHeaderProps) {
  return (
    <button
      type="button"
      className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-750 transition-colors ${
        isExpanded ? "border-b border-gray-700" : ""
      }`}
      onClick={onToggle}
      aria-expanded={isExpanded}
    >
      <div className="flex items-center gap-x-2">
        <svg
          className="size-4 text-gray-300"
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
        <h3 className="text-white font-small text-xs">{label}</h3>
      </div>
    </button>
  );
}

interface FilterSectionCountryProps {
  label: string;
  countries: { value: string; label: string }[];
  selectedCountries: string[];
  onClick: (value: string) => void;
}

function FilterSectionCountry({
  label,
  countries,
  selectedCountries,
  onClick,
}: FilterSectionCountryProps) {
  return (
    <FilterSectionRow label={label}>
      {countries.map((country) => (
        <button
          type="button"
          key={country.value}
          className={`item px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
            country.value === ""
              ? selectedCountries.length === 0
                ? "bg-red-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              : selectedCountries.includes(country.value)
              ? "bg-red-500 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
          onClick={() => onClick(country.value)}
        >
          {country.label}
        </button>
      ))}
    </FilterSectionRow>
  );
}

interface FilterSectionMovieTypeProps {
  label: string;
  movieTypes: { value: string; label: string }[];
  selectedType: string;
  onClick: (value: string) => void;
}

function FilterSectionMovieType({
  label,
  movieTypes,
  selectedType,
  onClick,
}: FilterSectionMovieTypeProps) {
  return (
    <FilterSectionRow label={label}>
      {movieTypes.map((type) => (
        <button
          type="button"
          key={type.value}
          className={`item px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
            selectedType === type.value
              ? "bg-red-500 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
          onClick={() => onClick(type.value)}
        >
          {type.label}
        </button>
      ))}
    </FilterSectionRow>
  );
}

interface FilterSectionGenreProps {
  label: string;
  genres: { value: string; label: string }[];
  selectedGenres: string[];
  onClick: (value: string) => void;
}

function FilterSectionGenre({
  label,
  genres,
  selectedGenres,
  onClick,
}: FilterSectionGenreProps) {
  return (
    <div className="fe-row mb-4">
      <div className="fe-name text-white font-medium mb-2 min-w-[100px]">
        {label}:
      </div>
      <div className="fe-results flex flex-wrap gap-2 max-h-32 overflow-y-auto">
        {genres.map((genre) => (
          <button
            type="button"
            key={genre.value}
            className={`item px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
              genre.value === ""
                ? selectedGenres.length === 0
                  ? "bg-red-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : selectedGenres.includes(genre.value)
                ? "bg-red-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => onClick(genre.value)}
          >
            {genre.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface FilterSectionYearProps {
  label: string;
  years: { value: string; label: string }[];
  selectedYears: string[];
  customYear: string;
  customYearPlaceholder: string;
  selectedYearsLabel: string;
  onYearClick: (value: string) => void;
  onCustomYearChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCustomYearSubmit: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

function FilterSectionYear({
  label,
  years,
  selectedYears,
  customYear,
  customYearPlaceholder,
  selectedYearsLabel,
  onYearClick,
  onCustomYearChange,
  onCustomYearSubmit,
}: FilterSectionYearProps) {
  return (
    <div className="fe-row mb-4">
      <div className="fe-name text-white font-medium mb-2 min-w-[100px]">
        {label}:
      </div>
      <div className="fe-results flex flex-wrap gap-2 items-center">
        {years.map((year) => (
          <button
            type="button"
            key={year.value}
            className={`item px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
              year.value === ""
                ? selectedYears.length === 0
                  ? "bg-red-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : selectedYears.includes(year.value)
                ? "bg-red-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => onYearClick(year.value)}
          >
            {year.label}
          </button>
        ))}
        <div className="year-input flex items-center ml-4">
          <div className="relative">
            <input
              type="text"
              maxLength={4}
              placeholder={customYearPlaceholder}
              aria-label={customYearPlaceholder}
              value={customYear}
              onChange={onCustomYearChange}
              onKeyPress={onCustomYearSubmit}
              className="form-control bg-gray-700 border border-gray-600 rounded px-8 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-32"
            />
            <div className="search-icon absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg
                className="size-4"
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

      {selectedYears.length > 0 && (
        <div className="mt-3">
          <div className="text-sm text-gray-400 mb-2">
            {selectedYearsLabel}:
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedYears.map((selectedYear) => (
              <span
                key={selectedYear}
                className="inline-flex items-center px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full"
              >
                {selectedYear}
                <button
                  type="button"
                  onClick={() => onYearClick(selectedYear)}
                  className="ml-1 hover:text-blue-300 cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface FilterSectionSortByProps {
  label: string;
  sortOptions: { value: string; label: string }[];
  selectedSort: string;
  onClick: (value: string) => void;
}

function FilterSectionSortBy({
  label,
  sortOptions,
  selectedSort,
  onClick,
}: FilterSectionSortByProps) {
  return (
    <FilterSectionRow label={label}>
      {sortOptions.map((option) => (
        <button
          type="button"
          key={option.value}
          className={`item px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
            selectedSort === option.value
              ? "bg-red-500 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
          onClick={() => onClick(option.value)}
        >
          {option.label}
        </button>
      ))}
    </FilterSectionRow>
  );
}

interface FilterActionsProps {
  applyLabel: string;
  closeLabel: string;
  onApply: () => void;
  onClose?: () => void;
}

function FilterActions({
  applyLabel,
  closeLabel,
  onApply,
  onClose,
}: FilterActionsProps) {
  return (
    <div className="fe-row fe-row-end">
      <div className="fe-name">&nbsp;</div>
      <div className="fe-buttons flex gap-2">
        <button
          type="button"
          onClick={onApply}
          className="btn bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-x-2 cursor-pointer"
        >
          <span>{applyLabel}</span>
          <svg
            className="size-4"
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
            {closeLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ----------------- Main TableFilters Component -----------------

const TableFilters = ({
  onFilterChange,
  onClose,
  className = "",
  showToggle = true,
  initialFilters,
}: TableFiltersProps) => {
  const { push } = useRouter();
  const { language } = useLanguage();
  const labels = getTableFiltersUiMessages(language);
  const [filters, setFilters] = useState<TableFilterOptions>(() => ({
    countries: initialFilters?.countries ?? [],
    movieType: initialFilters?.movieType ?? "",
    genres: initialFilters?.genres ?? [],
    years: initialFilters?.years ?? [],
    customYear: initialFilters?.customYear ?? "",
    sortBy: initialFilters?.sortBy ?? "popularity",
    ratings: initialFilters?.ratings ?? [],
    versions: initialFilters?.versions ?? [],
    qualities: initialFilters?.qualities ?? [],
    languages: initialFilters?.languages ?? [],
  }));
  const [isExpanded, setIsExpanded] = useState(false);
  const prevInitialFiltersRef = useRef(initialFilters);

  if (initialFilters && initialFilters !== prevInitialFiltersRef.current) {
    prevInitialFiltersRef.current = initialFilters;
    setFilters((prev) => ({
      ...prev,
      ...initialFilters,
      ratings: initialFilters.ratings ?? prev.ratings,
      versions: initialFilters.versions ?? prev.versions,
      qualities: initialFilters.qualities ?? prev.qualities,
      languages: initialFilters.languages ?? prev.languages,
    }));
  }

  const countries = useMemo(
    () => [
      { value: "", label: labels.all },
      { value: "US", label: labels.countryUS },
      { value: "KR", label: labels.countryKR },
      { value: "JP", label: labels.countryJP },
      { value: "CN", label: labels.countryCN },
      { value: "VN", label: labels.countryVN },
    ],
    [labels]
  );

  const movieTypes = useMemo(
    () => [
      { value: "", label: labels.all },
      { value: "movie", label: labels.movie },
      { value: "tv", label: labels.tvSeries },
      { value: "trending", label: labels.trending },
    ],
    [labels]
  );

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
      label: labels.popular,
    },
    { value: "latest", label: labels.latest },
    {
      value: "top_rated",
      label: labels.topRated,
    },
    {
      value: "updated",
      label: labels.recentlyUpdated,
    },
    { value: "imdb", label: labels.imdbScore },
    { value: "views", label: labels.mostViewed },
  ];

  const handleMultiFilterClick = (
    key: keyof TableFilterOptions,
    value: string
  ) => {
    if (key === "sortBy" || key === "movieType") {
      if (key === "movieType") {
        setFilters((prev) => ({ ...prev, [key]: value, genres: [] }));
      } else {
        setFilters((prev) => ({ ...prev, [key]: value }));
      }
      return;
    }

    if (value === "") {
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

    const queryString = params.length > 0 ? `?${params.join("&")}` : "";
    push(`/browse${queryString}`);

    if (onFilterChange) {
      onFilterChange(filters);
    }

    setIsExpanded(false);
    onClose?.();
  };

  const handleYearClick = (yearValue: string) => {
    if (yearValue === "") {
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
      {showToggle && (
        <FilterToggleHeader
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
          label={labels.filters}
        />
      )}

      <div className={`${showToggle && !isExpanded ? "hidden" : "block"} p-4`}>
        <FilterSectionCountry
          label={labels.country}
          countries={countries}
          selectedCountries={filters.countries}
          onClick={(val) => handleMultiFilterClick("countries", val)}
        />

        <FilterSectionMovieType
          label={labels.type}
          movieTypes={movieTypes}
          selectedType={filters.movieType}
          onClick={(val) => handleMultiFilterClick("movieType", val)}
        />

        <FilterSectionGenre
          label={labels.genre}
          genres={genres}
          selectedGenres={filters.genres}
          onClick={(val) => handleMultiFilterClick("genres", val)}
        />

        <FilterSectionYear
          label={labels.year}
          years={years}
          selectedYears={filters.years}
          customYear={filters.customYear}
          customYearPlaceholder={labels.customYearPlaceholder}
          selectedYearsLabel={labels.selectedYears}
          onYearClick={handleYearClick}
          onCustomYearChange={handleCustomYearChange}
          onCustomYearSubmit={handleCustomYearSubmit}
        />

        <FilterSectionSortBy
          label={labels.sortBy}
          sortOptions={sortOptions}
          selectedSort={filters.sortBy}
          onClick={(val) => handleMultiFilterClick("sortBy", val)}
        />

        <FilterActions
          applyLabel={labels.applyFilters}
          closeLabel={labels.close}
          onApply={handleApplyFilters}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default TableFilters;
export { TableFilters as MovieFilters };
