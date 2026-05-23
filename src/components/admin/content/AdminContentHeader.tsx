import { TabKey } from "@/hooks/useAdminContent";

const TAB_CONFIG: { key: TabKey; label: string }[] = [
  { key: "movies", label: "Movie Management" },
  { key: "tv", label: "TV Show Management" },
  { key: "trending", label: "Trending" },
];

export default function AdminContentHeader({
  activeTab,
  sectionDescription,
  onTabChange,
}: {
  activeTab: TabKey;
  sectionDescription: string;
  onTabChange: (tab: TabKey) => void;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-white">Content Management</h1>
        <p className="text-gray-400 mt-1 max-w-2xl">{sectionDescription}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
