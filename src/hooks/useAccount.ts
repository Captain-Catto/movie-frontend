import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAccountUiMessages } from "@/lib/ui-messages";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios-instance";
import { authStorage, type StoredUser } from "@/lib/auth-storage";
import { FALLBACK_PROFILE } from "@/constants/app.constants";
import type { ChangeEvent } from "react";

export function useAccount() {
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

  const avatarSrc = avatarUrl || user?.image || FALLBACK_PROFILE;
  const displayName = user?.name || labels.user;

  const handleAvatarClick = useCallback(() => {
    setAvatarError("");
    fileInputRef.current?.click();
  }, []);

  const handleAvatarChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
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
  }, [user, labels, checkAuth]);

  const handleUpdateProfile = useCallback(async (e: React.FormEvent) => {
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
  }, [form, user, labels, checkAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    language,
    labels,
    push,
    form,
    saving,
    formError,
    formSuccess,
    uploadingAvatar,
    avatarError,
    avatarUrl,
    fileInputRef,
    avatarSrc,
    displayName,
    setForm,
    handleAvatarClick,
    handleAvatarChange,
    handleUpdateProfile,
  };
}
