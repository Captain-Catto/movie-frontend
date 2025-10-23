"use client";

import { useAuth } from "@/hooks/useAuth";

export default function AdminDebugPage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Admin Debug Page</h1>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Authentication Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Is Authenticated:</span>
              <span className={`font-semibold ${isAuthenticated ? 'text-green-500' : 'text-red-500'}`}>
                {isAuthenticated ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">User Object</h2>
          <pre className="bg-gray-900 p-4 rounded text-gray-300 overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">Role Check</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">User Role:</span>
              <span className="text-white font-semibold">{user?.role || 'undefined'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Is Admin?</span>
              <span className={`font-semibold ${user?.role === 'admin' ? 'text-green-500' : 'text-red-500'}`}>
                {user?.role === 'admin' ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Is Super Admin?</span>
              <span className={`font-semibold ${user?.role === 'super_admin' ? 'text-green-500' : 'text-red-500'}`}>
                {user?.role === 'super_admin' ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">Token Info</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400 block mb-2">Token (from localStorage):</span>
              <pre className="bg-gray-900 p-4 rounded text-gray-300 overflow-auto text-xs">
                {typeof window !== 'undefined' ? localStorage.getItem('token') || 'No token' : 'Loading...'}
              </pre>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/';
            }}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Clear Token & Logout
          </button>
        </div>
      </div>
    </div>
  );
}
