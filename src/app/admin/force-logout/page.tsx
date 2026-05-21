"use client";

import { useEffect } from "react";

export default function ForceLogoutPage() {
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
    const timer = setTimeout(() => {
      window.location.replace("/");
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Force Logout</h1>
        <p className="text-gray-400">
          Clearing authentication data and redirecting you to the home page.
        </p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex items-center gap-4">
        <div className="animate-spin rounded-full size-12 border-b-2 border-red-600" />
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">
            Logging out…
          </h2>
          <p className="text-gray-400 text-sm">
            Please wait, we are clearing your login session.
          </p>
        </div>
      </div>
    </div>
  );
}
