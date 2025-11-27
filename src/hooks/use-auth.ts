"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Main authentication hook
 *
 * Provides access to auth state and actions.
 * All returned functions are stable references from the store.
 *
 * @example
 * const { user, isAuthenticated, validateSession } = useAuth();
 */
export function useAuth() {
  // Get state and actions from store
  // Store actions are stable references - never recreated
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isValidated = useAuthStore((state) => state.isValidated);
  const hasValidatedThisSession = useAuthStore(
    (state) => state.hasValidatedThisSession
  );

  // Actions - these are stable references from the store
  const validateSession = useAuthStore((state) => state.validateSession);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setAuth = useAuthStore((state) => state.setAuth);
  const isTokenExpiringSoon = useAuthStore(
    (state) => state.isTokenExpiringSoon
  );

  // Simple logout function
  const logout = clearAuth;

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isValidated,
    hasValidatedThisSession,
    validateSession,
    logout,
    setAuth,
    isTokenExpiringSoon,
  };
}

/**
 * Hook for protected pages
 *
 * Redirects to /login if not authenticated after validation.
 *
 * @example
 * function DashboardPage() {
 *   const { user, isLoading } = useRequireAuth();
 *   if (isLoading) return <LoadingSpinner />;
 *   return <div>Welcome {user.name}</div>;
 * }
 */
export function useRequireAuth() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    // Wait for validation to complete
    if (!auth.isValidated) {
      return;
    }

    // Redirect if not authenticated
    if (!auth.isAuthenticated) {
      router.push("/login");
    }
  }, [auth.isAuthenticated, auth.isValidated, router]);

  return auth;
}

/**
 * Hook for guest-only pages (like login)
 *
 * Redirects to / if already authenticated.
 *
 * @example
 * function LoginPage() {
 *   useRequireGuest();
 *   return <LoginForm />;
 * }
 */
export function useRequireGuest() {
  const router = useRouter();
  const { isAuthenticated, isValidated } = useAuth();

  useEffect(() => {
    // Wait for validation to complete
    if (!isValidated) {
      return;
    }

    // Redirect if authenticated
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isValidated, router]);
}
