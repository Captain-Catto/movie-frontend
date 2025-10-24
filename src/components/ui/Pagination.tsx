"use client";
import React, { useState } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  basePath?: string; // For URL navigation
  showPages?: number;
  className?: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPages = 5,
  className = "",
}: PaginationProps) {
  const [isInputMode, setIsInputMode] = useState(false);
  const [inputValue, setInputValue] = useState(currentPage.toString());
  const [desktopInputMode, setDesktopInputMode] = useState(false);
  const [desktopInputValue, setDesktopInputValue] = useState(
    currentPage.toString()
  );

  const getDesktopPages = () => {
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

  const desktopPages = getDesktopPages();

  const handleMobilePageClick = () => {
    setIsInputMode(true);
    setInputValue(currentPage.toString());
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(inputValue);
    if (page >= 1 && page <= totalPages) {
      onPageChange?.(page);
    }
    setIsInputMode(false);
  };

  const handleInputBlur = () => {
    setIsInputMode(false);
    setInputValue(currentPage.toString());
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsInputMode(false);
      setInputValue(currentPage.toString());
    }
  };

  const handleDesktopInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(desktopInputValue);
    if (page >= 1 && page <= totalPages) {
      onPageChange?.(page);
    }
    setDesktopInputMode(false);
  };

  const handleDesktopInputBlur = () => {
    setDesktopInputMode(false);
    setDesktopInputValue(currentPage.toString());
  };

  const handleDesktopInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setDesktopInputMode(false);
      setDesktopInputValue(currentPage.toString());
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className={classNames("flex items-center justify-center", className)}
      aria-label="Pagination"
    >
      <div className="flex items-center space-x-1">
        {/* Previous Page */}
        <button
          onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={classNames(
            "relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            currentPage === 1
              ? "text-gray-500 cursor-not-allowed bg-gray-800"
              : "text-gray-300 bg-gray-700 hover:bg-gray-600 hover:text-white"
          )}
          aria-label="Trang trước"
        >
          &lt;
        </button>

        {/* Mobile Version - Shows on < lg (1024px) */}
        <div className="flex lg:hidden">
          {isInputMode ? (
            <form onSubmit={handleInputSubmit} className="flex items-center">
              <span className="text-sm font-medium text-gray-300 mr-2">
                Trang
              </span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                className="w-12 px-2 py-1 text-sm text-center text-white bg-gray-700 border border-red-500 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                autoFocus
              />
              <span className="text-sm font-medium text-gray-300 ml-2">
                / {totalPages}
              </span>
            </form>
          ) : (
            <button
              onClick={handleMobilePageClick}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 hover:text-white transition-colors"
            >
              <span>
                Trang {currentPage} / {totalPages}
              </span>
            </button>
          )}
        </div>

        {/* Desktop Version - Shows on >= lg (1024px) */}
        <div className="hidden lg:flex space-x-1">
          {/* First page */}
          {desktopPages[0] > 1 && (
            <>
              <button
                onClick={() => onPageChange?.(1)}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 hover:text-white transition-colors"
              >
                1
              </button>
              {desktopPages[0] > 2 && (
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-400">
                  ...
                </span>
              )}
            </>
          )}

          {/* Page numbers */}
          {desktopPages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange?.(page)}
              className={classNames(
                "relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                page === currentPage
                  ? "z-10 bg-red-600 border-red-600 text-white"
                  : "text-gray-300 bg-gray-700 border border-gray-600 hover:bg-gray-600 hover:text-white"
              )}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          ))}

          {/* Jump to page input or Last page */}
          {desktopPages[desktopPages.length - 1] < totalPages && (
            <>
              {desktopPages[desktopPages.length - 1] < totalPages - 1 && (
                <>
                  {desktopInputMode ? (
                    <form
                      onSubmit={handleDesktopInputSubmit}
                      className="flex items-center"
                    >
                      <span className="text-xs font-medium text-gray-400 mr-1">
                        Đến
                      </span>
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={desktopInputValue}
                        onChange={(e) => setDesktopInputValue(e.target.value)}
                        onBlur={handleDesktopInputBlur}
                        onKeyDown={handleDesktopInputKeyDown}
                        className="w-16 px-2 py-1 text-sm text-center text-white bg-gray-700 border border-red-500 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                        autoFocus
                        placeholder={`1-${totalPages}`}
                      />
                    </form>
                  ) : (
                    <button
                      onClick={() => {
                        setDesktopInputMode(true);
                        setDesktopInputValue("");
                      }}
                      className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-400 hover:text-gray-300 transition-colors"
                      title={`Nhảy đến trang (1-${totalPages})`}
                    >
                      ...
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => onPageChange?.(totalPages)}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 hover:text-white transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Next Page */}
        <button
          onClick={() =>
            onPageChange?.(Math.min(totalPages, currentPage + 1))
          }
          disabled={currentPage === totalPages}
          className={classNames(
            "relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            currentPage === totalPages
              ? "text-gray-500 cursor-not-allowed bg-gray-800"
              : "text-gray-300 bg-gray-700 hover:bg-gray-600 hover:text-white"
          )}
          aria-label="Trang sau"
        >
          &gt;
        </button>
      </div>
    </nav>
  );
}
