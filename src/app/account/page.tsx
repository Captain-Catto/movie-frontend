"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import type { SyntheticEvent } from "react";
import { FALLBACK_PROFILE } from "@/constants/app.constants";
import AccountSkeleton from "@/components/ui/AccountSkeleton";

export default function AccountPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AccountSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <Header />
        <main>
          <Container size="narrow" withHeaderOffset className="text-center pb-12">
            <h1 className="text-4xl font-bold text-white mb-6">
              Please login
            </h1>
            <p className="text-gray-400">
              You need to login to view account information
            </p>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  const avatarSrc = user?.image || FALLBACK_PROFILE;
  const displayName = user?.name || "User";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Header />

      <main>
        <Container size="narrow" withHeaderOffset className="pb-12">
          <h1 className="text-4xl font-bold text-white mb-8">
            👤 Your Account
          </h1>

          {/* Profile Card */}
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 mb-6">
            <div className="flex items-start space-x-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-600">
                <Image
                  src={avatarSrc}
                  alt={displayName}
                  width={96}
                  height={96}
                  className="object-cover"
                  onError={(e: SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = FALLBACK_PROFILE;
                  }}
                />
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {displayName}
                </h2>
                <p className="text-gray-400 mb-4">{user?.email}</p>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Role</p>
                    <p className="text-white font-medium">
                      {user?.role === "admin" ? "Administrator" : "User"}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Status</p>
                    <p className="text-green-400 font-medium">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6">
              Account Settings
            </h3>

            <div className="space-y-4">
              <button className="w-full text-left px-6 py-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-1">Change Password</p>
                    <p className="text-sm text-gray-400">
                      Update your password
                    </p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </button>

              <button className="w-full text-left px-6 py-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-1">Notifications</p>
                    <p className="text-sm text-gray-400">
                      Manage notification preferences
                    </p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </button>

              <button className="w-full text-left px-6 py-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-1">Privacy</p>
                    <p className="text-sm text-gray-400">
                      Privacy and security settings
                    </p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </button>

              <button className="w-full text-left px-6 py-4 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 rounded-lg transition-colors text-red-400">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-1">Delete Account</p>
                    <p className="text-sm text-red-300/70">
                      Permanently delete your account
                    </p>
                  </div>
                  <span className="text-red-400">⚠</span>
                </div>
              </button>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
