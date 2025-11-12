"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

/**
 * SessionMonitor Component
 *
 * Monitors the authentication session and refreshes it before expiration.
 * - Checks session every 5 minutes
 * - Refreshes token if it expires within 1 hour
 * - Runs only when user is authenticated
 *
 * Usage: Add this component to the root layout or dashboard layout
 * <SessionMonitor />
 */
export function SessionMonitor() {
  const { isAuthenticated, refreshSessionIfNeeded } = useAuth();

  useEffect(() => {
    // Only monitor if user is authenticated
    if (!isAuthenticated) {
      return;
    }

    // Check session immediately on mount
    refreshSessionIfNeeded();

    // Check every 5 minutes (300000 ms)
    const interval = setInterval(() => {
      refreshSessionIfNeeded();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshSessionIfNeeded]);

  // This component doesn't render anything
  return null;
}
