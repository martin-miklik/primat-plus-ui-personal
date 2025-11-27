"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth-store";

/**
 * SessionMonitor Component
 *
 * Monitors the authentication session and refreshes it before expiration.
 * - Checks session every 5 minutes
 * - Refreshes token if it expires within 1 hour
 * - Runs only when user is authenticated
 * - Uses stable store references to prevent infinite loops
 *
 * Usage: Add this component to the root layout or dashboard layout
 * <SessionMonitor />
 */
export function SessionMonitor() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isTokenExpiringSoon = useAuthStore(
    (state) => state.isTokenExpiringSoon
  );
  const forceRevalidate = useAuthStore((state) => state.forceRevalidate);

  // Use ref to prevent effect from running multiple times
  const hasStartedMonitoring = useRef(false);

  useEffect(() => {
    // Only monitor if user is authenticated
    if (!isAuthenticated) {
      hasStartedMonitoring.current = false;
      return;
    }

    // Prevent starting multiple monitors
    if (hasStartedMonitoring.current) {
      return;
    }
    hasStartedMonitoring.current = true;

    // Check if token is expiring soon on mount
    if (isTokenExpiringSoon()) {
      console.log("Token expiring soon, refreshing session...");
      forceRevalidate();
    }

    // Check every 5 minutes
    const interval = setInterval(() => {
      if (isTokenExpiringSoon()) {
        console.log("Token expiring soon, refreshing session...");
        forceRevalidate();
      }
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      hasStartedMonitoring.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Only depend on isAuthenticated

  // This component doesn't render anything
  return null;
}
