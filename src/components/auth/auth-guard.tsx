"use client";

import { useEffect, ReactNode, useState } from "react";
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
 * - Has timeout fallback to prevent infinite loading
 *
 * @example
 * <AuthGuard>
 *   <DashboardContent />
 * </AuthGuard>
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const t = useTranslations("auth.session");
  const { isAuthenticated, isLoading, isValidated, validateSession, logout } =
    useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Validate session on mount
  useEffect(() => {
    if (!isValidated) {
      validateSession();
    }
  }, [isValidated, validateSession]);

  // Timeout fallback - if validation takes too long (15s), force redirect to login
  // This prevents infinite loading if session validation gets stuck
  useEffect(() => {
    if (!isValidated) {
      const timeout = setTimeout(() => {
        console.error("Session validation timeout - forcing logout");
        setTimeoutReached(true);
        logout();
      }, 15000); // 15 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isValidated, logout]);

  // Redirect to login if not authenticated (after validation completes)
  useEffect(() => {
    if ((isValidated && !isAuthenticated && !isLoading) || timeoutReached) {
      router.push("/login");
    }
  }, [isValidated, isAuthenticated, isLoading, timeoutReached, router]);

  // Show loading state while validating
  if (!isValidated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">{t("checkingAuth")}</p>
          {timeoutReached && (
            <p className="text-sm text-destructive mt-2">
              Přihlášení trvá příliš dlouho. Přesměrování na přihlašovací
              stránku...
            </p>
          )}
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
