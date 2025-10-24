"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

export default function AccountPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white">Đang tải...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-6">
              Vui lòng đăng nhập
            </h1>
            <p className="text-gray-400">
              Bạn cần đăng nhập để xem thông tin tài khoản
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const avatarSrc = user?.image || "/images/no-avatar.svg";
  const displayName = user?.name || "User";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">
            👤 Tài khoản của bạn
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
                  onError={(e) => {
                    e.currentTarget.src = "/images/no-avatar.svg";
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
                    <p className="text-gray-400 text-sm mb-1">Vai trò</p>
                    <p className="text-white font-medium">
                      {user?.role === "admin" ? "Quản trị viên" : "Người dùng"}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Trạng thái</p>
                    <p className="text-green-400 font-medium">Đang hoạt động</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6">
              Cài đặt tài khoản
            </h3>

            <div className="space-y-4">
              <button className="w-full text-left px-6 py-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-1">Đổi mật khẩu</p>
                    <p className="text-sm text-gray-400">
                      Cập nhật mật khẩu của bạn
                    </p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </button>

              <button className="w-full text-left px-6 py-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-1">Thông báo</p>
                    <p className="text-sm text-gray-400">
                      Quản lý tùy chọn thông báo
                    </p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </button>

              <button className="w-full text-left px-6 py-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-1">Quyền riêng tư</p>
                    <p className="text-sm text-gray-400">
                      Cài đặt quyền riêng tư và bảo mật
                    </p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </button>

              <button className="w-full text-left px-6 py-4 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 rounded-lg transition-colors text-red-400">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-1">Xóa tài khoản</p>
                    <p className="text-sm text-red-300/70">
                      Xóa vĩnh viễn tài khoản của bạn
                    </p>
                  </div>
                  <span className="text-red-400">⚠</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
