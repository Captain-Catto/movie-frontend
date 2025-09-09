"use client";
import Link from "next/link";

interface LinkPaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  showPages?: number;
  className?: string;
}

export default function LinkPagination({
  currentPage,
  totalPages,
  basePath,
  showPages = 5,
  className = "",
}: LinkPaginationProps) {
  const getVisiblePages = () => {
    const pages = [];
    const half = Math.floor(showPages / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + showPages - 1);

    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  const getPageUrl = (page: number) => {
    return page === 1 ? basePath : `${basePath}?page=${page}`;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className={`flex items-center justify-center space-x-2 ${className}`}>
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="px-3 py-2 text-sm bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Previous
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm bg-gray-800 text-gray-500 rounded-md cursor-not-allowed">
          Previous
        </span>
      )}

      {/* First Page */}
      {visiblePages[0] > 1 && (
        <>
          <Link
            href={getPageUrl(1)}
            className="px-3 py-2 text-sm bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            1
          </Link>
          {visiblePages[0] > 2 && (
            <span className="px-3 py-2 text-sm text-gray-400">...</span>
          )}
        </>
      )}

      {/* Visible Pages */}
      {visiblePages.map((page) => (
        <Link
          key={page}
          href={getPageUrl(page)}
          className={`px-3 py-2 text-sm rounded-md transition-colors ${
            page === currentPage
              ? "bg-red-600 text-white"
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
        >
          {page}
        </Link>
      ))}

      {/* Last Page */}
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-3 py-2 text-sm text-gray-400">...</span>
          )}
          <Link
            href={getPageUrl(totalPages)}
            className="px-3 py-2 text-sm bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            {totalPages}
          </Link>
        </>
      )}

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="px-3 py-2 text-sm bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Next
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm bg-gray-800 text-gray-500 rounded-md cursor-not-allowed">
          Next
        </span>
      )}
    </nav>
  );
}
