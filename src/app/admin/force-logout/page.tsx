"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ForceLogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear all auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear any other auth-related items
    Object.keys(localStorage).forEach(key => {
      if (key.includes('auth') || key.includes('token') || key.includes('user')) {
        localStorage.removeItem(key);
      }
    });

    // Redirect to home after 1 second
    setTimeout(() => {
      router.push("/");
    }, 1000);
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white">Force Logout</h1>
        <p className="text-gray-400">
          Clearing authentication data and redirecting you to the home page.
        </p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">
            Logging out...
          </h2>
          <p className="text-gray-400 text-sm">
            Please wait, we are clearing your login session.
          </p>
        </div>
      </div>
    </div>
  );
}
