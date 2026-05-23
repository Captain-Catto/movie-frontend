"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import Image from "next/image";
import type { SyntheticEvent, ChangeEvent } from "react";
import { FALLBACK_PROFILE } from "@/constants/app.constants";
import AccountSkeleton from "@/components/ui/AccountSkeleton";
import { useAccount } from "@/hooks/useAccount";
import type { AuthUser } from "@/types/auth.types";
import type { AccountUiMessages } from "@/lib/ui-messages";

interface AccountPleaseLoginViewProps {
  labels: AccountUiMessages;
}

function AccountPleaseLoginView({ labels }: AccountPleaseLoginViewProps) {
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

interface AccountProfileCardProps {
  labels: AccountUiMessages;
  displayName: string;
  user: AuthUser | null;
  avatarSrc: string;
  uploadingAvatar: boolean;
  avatarError: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onAvatarClick: () => void;
  onAvatarChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

function AccountProfileCard({
  labels,
  displayName,
  user,
  avatarSrc,
  uploadingAvatar,
  avatarError,
  fileInputRef,
  onAvatarClick,
  onAvatarChange,
}: AccountProfileCardProps) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 mb-6">
      <div className="flex items-start gap-x-6">
        <button
          type="button"
          className="group relative size-24 cursor-pointer overflow-hidden rounded-full border-4 border-gray-600"
          onClick={onAvatarClick}
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
          onChange={onAvatarChange}
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
  );
}

interface AccountSettingsFormProps {
  labels: AccountUiMessages;
  displayName: string;
  user: AuthUser | null;
  form: { name: string; password?: string; confirmPassword?: string };
  saving: boolean;
  formError: string;
  formSuccess: string;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (patch: Partial<{ name: string; password?: string; confirmPassword?: string }>) => void;
  onNavigate: (path: string) => void;
}

function AccountSettingsForm({
  labels,
  displayName,
  user,
  form,
  saving,
  formError,
  formSuccess,
  onSubmit,
  onFormChange,
  onNavigate,
}: AccountSettingsFormProps) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-6">
        {labels.settings}
      </h3>

      <form onSubmit={onSubmit} className="gap-y-4 mb-6">
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
              onChange={(e) => onFormChange({ name: e.target.value })}
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
              onChange={(e) => onFormChange({ password: e.target.value })}
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
              onChange={(e) => onFormChange({ confirmPassword: e.target.value })}
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
          onClick={() => onNavigate("/account/change-password")}
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
          onClick={() => onNavigate("/notifications")}
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
  );
}

export default function AccountPage() {
  const {
    user,
    isAuthenticated,
    isLoading,
    labels,
    push,
    form,
    saving,
    formError,
    formSuccess,
    uploadingAvatar,
    avatarError,
    fileInputRef,
    avatarSrc,
    displayName,
    setForm,
    handleAvatarClick,
    handleAvatarChange,
    handleUpdateProfile,
  } = useAccount();

  if (isLoading) {
    return <AccountSkeleton />;
  }

  if (!isAuthenticated) {
    return <AccountPleaseLoginView labels={labels} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Header />

      <main>
        <Container size="narrow" withHeaderOffset className="pb-12">
          <h1 className="text-4xl font-semibold text-white mb-8">
            {labels.accountTitle}
          </h1>

          <AccountProfileCard
            labels={labels}
            displayName={displayName}
            user={user}
            avatarSrc={avatarSrc}
            uploadingAvatar={uploadingAvatar}
            avatarError={avatarError}
            fileInputRef={fileInputRef}
            onAvatarClick={handleAvatarClick}
            onAvatarChange={handleAvatarChange}
          />

          <AccountSettingsForm
            labels={labels}
            displayName={displayName}
            user={user}
            form={form}
            saving={saving}
            formError={formError}
            formSuccess={formSuccess}
            onSubmit={handleUpdateProfile}
            onFormChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
            onNavigate={push}
          />
        </Container>
      </main>

      <Footer />
    </div>
  );
}
