"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { getResetPasswordUiMessages } from "@/lib/ui-messages";
import { authApiService } from "@/services/auth-api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();
  const labels = getResetPasswordUiMessages(language);

  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationError("");

    if (!token) {
      setError(labels.invalidToken);
      return;
    }

    if (password.length < 6) {
      setValidationError(labels.passwordMinLength);
      return;
    }

    if (password !== confirmPassword) {
      setValidationError(labels.passwordMismatch);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await authApiService.resetPassword({
        token,
        newPassword: password,
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        setError(response.message || labels.resetPasswordFailed);
      }
    } catch (err: any) {
      setError(labels.genericError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-lg text-center max-w-md w-full mx-auto backdrop-blur-sm">
        <AlertCircle className="size-12 mx-auto mb-4 text-red-500 animate-bounce" />
        <h2 className="text-xl font-bold mb-2">{labels.resetPasswordFailed}</h2>
        <p className="text-sm text-gray-400 mb-6">{labels.invalidToken}</p>
        <Button onClick={() => router.push("/")} className="bg-red-600 hover:bg-red-700 text-white w-full">
          {labels.backToHome}
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-8 rounded-xl text-center max-w-md w-full mx-auto backdrop-blur-md shadow-2xl shadow-green-500/5">
        <CheckCircle className="size-16 mx-auto mb-4 text-green-500 animate-pulse" />
        <h2 className="text-2xl font-bold mb-3 text-white">{labels.title}</h2>
        <p className="text-sm text-gray-300 mb-6">{labels.resetPasswordSuccess}</p>
        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mb-2">
          <div className="bg-green-500 h-full w-full animate-[loading_3s_linear]" />
        </div>
        <p className="text-xs text-gray-500">Redirecting to Homepage...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto">
      <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800/80 p-8 rounded-2xl shadow-2xl relative overflow-hidden group">
        {/* Decorative corner glows */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-3xl group-hover:bg-red-600/20 transition-all duration-700" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-700" />

        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-500 mb-4">
            <Lock className="size-6" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{labels.title}</h2>
          <p className="text-gray-400 text-sm">{labels.description}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-4 flex items-start gap-2">
            <AlertCircle className="size-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {validationError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-4 flex items-start gap-2">
            <AlertCircle className="size-5 shrink-0 text-red-500" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {labels.newPasswordLabel}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Lock className="size-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder={labels.newPasswordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800/80 border border-gray-700 hover:border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-500 transition-all text-sm focus:outline-none"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {labels.confirmPasswordLabel}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Lock className="size-4" />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder={labels.confirmPasswordPlaceholder}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-800/80 border border-gray-700 hover:border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-500 transition-all text-sm focus:outline-none"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-6 rounded-xl transition-all shadow-lg shadow-red-600/10 hover:shadow-red-600/25 flex items-center justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? labels.processing : labels.resetPasswordSubmit}
          </Button>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-gray-800/60">
          <button
            onClick={() => router.push("/")}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors uppercase tracking-wider font-semibold"
          >
            {labels.backToHome}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col justify-center items-center px-4 relative overflow-hidden select-none">
      {/* Background visual art components */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px]" />

      <div className="mb-8 text-center relative z-10 flex items-center gap-2">
        <Film className="size-8 text-red-600" />
        <h1 className="text-3xl font-extrabold text-white tracking-widest uppercase">
          Movie<span className="text-red-600">Stream</span>
        </h1>
      </div>

      <div className="relative z-10 w-full">
        <Suspense
          fallback={
            <div className="max-w-md w-full mx-auto text-center text-gray-400 text-sm">
              Loading Reset Password Form...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
