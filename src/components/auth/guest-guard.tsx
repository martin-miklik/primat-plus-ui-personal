"use client";

import { useEffect, ReactNode, useState } from "react";
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
 * - Has timeout fallback to prevent infinite loading
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
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Validate session on mount
  useEffect(() => {
    if (!isValidated) {
      validateSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValidated]); // Only run when isValidated changes

  // Timeout fallback - if validation takes too long (15s), assume not authenticated
  // This prevents infinite loading if session validation gets stuck
  useEffect(() => {
    if (!isValidated) {
      const timeout = setTimeout(() => {
        console.warn(
          "GuestGuard: Session validation timeout - assuming not authenticated"
        );
        setTimeoutReached(true);
      }, 15000); // 15 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isValidated]);

  // Redirect to dashboard if authenticated (after validation completes)
  useEffect(() => {
    if (isValidated && isAuthenticated && !isLoading) {
      router.push("/");
    }
  }, [isValidated, isAuthenticated, isLoading, router]);

  // Show loading state while validating
  // After timeout, allow guest access to prevent stuck state
  if ((!isValidated || isLoading) && !timeoutReached) {
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
