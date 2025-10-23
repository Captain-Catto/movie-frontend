"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { loginWithEmail, register: registerUser, loginWithGoogle } = useAuth();

  const handleLoginSuccess = async (email: string, password: string) => {
    try {
      const result = await loginWithEmail(email, password);

      if (result.success) {
        setSuccess("Đăng nhập thành công!");
        setTimeout(() => {
          onClose();
          onSuccess?.();
          // Auth state automatically updated via context
        }, 1000);
      } else {
        handleError(result.error || "Đăng nhập thất bại");
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi. Vui lòng thử lại.";
      handleError(errorMessage);
    }
  };

  const handleRegisterSuccess = async (
    name: string,
    email: string,
    password: string
  ) => {
    try {
      const result = await registerUser(name, email, password);

      if (result.success) {
        setSuccess("Đăng ký thành công! Chào mừng bạn đến với MovieStream.");
        setTimeout(() => {
          onClose();
          onSuccess?.();
          // Auth state automatically updated via context
        }, 1500);
      } else {
        handleError(result.error || "Đăng ký thất bại");
      }
    } catch (error: unknown) {
      console.error("Registration error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi. Vui lòng thử lại.";
      handleError(errorMessage);
    }
  };

  const handleError = (message: string) => {
    setError(message);
    setTimeout(() => setError(""), 5000);
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setError("");

      const result = await loginWithGoogle();

      if (result.success) {
        setSuccess("Đăng nhập Google thành công!");
        setTimeout(() => {
          onClose();
          onSuccess?.();
          // Auth state automatically updated via context
        }, 1000);
      } else {
        handleError(result.error || "Đăng nhập Google thất bại");
      }
    } catch (error: unknown) {
      console.error("Google login error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Đăng nhập Google thất bại. Vui lòng thử lại.";
      handleError(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "login" | "register");
    setError("");
    setSuccess("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white text-center">
            {activeTab === "login" ? "Đăng nhập" : "Đăng ký"}
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-center">
            {activeTab === "login"
              ? "Đăng nhập để truy cập đầy đủ tính năng"
              : "Tạo tài khoản mới để bắt đầu"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-md text-sm">
            {success}
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger
              value="login"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              Đăng nhập
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              Đăng ký
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6">
            <LoginForm onSuccess={handleLoginSuccess} onError={handleError} />

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              <FcGoogle className="w-5 h-5 mr-2" />
              {isGoogleLoading ? "Đang xử lý..." : "Đăng nhập với Google"}
            </Button>
          </TabsContent>

          <TabsContent value="register" className="mt-6">
            <RegisterForm
              onSuccess={handleRegisterSuccess}
              onError={handleError}
            />

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">
                  Hoặc đăng ký với
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              <FcGoogle className="w-5 h-5 mr-2" />
              {isGoogleLoading ? "Đang xử lý..." : "Đăng ký với Google"}
            </Button>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-gray-400 mt-4">
          <p>Bằng cách tiếp tục, bạn đồng ý với</p>
          <p>
            <span className="text-red-400 hover:underline cursor-pointer">
              Điều khoản dịch vụ
            </span>{" "}
            và{" "}
            <span className="text-red-400 hover:underline cursor-pointer">
              Chính sách bảo mật
            </span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
