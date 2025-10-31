import { useMutation } from "@tanstack/react-query";
import { post } from "@/lib/api/client";
import { LoginInput, User } from "@/lib/validations/auth";
import { ApiError, NetworkError } from "@/lib/errors";

// API Response type
interface LoginResponse {
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

/**
 * Login mutation hook
 *
 * Authenticates user with email and password.
 * Returns user data and auth token on success.
 *
 * @example
 * const loginMutation = useLogin();
 * await loginMutation.mutateAsync({ email: "user@example.com", password: "password123" });
 */
export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginInput) => {
      try {
        const response = await post<LoginResponse>("/auth/login", data);
        return response.data;
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
