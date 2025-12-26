"use client";

import React from "react";
import { Film, Tv, Grid3X3 } from "lucide-react";

interface SearchTabsProps {
  selectedType: "movie" | "tv" | "all";
  onTypeChange: (type: "movie" | "tv" | "all") => void;
}

const SearchTabs: React.FC<SearchTabsProps> = ({
  selectedType,
  onTypeChange,
}) => {
  const tabs = [
    {
      id: "all" as const,
      label: "All",
      icon: Grid3X3,
    },
    {
      id: "movie" as const,
      label: "Movies",
      icon: Film,
    },
    {
      id: "tv" as const,
      label: "TV Series",
      icon: Tv,
    },
  ];

  return (
    <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = selectedType === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTypeChange(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-red-500 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SearchTabs;
