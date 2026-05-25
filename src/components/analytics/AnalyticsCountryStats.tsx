import { CountryStats } from "@/types/analytics.types";
import { formatNumber } from "@/utils/analyticsUtils";
import { exportToCSV } from "@/utils/analyticsUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAdminUiMessages } from "@/lib/ui-messages";

interface AnalyticsCountryStatsProps {
  countryStats: CountryStats[];
}

export default function AnalyticsCountryStats({
  countryStats,
}: AnalyticsCountryStatsProps) {
  const { language } = useLanguage();
  const labels = getAdminUiMessages(language);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">{labels.analyticsTopCountries}</h2>
        {countryStats.length > 0 && (
          <button
            type="button"
            onClick={() => exportToCSV(countryStats, "top-countries")}
            className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            {labels.analyticsExport}
          </button>
        )}
      </div>
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
          {labels.analyticsNoCountryData}
        </div>
      )}
    </div>
  );
}
