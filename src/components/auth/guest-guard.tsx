"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/use-auth";

interface GuestGuardProps {
  children: ReactNode;
}

/**
 * GuestGuard Component
 *
 * Protects guest-only routes (like login page).
 * - Redirects to / if already authenticated
 * - Shows loading state during validation
 *
 * @example
 * <GuestGuard>
 *   <LoginForm />
 * </GuestGuard>
 */
export function GuestGuard({ children }: GuestGuardProps) {
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

  // Redirect to dashboard if authenticated (after validation completes)
  useEffect(() => {
    if (isValidated && isAuthenticated && !isLoading) {
      router.push("/");
    }
  }, [isValidated, isAuthenticated, isLoading, router]);

  // Show loading state while validating
  if (!isValidated || isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  // Don't render children if authenticated (prevents flash during redirect)
  if (isAuthenticated) {
    return null;
  }

  // User is not authenticated, render guest content
  return <>{children}</>;
}
