"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useClickOutside } from "@/hooks/useClickOutside";
import {
  FaHeart,
  FaClock,
  FaUser,
  FaSignOutAlt,
  FaBell,
} from "react-icons/fa";

interface UserMenuProps {
  user: {
    id: number;
    email: string;
    name?: string;
    image?: string;
    firstName?: string;
    lastName?: string;
  } | null;
  onLogout: () => void;
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Memoize the close handler to prevent re-renders
  const handleClickOutside = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close dropdown when clicking outside
  useClickOutside(menuRef, handleClickOutside);

  // Close dropdown on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  const avatarSrc = user?.image || "/images/no-avatar.svg";
  const displayName =
    user?.name || user?.firstName || user?.email?.split("@")[0] || "User";

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  const menuItems = [
    {
      icon: <FaBell className="w-4 h-4" />,
      label: "Notifications",
      href: "/notifications",
    },
    {
      icon: <FaHeart className="w-4 h-4" />,
      label: "Favorites",
      href: "/favorites",
    },
    {
      icon: <FaClock className="w-4 h-4" />,
      label: "Continue Watching",
      href: "/continue-watching",
    },
    {
      icon: <FaUser className="w-4 h-4" />,
      label: "Account",
      href: "/account",
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center space-x-2 focus:outline-none group"
      >
        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-600 group-hover:border-red-500 transition-colors">
          <Image
            src={avatarSrc}
            alt={displayName}
            width={40}
            height={40}
            className="object-cover"
            onError={(e) => {
              e.currentTarget.src = "/images/no-avatar.svg";
            }}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-[150] animate-in fade-in slide-in-from-top-2 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* User Info Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600">
                <Image
                  src={avatarSrc}
                  alt={displayName}
                  width={48}
                  height={48}
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/images/no-avatar.svg";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors"
              >
                <span className="mr-3 text-gray-400">{item.icon}</span>
                {item.label}
              </Link>
            ))}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors border-t border-gray-700 mt-2"
            >
              <FaSignOutAlt className="w-4 h-4 mr-3 text-gray-400" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
