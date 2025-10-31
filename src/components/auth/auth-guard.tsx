"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/use-auth";

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * AuthGuard Component
 *
 * Protects routes by requiring authentication.
 * - Validates session on mount
 * - Shows loading state during validation
 * - Redirects to /login if not authenticated
 *
 * @example
 * <AuthGuard>
 *   <DashboardContent />
 * </AuthGuard>
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const t = useTranslations("auth.session");
  const { isAuthenticated, isLoading, isValidated, validateSession } =
    useAuth();

  // Validate session on mount
  useEffect(() => {
    if (!isValidated) {
      validateSession();
    }
  }, [isValidated, validateSession]);

  // Redirect to login if not authenticated (after validation completes)
  useEffect(() => {
    if (isValidated && !isAuthenticated && !isLoading) {
      router.push("/login");
    }
  }, [isValidated, isAuthenticated, isLoading, router]);

  // Show loading state while validating
  if (!isValidated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">{t("checkingAuth")}</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (prevents flash during redirect)
  if (!isAuthenticated) {
    return null;
  }

  // User is authenticated, render protected content
  return <>{children}</>;
}
