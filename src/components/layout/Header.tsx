"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import SearchModal from "@/components/search/SearchModal";
import AuthModal from "@/components/auth/AuthModal";
import UserMenu from "@/components/layout/UserMenu";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  hideOnPlay?: boolean;
  isPlaying?: boolean;
}

const Header = ({ hideOnPlay = false, isPlaying = false }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // Start visible
  const [hasScrolled, setHasScrolled] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();

  // Handle play state - hide header when playing (unless user has scrolled)
  useEffect(() => {
    if (hideOnPlay && isPlaying && !hasScrolled) {
      setIsVisible(false);
    }
  }, [hideOnPlay, isPlaying, hasScrolled]);

  // Handle scroll to change navbar background and visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);

      // Show header when user scrolls down
      if (hideOnPlay && scrollTop > 50) {
        setHasScrolled(true);
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hideOnPlay]);

  // Reset scroll state when play state changes (to allow hiding again on next play)
  useEffect(() => {
    if (hideOnPlay && isPlaying) {
      setHasScrolled(false);
    }
  }, [hideOnPlay, isPlaying]);

  const handleSearchClick = () => {
    setIsSearchModalOpen(true);
  };

  const handleSearchModalClose = () => {
    setIsSearchModalOpen(false);
  };

  const handleAuthModalOpen = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false);
  };

  const handleAuthSuccess = () => {
    console.log("Authentication successful");
  };

  const navigationItems = [
    { href: "/", label: "Home" },
    { href: "/trending", label: "Trending" },
    { href: "/movies", label: "Movies" },
    { href: "/browse", label: "Browse" },
    { href: "/tv", label: "TV Series" },
    { href: "/people", label: "Actors" },
    { href: "/favorites", label: "Favorites" },
  ];

  return (
    <nav
      className={`fixed w-full z-[100] transition-all duration-300 ${
        isScrolled
          ? "bg-gray-800/95 backdrop-blur-sm shadow-lg"
          : "bg-transparent"
      } ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
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
            <button
              className="p-1 hover:text-red-500 transition-colors text-white"
              onClick={handleSearchClick}
              title="Search"
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

            {/* Notification Bell - Only show when authenticated */}
            {isAuthenticated && <NotificationDropdown />}

            {/* Auth Section */}
            {isAuthenticated ? (
              <UserMenu user={user} onLogout={logout} />
            ) : (
              <button
                onClick={handleAuthModalOpen}
                className="text-white hover:text-red-500 transition-colors text-sm px-3 py-2 rounded bg-red-600 hover:bg-red-700"
              >
                Login
              </button>
            )}

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

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={handleSearchModalClose}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        onSuccess={handleAuthSuccess}
      />
    </nav>
  );
};

export default Header;
