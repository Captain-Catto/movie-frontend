"use client";

export default function AnalyticsSkeleton() {
  const card = (w = "w-full") => (
    <div className={`bg-gray-800/60 border border-gray-700 rounded-xl p-4 space-y-3 animate-pulse ${w}`}>
      <div className="h-4 bg-gray-700 rounded w-1/3" />
      <div className="h-6 bg-gray-700 rounded w-1/2" />
      <div className="h-3 bg-gray-700 rounded w-2/3" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 animate-pulse space-y-3">
            <div className="h-4 bg-gray-700 rounded w-1/3" />
            <div className="h-8 bg-gray-700 rounded w-1/2" />
            <div className="h-3 bg-gray-700 rounded w-2/3" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {card()} {card()}
      </div>

      <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/4 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="h-20 bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
