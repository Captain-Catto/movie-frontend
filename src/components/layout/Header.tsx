"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import LanguageSelector from "@/components/layout/LanguageSelector";
import { HeartIcon, Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getHeaderUiMessages } from "@/lib/ui-messages";

const SearchModal = dynamic(() => import("@/components/search/SearchModal"), {
  ssr: false,
});
const AuthModal = dynamic(() => import("@/components/auth/AuthModal"), {
  ssr: false,
});
const NotificationDropdown = dynamic(
  () =>
    import("@/components/notifications/NotificationDropdown").then(
      (module) => module.NotificationDropdown
    ),
  { ssr: false }
);
const UserMenu = dynamic(() => import("@/components/layout/UserMenu"), {
  ssr: false,
});

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
  const scrollRafRef = useRef<number | null>(null);

  const { user, isAuthenticated, logout } = useAuth();
  const { language } = useLanguage();
  const isHydrated = useIsHydrated();
  const labels = getHeaderUiMessages(language);

  // Handle play state - hide header when playing (unless user has scrolled)
  useEffect(() => {
    if (hideOnPlay && isPlaying && !hasScrolled) {
      setIsVisible(false);
    }
  }, [hideOnPlay, isPlaying, hasScrolled]);

  // Handle scroll to update play state visibility and header styling
  useEffect(() => {
    const updateScrollState = () => {
      const scrollTop = window.scrollY;
      setIsScrolled((prev) => {
        const next = scrollTop > 0;
        return prev === next ? prev : next;
      });

      if (hideOnPlay && scrollTop > 50) {
        setHasScrolled((prev) => (prev ? prev : true));
        setIsVisible((prev) => (prev ? prev : true));
      }

      scrollRafRef.current = null;
    };

    const handleScroll = () => {
      if (scrollRafRef.current !== null) return;
      scrollRafRef.current = window.requestAnimationFrame(updateScrollState);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
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
    { href: "/", label: labels.home },
    { href: "/trending", label: labels.trending },
    { href: "/movies", label: labels.movies },
    { href: "/browse", label: labels.browse },
    { href: "/tv", label: labels.tvSeries },
    { href: "/people", label: labels.actors },
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
                  className="p-1 hover:text-red-500 transition-colors text-white flex-shrink-0 cursor-pointer"
                  onClick={handleSearchClick}
                  title={labels.search}
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

                {/* Language Selector */}
                <LanguageSelector />

                {/* Profile (desktop dropdown) */}
                <div className="flex-shrink-0">
                  {isHydrated && isAuthenticated ? (
                    <UserMenu user={user} onLogout={logout} />
                  ) : isHydrated ? (
                    <button
                      onClick={handleAuthModalOpen}
                    className="text-white hover:text-red-500 transition-colors text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2 rounded bg-red-600 hover:bg-red-700 whitespace-nowrap cursor-pointer"
                  >
                      {labels.login}
                    </button>
                  ) : (
                    <div className="w-16 sm:w-20 h-8 sm:h-10" />
                  )}
                </div>
              </div>

              {/* Hamburger Menu Button - Tablet & Mobile (only visible on mobile) */}
              <button
                className="lg:hidden p-2 hover:text-red-500 transition-colors text-white relative z-50 flex-shrink-0 cursor-pointer"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? labels.closeMenu : labels.openMenu}
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
          <div className="min-h-screen h-screen overflow-y-auto px-4 pt-16 pb-6 relative z-[210] pointer-events-auto flex flex-col gap-3">
            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label={labels.closeMenu}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <span className="sr-only">{labels.close}</span>
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

            <div className="flex flex-col gap-3">
              {/* Mobile profile & actions */}
              <div className="flex flex-col items-end gap-3 bg-gray-900/80 rounded-lg px-4 py-4 w-full">
                <Link
                  href={isAuthenticated ? "/account" : "#"}
                  onClick={() => isAuthenticated && setIsMenuOpen(false)}
                  className="flex flex-row-reverse items-center gap-3 w-full"
                  aria-label={labels.accountAria}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                    {isHydrated && isAuthenticated && user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.image}
                        alt={user.name || labels.profileAlt}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-base font-semibold">
                        {isHydrated && isAuthenticated
                          ? user?.name?.[0] || labels.defaultAvatarInitial
                          : "?"}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <span className="text-white text-lg font-semibold leading-tight">
                      {isHydrated && isAuthenticated
                        ? user?.name || labels.defaultUser
                        : labels.guest}
                    </span>
                    <span className="text-gray-400 text-sm leading-tight">
                      {isHydrated && isAuthenticated
                        ? user?.email || labels.signedIn
                        : labels.notSignedIn}
                    </span>
                  </div>
                </Link>

                <div className="flex items-center gap-2 justify-end w-full">
                  {isHydrated && isAuthenticated && <NotificationDropdown />}
                  {/* Favorites as heart icon (mobile) */}
                  <Link
                    href="/favorites"
                    className="p-2 text-white hover:text-red-500 transition-colors inline-flex items-center justify-center"
                    aria-label={labels.favorites}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <HeartIcon size={16}></HeartIcon>
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleSearchClick();
                    }}
                    className="p-2 text-white hover:text-red-500 transition-colors inline-flex items-center justify-center cursor-pointer"
                    aria-label={labels.search}
                  >
                    <Search size={16} />
                  </button>
                </div>

                <div className="flex justify-end w-full">
                  <LanguageSelector />
                </div>
              </div>

              {!isAuthenticated && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleAuthModalOpen();
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-center font-semibold py-3 rounded-lg transition-colors text-lg cursor-pointer"
                >
                  {labels.loginSignUp}
                </button>
              )}

              <div className="flex flex-col gap-3">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block w-full px-4 py-4 rounded-md transition-all duration-200 text-white hover:text-red-500 hover:bg-gray-700/50 font-medium text-right text-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {isSearchModalOpen ? (
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={handleSearchModalClose}
        />
      ) : null}

      {/* Auth Modal */}
      {isAuthModalOpen ? (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={handleAuthModalClose}
          onSuccess={handleAuthSuccess}
        />
      ) : null}
    </>
  );
};

export default Header;
