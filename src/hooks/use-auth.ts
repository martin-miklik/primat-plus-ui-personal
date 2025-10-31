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
   * Validate current session by calling /api/auth/me
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
      const response = await get<SessionResponse>("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Session valid, update user data
      setAuth(response.data, token);
      setValidated(true);
      return true;
    } catch (error) {
      // Session invalid or expired
      if (error instanceof ApiError && error.statusCode === 401) {
        clearAuth();
        setValidated(true);
        return false;
      }

      // Network error - don't logout, assume session still valid (graceful degradation)
      console.error("Session validation error:", error);
      setValidated(true);
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

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isValidated,
    validateSession,
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
