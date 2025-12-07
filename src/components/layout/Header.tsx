"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import SearchModal from "@/components/search/SearchModal";
import AuthModal from "@/components/auth/AuthModal";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useAuth } from "@/hooks/useAuth";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import UserMenu from "@/components/layout/UserMenu";

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
  const isHydrated = useIsHydrated();

  // Handle play state - hide header when playing (unless user has scrolled)
  useEffect(() => {
    if (hideOnPlay && isPlaying && !hasScrolled) {
      setIsVisible(false);
    }
  }, [hideOnPlay, isPlaying, hasScrolled]);

  // Handle scroll to update play state visibility and header styling
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);

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

  const handleAuthSuccess = () => {};

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
    <>
      <nav
        className={`fixed w-full z-[100] transition-all duration-300 overflow-visible ${
          isScrolled
            ? "bg-gray-800/95 backdrop-blur-sm shadow-lg"
            : "bg-transparent"
        } ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            <div className="flex items-center flex-shrink-0 min-w-0">
              <Link href="/" className="flex items-center min-w-0">
                <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center flex-shrink-0">
                  <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1"></div>
                </div>
                <span className="ml-2 text-base sm:text-xl font-bold text-white whitespace-nowrap truncate">
                  MovieStream
                </span>
              </Link>
            </div>

            <div className="hidden lg:block">
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

            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
              {/* Desktop actions */}
              <div className="hidden lg:flex items-center gap-2 sm:gap-3 lg:gap-4">
                {/* Notification on the left */}
                <div className="flex-shrink-0 w-10 flex justify-center">
                  {isHydrated && isAuthenticated && <NotificationDropdown />}
                </div>

                {/* Search */}
                <button
                  className="p-1 hover:text-red-500 transition-colors text-white flex-shrink-0"
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

                {/* Profile (desktop dropdown) */}
                <div className="flex-shrink-0">
                  {isHydrated && isAuthenticated ? (
                    <UserMenu user={user} onLogout={logout} />
                  ) : isHydrated ? (
                    <button
                      onClick={handleAuthModalOpen}
                      className="text-white hover:text-red-500 transition-colors text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2 rounded bg-red-600 hover:bg-red-700 whitespace-nowrap"
                    >
                      Login
                    </button>
                  ) : (
                    <div className="w-16 sm:w-20 h-8 sm:h-10" />
                  )}
                </div>
              </div>

              {/* Hamburger Menu Button - Tablet & Mobile (only visible on mobile) */}
              <button
                className="lg:hidden p-2 hover:text-red-500 transition-colors text-white relative z-50 flex-shrink-0"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
              >
                <div className="w-6 h-5 flex flex-col justify-center items-center">
                  <span
                    className={`w-full h-0.5 bg-current transition-all duration-300 ease-out ${
                      isMenuOpen
                        ? "rotate-45 translate-y-[9px]"
                        : "rotate-0 translate-y-0"
                    }`}
                  />
                  <span
                    className={`w-full h-0.5 bg-current my-1 transition-all duration-300 ease-out ${
                      isMenuOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
                    }`}
                  />
                  <span
                    className={`w-full h-0.5 bg-current transition-all duration-300 ease-out ${
                      isMenuOpen
                        ? "-rotate-45 -translate-y-[9px]"
                        : "rotate-0 translate-y-0"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>

        </div>
      </nav>
      {/* Mobile Menu Dropdown (outside nav to avoid stacking issues) */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[200] w-screen h-screen bg-gray-900 opacity-100 transition-all duration-300 ease-out">
          <div className="min-h-screen overflow-y-auto px-4 pt-16 pb-6 space-y-3 relative z-[210] pointer-events-auto">
            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Mobile profile & actions */}
            <div className="flex flex-col gap-3 bg-gray-900/80 rounded-lg px-4 py-3">
              <Link
                href={isAuthenticated ? "/account" : "#"}
                onClick={() => isAuthenticated && setIsMenuOpen(false)}
                className="flex items-center gap-3"
                aria-label="Go to account"
              >
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                  {isHydrated && isAuthenticated && user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name || "Profile"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-semibold">
                      {isHydrated && isAuthenticated
                        ? user?.name?.[0] || "U"
                        : "?"}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-sm font-semibold">
                    {isHydrated && isAuthenticated
                      ? user?.name || "User"
                      : "Guest"}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {isHydrated && isAuthenticated
                      ? user?.email || "Signed in"
                      : "Not signed in"}
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-2 flex-wrap">
                {isHydrated && isAuthenticated && (
                  <div className="flex-shrink-0">
                    <NotificationDropdown />
                  </div>
                )}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleSearchClick();
                  }}
                  className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                  aria-label="Search"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                </button>
              </div>
            </div>

            {!isAuthenticated && (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleAuthModalOpen();
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-center font-semibold py-2 rounded-lg transition-colors"
              >
                Login / Sign up
              </button>
            )}

            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-3 rounded-md transition-all duration-200 text-white hover:text-red-500 hover:bg-gray-700/50 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

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
    </>
  );
};

export default Header;
