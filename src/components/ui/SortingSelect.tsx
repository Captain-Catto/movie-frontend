"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { getSortingSelectUiMessages } from "@/lib/ui-messages";

interface SortingSelectProps {
  value: string;
  onChange: (sortBy: string) => void;
  className?: string;
}

export default function SortingSelect({
  value,
  onChange,
  className = "",
}: SortingSelectProps) {
  const { language } = useLanguage();
  const labels = getSortingSelectUiMessages(language);

  const sortOptions = [
    {
      value: "popularity",
      label: labels.trendingNow,
    },
    {
      value: "top_rated",
      label: labels.topRated,
    },
    {
      value: "latest",
      label: labels.latestReleases,
    },
  ];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <label className="text-gray-300 text-sm font-medium">
        {labels.sortBy}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:border-gray-500 transition-colors"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
