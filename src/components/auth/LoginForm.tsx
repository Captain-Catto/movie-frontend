"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLoginFormUiMessages } from "@/lib/ui-messages";
interface LoginFormProps {
  onSubmit: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const { language } = useLanguage();
  const labels = getLoginFormUiMessages(language);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = labels.enterEmail;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = labels.invalidEmail;
    }

    if (!formData.password) {
      newErrors.password = labels.enterPassword;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await onSubmit(formData.email, formData.password);
      if (!result.success) {
        setSubmitError(result.error || labels.loginFailed);
      } else {
        setSubmitError("");
      }
    } catch (error) {
      console.error("Login error:", error);
      setSubmitError(labels.genericError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitError && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-md text-sm">
          {submitError}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="login-email" className="text-white">
          {labels.email}
        </Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          placeholder={labels.emailPlaceholder}
          value={formData.email}
          onChange={handleChange}
          className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 ${
            errors.email ? "border-red-500" : ""
          }`}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password" className="text-white">
          {labels.password}
        </Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          placeholder={labels.passwordPlaceholder}
          value={formData.password}
          onChange={handleChange}
          className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 ${
            errors.password ? "border-red-500" : ""
          }`}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password}</p>
        )}
      </div>

      <div className="flex items-center justify-end">
        <button
          type="button"
          className="text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          {labels.forgotPassword}
        </button>
      </div>

      <Button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700 text-white"
        disabled={isLoading}
      >
        {isLoading ? labels.loggingIn : labels.login}
      </Button>
    </form>
  );
}
