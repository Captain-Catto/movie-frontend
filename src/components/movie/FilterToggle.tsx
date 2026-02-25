'use client';

import { FilterOptions } from './MovieFilters';
import { useLanguage } from "@/contexts/LanguageContext";
import { getFilterToggleUiMessages } from "@/lib/ui-messages";

interface FilterToggleProps {
  onFilterChange: (filters: FilterOptions) => void;
  className?: string;
}

const FilterToggle = ({ className = "" }: FilterToggleProps) => {
  const { language } = useLanguage();
  const labels = getFilterToggleUiMessages(language);

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">{labels.title}</h3>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center text-gray-400">
          <p className="mb-2">{labels.integrated}</p>
          <p className="text-sm">{labels.hint}</p>
        </div>
      </div>
    </div>
  );
};

export default FilterToggle;
