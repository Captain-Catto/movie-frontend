"use client";

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
  const sortOptions = [
    {
      value: "popularity",
      label: "🔥 Phim đang hot",
    },
    {
      value: "top_rated",
      label: "⭐ Top Rated",
    },
    {
      value: "latest",
      label: "🆕 Phim mới ra mắt",
    },
  ];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <label className="text-gray-300 text-sm font-medium">Sắp xếp theo:</label>
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
