import { ApiError, NetworkError } from "@/lib/errors";
import { API_TIMEOUT, API_BASE_URL } from "@/lib/constants";
import { isPaywallError } from "@/lib/utils/error-mapping";

interface RequestOptions extends RequestInit {
  timeout?: number;
  skipAuth?: boolean; // Skip adding Authorization header
}

/**
 * Get auth token from localStorage
 * Note: This is safe to call on client-side only
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return null;

    const parsed = JSON.parse(authStorage);
    return parsed?.state?.token || null;
  } catch (error) {
    // If parsing fails, localStorage is corrupted - clear it
    console.error("Failed to parse auth storage, clearing corrupted data:", error);
    try {
      localStorage.removeItem("auth-storage");
    } catch (e) {
      console.error("Failed to clear corrupted storage:", e);
    }
    return null;
  }
}

// Fetch wrapper with retry logic and error handling
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    timeout = API_TIMEOUT,
    headers = {},
    skipAuth = false,
    ...restOptions
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;

    // Add Authorization header if token exists and not skipped
    const authHeaders: Record<string, string> = {};
    if (!skipAuth) {
      const token = getAuthToken();
      if (token) {
        authHeaders.Authorization = `Bearer ${token}`;
      }
    }

    // Log request in development for debugging
    if (process.env.NODE_ENV === "development") {
      console.debug(`[API] ${restOptions.method || "GET"} ${url}`);
    }

    const response = await fetch(url, {
      ...restOptions,
      headers: {
        "Content-Type": "application/json",
        ...headers, // User headers first
        ...authHeaders, // Auth header last (highest priority, cannot be overridden)
      },
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Extract error details from various possible response formats
      const errorMessage =
        errorData.message ||
        errorData.title ||
        errorData.error?.message ||
        `HTTP ${response.status}: ${response.statusText}`;

      const errorCode = errorData.code || errorData.error?.code;
      const errorContext = errorData.context || errorData.error?.context;

      // Create enriched error with endpoint info for paywall detection
      const apiError = new ApiError(
        errorMessage,
        response.status,
        errorCode,
        errorContext,
        endpoint
      );

      // Mark as paywall error if it matches criteria
      // This allows mutation hooks to handle paywall triggers
      if (isPaywallError(response.status, errorCode)) {
        (apiError as ApiError & { isPaywallError?: boolean }).isPaywallError = true;
      }

      throw apiError;
    }

    // Return parsed JSON response
    const data = await response.json();
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort/timeout
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new NetworkError("Request timeout");
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new NetworkError();
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Wrap other errors
    throw new ApiError(
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
}

// GET request helper
export async function get<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  return apiClient<T>(endpoint, { ...options, method: "GET" });
}

// POST request helper
export async function post<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestOptions
): Promise<T> {
  return apiClient<T>(endpoint, {
    ...options,
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

// PUT request helper
export async function put<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestOptions
): Promise<T> {
  return apiClient<T>(endpoint, {
    ...options,
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
}

// PATCH request helper
export async function patch<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestOptions
): Promise<T> {
  return apiClient<T>(endpoint, {
    ...options,
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
  });
}

// DELETE request helper
export async function del<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  return apiClient<T>(endpoint, { ...options, method: "DELETE" });
}
