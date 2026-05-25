"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useEffect, useReducer, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import LanguageSelector from "@/components/layout/LanguageSelector";
import { HeartIcon, Search, Bell, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getHeaderUiMessages } from "@/lib/ui-messages";
import { authStorage } from "@/lib/auth-storage";

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

// ----------------- Extracted Subcomponents -----------------

interface DesktopNavProps {
  navigationItems: { href: string; label: string }[];
  isActive: (href: string) => boolean;
}

function DesktopNav({ navigationItems, isActive }: DesktopNavProps) {
  return (
    <div className="hidden lg:block">
      <div className="flex items-center gap-x-4">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`transition-colors font-medium ${
              isActive(item.href)
                ? "text-white"
                : "text-gray-500 hover:text-red-500"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

import type { AuthUser } from "@/types/auth.types";

interface DesktopActionsProps {
  isHydrated: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  onLogout: () => void;
  onSearchClick: () => void;
  onAuthModalOpen: () => void;
  labels: {
    search: string;
    login: string;
  };
}

function DesktopActions({
  isHydrated,
  isLoading,
  isAuthenticated,
  user,
  onLogout,
  onSearchClick,
  onAuthModalOpen,
  labels,
}: DesktopActionsProps) {
  return (
    <div className="hidden lg:flex items-center gap-2 sm:gap-3 lg:gap-4">
      <div className="flex-shrink-0 w-10 flex justify-center items-center">
        {isHydrated && !isLoading && isAuthenticated ? (
          <NotificationDropdown />
        ) : isHydrated && authStorage.isAuthenticated() ? (
          <Bell className="size-5 text-gray-500 animate-pulse" />
        ) : null}
      </div>

      <button
        type="button"
        className="p-1 hover:text-red-500 transition-colors text-white flex-shrink-0 cursor-pointer"
        onClick={onSearchClick}
        title={labels.search}
        aria-label={labels.search}
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
          className="size-5"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </svg>
      </button>

      <LanguageSelector />

      <div className="flex-shrink-0">
        {isHydrated && !isLoading && isAuthenticated ? (
          <UserMenu user={user} onLogout={onLogout} />
        ) : isHydrated && !isLoading ? (
          <button
            type="button"
            onClick={onAuthModalOpen}
            className="text-white hover:text-red-500 transition-colors text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2 rounded bg-red-600 hover:bg-red-700 whitespace-nowrap cursor-pointer"
          >
            {labels.login}
          </button>
        ) : isHydrated && authStorage.isAuthenticated() ? (
          <div className="size-10 rounded-full bg-gray-800 border-2 border-gray-700 animate-pulse flex items-center justify-center text-gray-500">
            <User className="size-5" />
          </div>
        ) : (
          <div className="w-16 sm:w-20 h-8 sm:h-10 bg-gray-800/40 rounded animate-pulse" />
        )}
      </div>
    </div>
  );
}

interface MobileMenuOverlayProps {
  onCloseMenu: () => void;
  onSearchClick: () => void;
  onAuthModalOpen: () => void;
  navigationItems: { href: string; label: string }[];
  isActive: (href: string) => boolean;
  labels: {
    closeMenu: string;
    close: string;
    accountAria: string;
    profileAlt: string;
    defaultAvatarInitial: string;
    defaultUser: string;
    guest: string;
    signedIn: string;
    notSignedIn: string;
    favorites: string;
    search: string;
    loginSignUp: string;
  };
}

function MobileMenuOverlay({
  onCloseMenu,
  onSearchClick,
  onAuthModalOpen,
  navigationItems,
  isActive,
  labels,
}: MobileMenuOverlayProps) {
  const { isAuthenticated, user } = useAuth();
  const isHydrated = useIsHydrated();

  return (
    <div className="lg:hidden fixed inset-0 z-[200] size-screen bg-gray-900 opacity-100 transition-all duration-300 ease-out">
      <div className="min-h-screen h-screen overflow-y-auto px-4 pt-16 pb-6 relative z-[210] pointer-events-auto flex flex-col gap-3">
        <button
          type="button"
          onClick={onCloseMenu}
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
          <div className="flex flex-col items-end gap-3 bg-gray-900/80 rounded-lg p-4 w-full">
            <Link
              href={isAuthenticated ? "/account" : "#"}
              onClick={() => isAuthenticated && onCloseMenu()}
              className="flex flex-row-reverse items-center gap-3 w-full"
              aria-label={labels.accountAria}
            >
              <div className="size-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                {isHydrated && isAuthenticated && user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || labels.profileAlt}
                    width={48}
                    height={48}
                    className="size-full object-cover"
                    unoptimized
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
              <Link
                href="/favorites"
                className="p-2 text-white hover:text-red-500 transition-colors inline-flex items-center justify-center"
                aria-label={labels.favorites}
                onClick={onCloseMenu}
              >
                <HeartIcon size={16}></HeartIcon>
              </Link>
              <button
                type="button"
                onClick={() => {
                  onCloseMenu();
                  onSearchClick();
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
              type="button"
              onClick={() => {
                onCloseMenu();
                onAuthModalOpen();
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
                className={`block w-full px-4 py-4 rounded-md transition-all duration-200 font-medium text-right text-lg hover:bg-gray-700/50 ${
                  isActive(item.href)
                    ? "text-white"
                    : "text-gray-500 hover:text-red-500"
                }`}
                onClick={onCloseMenu}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------- Main Header Component -----------------

const Header = ({ hideOnPlay = false, isPlaying = false }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [{ isScrolled, isVisible }, dispatchHeader] = useReducer(
    (s: { isScrolled: boolean; isVisible: boolean }, a: Partial<{ isScrolled: boolean; isVisible: boolean }>) => {
      const next = { ...s, ...a };
      return next.isScrolled === s.isScrolled && next.isVisible === s.isVisible ? s : next;
    },
    { isScrolled: false, isVisible: true }
  );
  const hasScrolledRef = useRef(false);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { language } = useLanguage();
  const isHydrated = useIsHydrated();
  const labels = getHeaderUiMessages(language);

  useEffect(() => {
    let scrollRafId: number | null = null;

    const updateScrollState = () => {
      const scrollTop = window.scrollY;
      const nextScrolled = scrollTop > 0;

      if (hideOnPlay && scrollTop > 50) {
        if (!hasScrolledRef.current) hasScrolledRef.current = true;
        dispatchHeader({ isScrolled: nextScrolled, isVisible: true });
      } else if (hideOnPlay && isPlayingRef.current && scrollTop <= 50) {
        hasScrolledRef.current = false;
        dispatchHeader({ isScrolled: nextScrolled, isVisible: false });
      } else {
        dispatchHeader({ isScrolled: nextScrolled });
      }

      scrollRafId = null;
    };

    const handleScroll = () => {
      if (scrollRafId !== null) return;
      scrollRafId = window.requestAnimationFrame(updateScrollState);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollRafId !== null) {
        window.cancelAnimationFrame(scrollRafId);
        scrollRafId = null;
      }
    };
  }, [hideOnPlay]);

  const prevIsPlayingRef = useRef(isPlaying);
  const playJustStarted = hideOnPlay && isPlaying && !prevIsPlayingRef.current;
  prevIsPlayingRef.current = isPlaying;
  if (playJustStarted) {
    hasScrolledRef.current = false;
    dispatchHeader({ isVisible: false });
  }

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

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

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
                <div className="size-8 bg-red-500 rounded flex items-center justify-center flex-shrink-0">
                  <div className="size-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1"></div>
                </div>
                <span className="ml-2 text-base sm:text-xl font-bold text-white whitespace-nowrap truncate">
                  MovieStream
                </span>
              </Link>
            </div>

            <DesktopNav navigationItems={navigationItems} isActive={isActive} />

            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
              <DesktopActions
                isHydrated={isHydrated}
                isLoading={isLoading}
                isAuthenticated={isAuthenticated}
                user={user}
                onLogout={logout}
                onSearchClick={handleSearchClick}
                onAuthModalOpen={handleAuthModalOpen}
                labels={{
                  search: labels.search,
                  login: labels.login,
                }}
              />

              <button
                type="button"
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

      {isMenuOpen && (
        <MobileMenuOverlay
          onCloseMenu={() => setIsMenuOpen(false)}
          onSearchClick={handleSearchClick}
          onAuthModalOpen={handleAuthModalOpen}
          navigationItems={navigationItems}
          isActive={isActive}
          labels={{
            closeMenu: labels.closeMenu,
            close: labels.close,
            accountAria: labels.accountAria,
            profileAlt: labels.profileAlt,
            defaultAvatarInitial: labels.defaultAvatarInitial,
            defaultUser: labels.defaultUser,
            guest: labels.guest,
            signedIn: labels.signedIn,
            notSignedIn: labels.notSignedIn,
            favorites: labels.favorites,
            search: labels.search,
            loginSignUp: labels.loginSignUp,
          }}
        />
      )}

      {isSearchModalOpen && (
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={handleSearchModalClose}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={handleAuthModalClose}
          onSuccess={handleAuthSuccess}
        />
      )}
    </>
  );
};

export default Header;
