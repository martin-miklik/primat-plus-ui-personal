import { ApiError, NetworkError } from "@/lib/errors";
import { API_TIMEOUT, API_BASE_URL } from "@/lib/constants";

interface RequestOptions extends RequestInit {
  timeout?: number;
}

// Fetch wrapper with retry logic and error handling
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { timeout = API_TIMEOUT, headers = {}, ...restOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...restOptions,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code
      );
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
