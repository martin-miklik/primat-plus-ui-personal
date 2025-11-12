import { useMutation } from "@tanstack/react-query";
import { post } from "@/lib/api/client";
import { LoginInput, User } from "@/lib/validations/auth";
import { ApiError, NetworkError } from "@/lib/errors";

// API Response type
/**
 * Backend login response structure
 * Backend returns { data: { accessToken, user } }
 */
interface BackendLoginResponse {
  data: {
    accessToken: string;
    user: User;
  };
}

/**
 * MSW login response structure (has data wrapper)
 */
interface MSWLoginResponse {
  data: {
    user: User;
    token: string;
  };
}

/**
 * Login mutation hook
 *
 * Authenticates user with email and password.
 * Returns user data and auth token on success.
 * Handles both MSW (mock) and real backend responses.
 *
 * @example
 * const loginMutation = useLogin();
 * await loginMutation.mutateAsync({ email: "user@example.com", password: "password123" });
 */
export function useLogin() {
  const isMSW = process.env.NEXT_PUBLIC_ENABLE_MSW === "true";

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      try {
        // Transform email -> login for backend
        const payload = {
          login: data.email,
          password: data.password,
        };

        if (isMSW) {
          // MSW returns { data: { user, token } }
          const response = await post<MSWLoginResponse>("/auth/login", payload, { skipAuth: true });
          return {
            user: response.data.user,
            token: response.data.token,
          };
        } else {
          // Real backend returns { data: { accessToken, user } }
          const response = await post<BackendLoginResponse>("/auth/login", payload, { skipAuth: true });
          return {
            user: response.data.user,
            token: response.data.accessToken,
          };
        }
      } catch (error) {
        // Re-throw with proper error type for better error handling
        if (error instanceof ApiError || error instanceof NetworkError) {
          throw error;
        }
        throw new ApiError("An unexpected error occurred during login");
      }
    },
  });
}
