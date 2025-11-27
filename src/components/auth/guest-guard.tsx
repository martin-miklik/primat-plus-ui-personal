"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";

interface GuestGuardProps {
  children: ReactNode;
}

/**
 * GuestGuard Component
 *
 * Protects guest-only routes (like login page).
 * - Validates session ONCE per browser session using store flag
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

  // Get state from store - stable selectors
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isValidated = useAuthStore((state) => state.isValidated);
  const hasValidatedThisSession = useAuthStore(
    (state) => state.hasValidatedThisSession
  );

  // Get action from store - stable reference
  const validateSession = useAuthStore((state) => state.validateSession);

  // Validate session ONCE on mount
  useEffect(() => {
    if (!hasValidatedThisSession) {
      validateSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount, not when hasValidatedThisSession changes

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
