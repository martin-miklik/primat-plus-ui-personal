"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { useLogin } from "@/lib/api/mutations/use-login";
import { useAuthStore } from "@/stores/auth-store";
import { GuestGuard } from "@/components/auth";
import { toast } from "sonner";
import { LoginInput } from "@/lib/validations/auth";
import { ApiError, NetworkError } from "@/lib/errors";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Login Page
 *
 * Public authentication page with:
 * - Name/password login form
 * - Form validation with Zod
 * - MSW mock authentication
 * - Session persistence to auth store
 * - Redirect to dashboard on success
 * - Error handling with i18n messages
 */
export default function LoginPage() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const loginMutation = useLogin();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (data: LoginInput) => {
    try {
      const { user, token } = await loginMutation.mutateAsync(data);

      // Save auth state to store (persisted to localStorage)
      setAuth(user, token);

      // Show success message
      toast.success(t("success"));

      // Redirect to dashboard
      router.push("/");
    } catch (error) {
      // Handle different error types with i18n messages
      if (error instanceof ApiError) {
        if (error.code === "INVALID_CREDENTIALS") {
          toast.error(t("errors.invalidCredentials"));
        } else {
          toast.error(t("errors.unknownError"));
        }
      } else if (error instanceof NetworkError) {
        toast.error(t("errors.networkError"));
      } else {
        toast.error(t("errors.unknownError"));
      }
    }
  };

  return (
    <GuestGuard>
      <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">{t("title")}</CardTitle>
            <CardDescription>{t("subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm onSubmit={handleLogin} />
          </CardContent>
        </Card>
      </div>
    </GuestGuard>
  );
}
