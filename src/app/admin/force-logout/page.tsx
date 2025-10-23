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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-white mb-2">Logging out...</h1>
        <p className="text-gray-400">Clearing authentication data</p>
      </div>
    </div>
  );
}
