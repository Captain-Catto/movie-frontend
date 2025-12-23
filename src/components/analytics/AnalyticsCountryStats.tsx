import { CountryStats } from "@/types/analytics.types";
import { formatNumber } from "@/utils/analyticsUtils";

interface AnalyticsCountryStatsProps {
  countryStats: CountryStats[];
}

export default function AnalyticsCountryStats({
  countryStats,
}: AnalyticsCountryStatsProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Top Countries</h2>
      {countryStats.length > 0 ? (
        <div className="space-y-2">
          {countryStats.slice(0, 10).map((country, index) => (
            <div
              key={country.country}
              className="flex items-center justify-between p-3 bg-gray-700 rounded"
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-400 font-bold w-6">#{index + 1}</span>
                <span className="text-white font-medium">{country.country}</span>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">
                  {formatNumber(country.count)}
                </p>
                <p className="text-xs text-gray-400">
                  {country.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          No country data available
        </div>
      )}
    </div>
  );
}
