import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  href?: string;
  showViewMore?: boolean;
  viewMoreLabel?: string;
}

export default function SectionHeader({
  title,
  href,
  showViewMore = true,
  viewMoreLabel = "View More",
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      {showViewMore && href && (
        <Link
          href={href}
          className="flex items-center text-gray-300 hover:text-white transition-colors group"
        >
          <span className="text-sm font-medium">{viewMoreLabel}</span>
          <svg
            className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      )}
    </div>
  );
}
