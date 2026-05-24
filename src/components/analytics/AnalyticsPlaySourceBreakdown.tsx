import { formatCompactNumber } from "@/utils/analyticsUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAdminUiMessages, type AdminUiMessages } from "@/lib/ui-messages";

interface AnalyticsPlaySourceBreakdownProps {
  playSourceBreakdown: Record<string, number>;
  loading: boolean;
}

const getPlaySourceLabel = (key: string, labels: AdminUiMessages): string => {
  switch (key) {
    case "card_watch_button": return labels.analyticsPlaySourceCardWatch;
    case "card_hover":
    case "hover_preview_watch": return labels.analyticsPlaySourceHoverWatch;
    case "hero_watch_button": return labels.analyticsPlaySourceHeroWatch;
    case "watch_page_play_button": return labels.analyticsPlaySourceWatchPagePlay;
    case "unknown": return labels.analyticsPlaySourceUnknown;
    default: return key;
  }
};

export default function AnalyticsPlaySourceBreakdown({
  playSourceBreakdown,
  loading,
}: AnalyticsPlaySourceBreakdownProps) {
  const { language } = useLanguage();
  const labels = getAdminUiMessages(language);
  const hasData = Object.keys(playSourceBreakdown || {}).length > 0;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">
          {labels.analyticsPlayBreakdownTitle}
        </h3>
        <span className="text-xs text-gray-400">
          {labels.analyticsPlayBreakdownHint}
        </span>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 animate-pulse space-y-2"
            >
              <div className="h-3 w-24 bg-gray-700 rounded" />
              <div className="h-6 w-16 bg-gray-600 rounded" />
            </div>
          ))}
        </div>
      ) : hasData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(playSourceBreakdown)
            .sort((a, b) => (b[1] || 0) - (a[1] || 0))
            .map(([key, value]) => (
              <div
                key={key}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <p className="text-sm text-gray-300">
                  {getPlaySourceLabel(key, labels)}
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCompactNumber(value)}
                </p>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-sm text-gray-400">
          {labels.analyticsPlayBreakdownEmpty}
        </div>
      )}
    </div>
  );
}
