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
          className="group inline-flex min-h-11 items-center gap-1 rounded-md px-2 py-2 text-gray-300 transition-colors hover:text-white"
        >
          <span className="text-sm font-medium leading-none">{viewMoreLabel}</span>
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
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
