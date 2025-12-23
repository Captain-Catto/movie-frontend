import type { NotificationStats } from "@/types/notifications.types";

interface NotificationsStatsCardsProps {
  stats: NotificationStats | null;
}

export default function NotificationsStatsCards({
  stats,
}: NotificationsStatsCardsProps) {
  if (!stats) {
    return null;
  }

  const statsCards = [
    {
      title: "Targeted Users",
      value: stats.totalUsers,
      color: "text-blue-500",
    },
    {
      title: "Delivered",
      value: stats.totalSent,
      color: "text-yellow-500",
    },
    {
      title: "Read",
      value: stats.totalRead,
      color: "text-green-500",
    },
    {
      title: "Unread",
      value: stats.totalUnread,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {statsCards.map((stat) => (
        <div
          key={stat.title}
          className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-300">{stat.title}</h3>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
