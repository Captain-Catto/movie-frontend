'use client';

import { FilterOptions } from './MovieFilters';

interface FilterToggleProps {
  onFilterChange: (filters: FilterOptions) => void;
  className?: string;
}

const FilterToggle = ({ className = "" }: FilterToggleProps) => {
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Bộ lọc chi tiết</h3>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center text-gray-400">
          <p className="mb-2">Bộ lọc nâng cao đã được tích hợp sẵn</p>
          <p className="text-sm">Sử dụng bộ lọc ở trang chính để tìm kiếm phim phù hợp</p>
        </div>
      </div>
    </div>
  );
};

export default FilterToggle;