"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * AuthGuard Component
 *
 * Protects routes by requiring authentication.
 * - Validates session ONCE per browser session using store flag
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
