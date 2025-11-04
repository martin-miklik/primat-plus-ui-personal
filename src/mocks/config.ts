// MSW Configuration
// Base URL for all API endpoints in mock handlers

export const MSW_API_BASE = "/api/v1";

/**
 * Helper function to build API paths
 * @param path - Relative path (e.g., "/subjects", "/auth/login")
 * @returns Full API path with base URL
 */
export function apiPath(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${MSW_API_BASE}${normalizedPath}`;
}

