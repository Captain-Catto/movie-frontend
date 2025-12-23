import { formatCompactNumber } from "@/utils/analyticsUtils";

interface AnalyticsPlaySourceBreakdownProps {
  playSourceBreakdown: Record<string, number>;
  loading: boolean;
}

const PLAY_SOURCE_LABELS: Record<string, string> = {
  card_watch_button: "Card Watch",
  card_hover: "Hover Watch",
  hover_preview_watch: "Hover Watch",
  hero_watch_button: "Hero Watch",
  watch_page_play_button: "Watch Page Play",
  unknown: "Unknown",
};

export default function AnalyticsPlaySourceBreakdown({
  playSourceBreakdown,
  loading,
}: AnalyticsPlaySourceBreakdownProps) {
  const hasData = Object.keys(playSourceBreakdown || {}).length > 0;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">
          Play Buttons Breakdown
        </h3>
        <span className="text-xs text-gray-400">
          Source metadata from play events
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
                  {PLAY_SOURCE_LABELS[key] || key}
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCompactNumber(value)}
                </p>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-sm text-gray-400">
          No play source data available yet.
        </div>
      )}
    </div>
  );
}
