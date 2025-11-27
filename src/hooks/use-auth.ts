"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { get } from "@/lib/api/client";
import { User } from "@/lib/validations/auth";
import { ApiError } from "@/lib/errors";

interface SessionResponse {
  data: User;
}

/**
 * Main authentication hook
 *
 * Provides access to auth state and session validation.
 * Use this in components that need to check auth status.
 *
 * @example
 * const { user, isAuthenticated, isLoading } = useAuth();
 */
export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    isValidated,
    setAuth,
    clearAuth,
    setLoading,
    setValidated,
  } = useAuthStore();

  /**
   * Validate current session by calling /api/v1/me
   * Returns true if session is valid, false otherwise
   */
  const validateSession = useCallback(async (): Promise<boolean> => {
    // No token, no validation needed
    if (!token) {
      setValidated(true);
      return false;
    }

    setLoading(true);

    try {
      // Both MSW and real backend return { data: user }
      const response = await get<SessionResponse>("/me");
      setAuth(response.data, token);
      setValidated(true);
      return true;
    } catch (error) {
      // Session invalid or expired, or endpoint not found (wrong route)
      if (
        error instanceof ApiError &&
        (error.statusCode === 401 || error.statusCode === 404)
      ) {
        console.warn(
          `Session validation failed with ${error.statusCode}, clearing auth`
        );
        clearAuth();
        setValidated(true);
        return false;
      }

      // Network error - don't logout, assume session still valid (graceful degradation)
      // BUT: mark as validated to prevent infinite loading
      console.error("Session validation error:", error);
      setValidated(true);

      // If we already had a user, keep them logged in (graceful degradation)
      // If not, clear auth to prevent stuck state
      if (!isAuthenticated) {
        console.warn(
          "No authenticated session found after validation error, clearing auth"
        );
        clearAuth();
      }

      return isAuthenticated;
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated, setAuth, clearAuth, setLoading, setValidated]);

  /**
   * Logout user and clear session
   */
  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  /**
   * Check and refresh session if token is expiring soon
   * Should be called periodically in the app
   */
  const refreshSessionIfNeeded = useCallback(async (): Promise<void> => {
    const store = useAuthStore.getState();

    // Check if token is expiring within 1 hour
    if (store.isTokenExpiringSoon()) {
      console.log("Token expiring soon, refreshing session...");
      await validateSession();
    }
  }, [validateSession]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isValidated,
    validateSession,
    refreshSessionIfNeeded,
    logout,
  };
}

/**
 * Hook for protected pages
 *
 * Redirects to /login if not authenticated.
 * Shows loading state during validation.
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
