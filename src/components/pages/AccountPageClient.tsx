"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import type { SyntheticEvent, ChangeEvent } from "react";
import { FALLBACK_PROFILE } from "@/constants/app.constants";
import AccountSkeleton from "@/components/ui/AccountSkeleton";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "@/lib/axios-instance";
import { authStorage } from "@/lib/auth-storage";
import type { StoredUser } from "@/lib/auth-storage";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAccountUiMessages } from "@/lib/ui-messages";

export default function AccountPage() {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuth();
  const { language } = useLanguage();
  const labels = getAccountUiMessages(language);
  const { push } = useRouter();
  const [form, setForm] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setAvatarUrl(user?.image || null);
  }, [user?.image]);

  const avatarSrc = avatarUrl || user?.image || FALLBACK_PROFILE;
  const displayName = user?.name || labels.user;

  if (isLoading) {
    return <AccountSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <Header />
        <main>
          <Container size="narrow" withHeaderOffset className="text-center pb-12">
            <h1 className="text-4xl font-semibold text-white mb-6">
              {labels.pleaseLogin}
            </h1>
            <p className="text-gray-400">
              {labels.needLogin}
            </p>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAvatarClick = () => {
    setAvatarError("");
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError(labels.imageSize);
      e.target.value = "";
      return;
    }

    setUploadingAvatar(true);
    setAvatarError("");
    setFormSuccess("");

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const uploadRes = await axiosInstance.post("/upload/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadUrl = uploadRes.data?.url;
      if (!uploadRes.data?.success || !uploadUrl) {
        throw new Error(uploadRes.data?.message || labels.uploadFailed);
      }

      const profileRes = await axiosInstance.put("/auth/profile", {
        image: uploadUrl,
      });

      if (!profileRes.data?.success) {
        throw new Error(profileRes.data?.message || labels.updateImageFailed);
      }

      if (!user?.id || !user.email) {
        throw new Error(labels.userUnavailable);
      }

      const updatedUser: StoredUser = {
        id: user.id,
        email: user.email,
        name: user.name || labels.user,
        role: user.role,
        googleId: user.googleId,
        image: uploadUrl,
      };
      authStorage.setUser(updatedUser);
      setAvatarUrl(uploadUrl);
      setFormSuccess(labels.avatarUpdated);
      checkAuth();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : labels.uploadRetry;
      setAvatarError(message);
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (form.password && form.password !== form.confirmPassword) {
      setFormError(labels.passwordMismatch);
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      if (form.name.trim()) payload.name = form.name.trim();
      if (form.password.trim()) payload.password = form.password.trim();

      if (Object.keys(payload).length === 0) {
        setFormError(labels.missingInput);
        return;
      }

      const res = await axiosInstance.put("/auth/profile", payload);
      if (res.data?.success) {
        setFormSuccess(labels.updateSuccess);
        setForm({ name: "", password: "", confirmPassword: "" });
        if (user) {
          const updatedUser = { ...user, ...(payload.name ? { name: payload.name } : {}) };
          authStorage.setUser(updatedUser);
          checkAuth();
        }
      } else {
        setFormError(res.data?.message || labels.updateFailed);
      }
    } catch (error: unknown) {
      const backendMessage =
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { data?: { message?: string | string[] } } })
          .response?.data?.message;
      const msg =
        typeof backendMessage === "string"
          ? backendMessage
          : Array.isArray(backendMessage)
          ? backendMessage.join(", ")
          : undefined;
      setFormError(msg || labels.updateFailed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Header />

      <main>
        <Container size="narrow" withHeaderOffset className="pb-12">
          <h1 className="text-4xl font-semibold text-white mb-8">
            {labels.accountTitle}
          </h1>

          {/* Profile Card */}
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 mb-6">
            <div className="flex items-start gap-x-6">
              <button
                type="button"
                className="group relative size-24 cursor-pointer overflow-hidden rounded-full border-4 border-gray-600"
                onClick={handleAvatarClick}
                title={labels.changeAvatar}
                aria-label={labels.changeAvatar}
              >
                <Image
                  src={avatarSrc}
                  alt={displayName}
                  width={96}
                  height={96}
                  className="object-cover"
                  unoptimized
                  onError={(e: SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = FALLBACK_PROFILE;
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white">
                  {uploadingAvatar ? labels.uploading : labels.change}
                </div>
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-xs">{labels.uploading}</span>
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                aria-label="Upload avatar"
                className="hidden"
                onChange={handleAvatarChange}
              />

              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  {displayName}
                </h2>
                <p className="text-gray-400 mb-4">{user?.email}</p>
                {avatarError && (
                  <p className="text-red-400 text-sm">{avatarError}</p>
                )}

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">{labels.role}</p>
                    <p className="text-white font-medium">
                      {user?.role === "admin" ? labels.admin : labels.user}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">{labels.status}</p>
                    <p className="text-green-400 font-medium">{labels.active}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-6">
              {labels.settings}
            </h3>

            <form onSubmit={handleUpdateProfile} className="gap-y-4 mb-6">
              {formError && (
                <div className="px-4 py-3 rounded-lg bg-red-900/40 border border-red-700 text-red-200">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="px-4 py-3 rounded-lg bg-green-900/40 border border-green-700 text-green-200">
                  {formSuccess}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="gap-y-2">
                  <label htmlFor="account-display-name" className="text-sm text-gray-300">{labels.displayName}</label>
                  <input
                    id="account-display-name"
                    type="text"
                    aria-label={labels.displayName}
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder={displayName}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
                    disabled={saving}
                  />
                </div>
                <div className="gap-y-2">
                  <label htmlFor="account-email" className="text-sm text-gray-300">{labels.email}</label>
                  <input
                    id="account-email"
                    type="text"
                    aria-label={labels.email}
                    value={user?.email || ""}
                    readOnly
                    disabled
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="gap-y-2">
                  <label htmlFor="account-new-password" className="text-sm text-gray-300">{labels.newPassword}</label>
                  <input
                    id="account-new-password"
                    type="password"
                    aria-label={labels.newPassword}
                    value={form.password}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder={labels.keepCurrent}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
                    disabled={saving}
                  />
                </div>
                <div className="gap-y-2">
                  <label htmlFor="account-confirm-password" className="text-sm text-gray-300">
                    {labels.confirmPassword}
                  </label>
                  <input
                    id="account-confirm-password"
                    type="password"
                    aria-label={labels.confirmPassword}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder={labels.repeatNewPassword}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
                    disabled={saving}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? labels.saving : labels.saveChanges}
              </button>
            </form>

            <div className="gap-y-4 mt-8">
              <button
                type="button"
                className="w-full text-left px-6 py-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-white cursor-pointer"
                onClick={() => push("/account/change-password")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-1">{labels.changePassword}</p>
                    <p className="text-sm text-gray-400">
                      {labels.updatePassword}
                    </p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </button>

              <button
                type="button"
                className="w-full text-left px-6 py-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-white cursor-pointer"
                onClick={() => push("/notifications")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-1">{labels.notifications}</p>
                    <p className="text-sm text-gray-400">
                      {labels.manageNotifications}
                    </p>
                  </div>
                  <span className="text-gray-400">→</span>
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
