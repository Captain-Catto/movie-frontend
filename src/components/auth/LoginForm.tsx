"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
interface LoginFormProps {
  onSuccess: (email: string, password: string) => void;
  onError: (message: string) => void;
}

export default function LoginForm({ onSuccess, onError }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
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
      await onSuccess(formData.email, formData.password);
    } catch (error) {
      console.error("Login error:", error);
      onError("Đã xảy ra lỗi. Vui lòng thử lại.");
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
      <div className="space-y-2">
        <Label htmlFor="login-email" className="text-white">
          Email
        </Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          placeholder="email@example.com"
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
          Mật khẩu
        </Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          placeholder="••••••••"
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
          Quên mật khẩu?
        </button>
      </div>

      <Button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700 text-white"
        disabled={isLoading}
      >
        {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
    </form>
  );
}
