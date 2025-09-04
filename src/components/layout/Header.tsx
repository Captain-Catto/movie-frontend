"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Handle search logic here
    }
  };

  const navigationItems = [
    { href: "/", label: "Trang chủ" },
    { href: "/trending", label: "Trending" },
    { href: "/movies", label: "Phim Lẻ" },
    { href: "/browse", label: "Duyệt Phim" },
    { href: "/tv", label: "Phim Bộ" },
    { href: "/people", label: "Diễn viên" },
    { href: "/favorites", label: "Yêu thích" },
    { href: "/demo", label: "🎬 Demo" },
  ];

  return (
    <nav className="bg-gray-800/50 backdrop-blur-sm fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center mr-2">
                <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1"></div>
              </div>
              <span className="ml-2 text-xl font-bold text-white">
                MovieStream
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-white hover:text-red-500 transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Favorites Button */}
            <Link href="/favorites">
              <button
                className="p-1 hover:text-red-500 transition-colors text-white"
                title="Yêu thích"
              >
                <span className="text-xl">♥</span>
              </button>
            </Link>

            <div className="relative" ref={searchRef}>
              <button
                className="p-1 hover:text-red-500 transition-colors text-white"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </button>

              {isSearchOpen && (
                <div className="fixed inset-x-0 top-16 px-4 sm:px-6 lg:px-8 z-50">
                  <div className="w-full bg-gray-800 rounded-lg shadow-lg">
                    <form
                      className="flex items-center p-4"
                      onSubmit={handleSearchSubmit}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 text-gray-400"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                      </svg>
                      <input
                        type="text"
                        placeholder="Tìm kiếm phim, TV shows..."
                        className="flex-1 ml-3 bg-transparent border-none focus:outline-none text-white placeholder-gray-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                    </form>
                    <div className="border-t border-gray-700 px-4 py-3">
                      <div className="text-sm text-gray-400">
                        Nhấn Enter để tìm kiếm
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              className="md:hidden p-1 hover:text-red-500 transition-colors text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                <div className="w-full h-0.5 bg-current"></div>
                <div className="w-full h-0.5 bg-current"></div>
                <div className="w-full h-0.5 bg-current"></div>
              </div>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-800/90 rounded-lg mt-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 rounded-md transition-colors text-white hover:text-red-500 hover:bg-gray-700/50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
