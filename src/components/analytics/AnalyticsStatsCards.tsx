import { formatCompactNumber } from "@/utils/analyticsUtils";
import { useCountUp } from "@/hooks/useCountUp";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAdminUiMessages } from "@/lib/ui-messages";

interface AnalyticsStatsCardsProps {
  totalViews: number;
  totalClicks: number;
  totalPlays: number;
  totalFavorites: number;
  ctr: number;
  favRate: number;
  loading: boolean;
}

export default function AnalyticsStatsCards({
  totalViews,
  totalClicks,
  totalPlays,
  totalFavorites,
  ctr,
  favRate,
  loading,
}: AnalyticsStatsCardsProps) {
  const { language } = useLanguage();
  const labels = getAdminUiMessages(language);
  const animViews = useCountUp(totalViews, { duration: 650 });
  const animClicks = useCountUp(totalClicks, { duration: 650 });
  const animPlays = useCountUp(totalPlays, { duration: 650 });
  const animFavorites = useCountUp(totalFavorites, { duration: 650 });
  const animCtr = useCountUp(ctr, { duration: 650, decimals: 1 });
  const animFavRate = useCountUp(favRate, { duration: 650, decimals: 1 });

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-lg p-4 bg-gray-800/80 border border-gray-700 animate-pulse space-y-3 min-h-[120px]"
          >
            <div className="h-4 w-24 bg-gray-700 rounded" />
            <div className="h-8 w-20 bg-gray-600 rounded" />
            <div className="h-3 w-28 bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-white shadow-lg">
        <p className="text-xs text-gray-300">{labels.totalViews}</p>
        <p className="text-2xl font-bold mt-2">
          {formatCompactNumber(animViews)}
        </p>
        <p className="text-[11px] text-gray-400 mt-1">{labels.analyticsEventsView}</p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-white shadow-lg">
        <p className="text-xs text-gray-300">{labels.totalClicks}</p>
        <p className="text-2xl font-bold mt-2">
          {formatCompactNumber(animClicks)}
        </p>
        <p className="text-[11px] text-gray-400 mt-1">{labels.analyticsEventsClick}</p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-white shadow-lg">
        <p className="text-xs text-gray-300">{labels.totalPlays}</p>
        <p className="text-2xl font-bold mt-2">
          {formatCompactNumber(animPlays)}
        </p>
        <p className="text-[11px] text-gray-400 mt-1">{labels.analyticsEventsPlay}</p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-white shadow-lg">
        <p className="text-xs text-gray-300">{labels.ctr}</p>
        <p className="text-2xl font-bold mt-2">{animCtr.toFixed(1)}%</p>
        <p className="text-[11px] text-gray-400 mt-1">{labels.analyticsClicksOverViews}</p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-white shadow-lg">
        <p className="text-xs text-gray-300">{labels.favorites}</p>
        <p className="text-2xl font-bold mt-2">
          {formatCompactNumber(animFavorites)}
        </p>
        <p className="text-[11px] text-gray-400 mt-1">{labels.analyticsSavedItems}</p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-white shadow-lg">
        <p className="text-xs text-gray-300">{labels.favoriteRate}</p>
        <p className="text-2xl font-bold mt-2">{animFavRate.toFixed(1)}%</p>
        <p className="text-[11px] text-gray-400 mt-1">{labels.analyticsFavoritesOverViews}</p>
      </div>
    </div>
  );
}
