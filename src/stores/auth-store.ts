import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import { User } from "@/lib/validations/auth";

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  tokenExpiresAt: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isValidated: boolean;
  hasValidatedThisSession: boolean; // Never reset - tracks if we've attempted validation this browser session

  // Actions (stable references - never recreated)
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setValidated: (validated: boolean) => void;
  isTokenExpiringSoon: () => boolean;

  // Session validation - moved to store for stable reference
  validateSession: () => Promise<boolean>;
  // Force re-validation (bypasses hasValidatedThisSession check) - for use after payment
  forceRevalidate: () => Promise<boolean>;
}

// API client import for store action
const apiGet = async <T>(endpoint: string): Promise<T> => {
  const { get } = await import("@/lib/api/client");
  return get<T>(endpoint);
};

// Get token from store state (for API calls)
const getTokenFromStorage = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const storage = localStorage.getItem("auth-storage");
    if (!storage) return null;
    const parsed = JSON.parse(storage);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        token: null,
        tokenExpiresAt: null,
        isAuthenticated: false,
        isLoading: false,
        isValidated: false,
        hasValidatedThisSession: false,

        setAuth: (user, token) => {
          const expiresAt = Date.now() + 86400 * 1000; // 24 hours
          set(
            {
              user,
              token,
              tokenExpiresAt: expiresAt,
              isAuthenticated: true,
              isValidated: true,
              hasValidatedThisSession: true,
            },
            false,
            "auth/setAuth"
          );
        },

        clearAuth: () =>
          set(
            {
              user: null,
              token: null,
              tokenExpiresAt: null,
              isAuthenticated: false,
              isValidated: true, // Mark as validated (validation complete, user is not authenticated)
              hasValidatedThisSession: true,
            },
            false,
            "auth/clearAuth"
          ),

        updateUser: (updates) =>
          set(
            (state) => ({
              user: state.user ? { ...state.user, ...updates } : null,
            }),
            false,
            "auth/updateUser"
          ),

        setLoading: (loading) =>
          set({ isLoading: loading }, false, "auth/setLoading"),

        setValidated: (validated) =>
          set({ isValidated: validated }, false, "auth/setValidated"),

        isTokenExpiringSoon: () => {
          const state = get();
          if (!state.tokenExpiresAt) return false;
          const oneHour = 60 * 60 * 1000;
          return state.tokenExpiresAt - Date.now() < oneHour;
        },

        // Validate session - stable store action, never recreated
        validateSession: async (): Promise<boolean> => {
          const state = get();

          // Already validated this session - don't validate again
          if (state.hasValidatedThisSession) {
            return state.isAuthenticated;
          }

          // No token - mark as validated (not authenticated)
          const token = state.token || getTokenFromStorage();
          if (!token) {
            set(
              { isValidated: true, hasValidatedThisSession: true },
              false,
              "auth/validateSession/noToken"
            );
            return false;
          }

          // Start loading
          set({ isLoading: true }, false, "auth/validateSession/start");

          try {
            interface SessionResponse {
              data: User;
            }
            const response = await apiGet<SessionResponse>("/me");

            // Success - set auth
            const expiresAt = Date.now() + 86400 * 1000;
            set(
              {
                user: response.data,
                token,
                tokenExpiresAt: expiresAt,
                isAuthenticated: true,
                isValidated: true,
                hasValidatedThisSession: true,
                isLoading: false,
              },
              false,
              "auth/validateSession/success"
            );
            return true;
          } catch (error) {
            // Check if it's a 401 or 404 error
            const isAuthError =
              error &&
              typeof error === "object" &&
              "statusCode" in error &&
              (error.statusCode === 401 || error.statusCode === 404);

            if (isAuthError) {
              // Invalid session - clear auth
              set(
                {
                  user: null,
                  token: null,
                  tokenExpiresAt: null,
                  isAuthenticated: false,
                  isValidated: true,
                  hasValidatedThisSession: true,
                  isLoading: false,
                },
                false,
                "auth/validateSession/authError"
              );
              return false;
            }

            // Network error - keep existing auth state if any, but mark as validated
            console.error("Session validation error:", error);
            set(
              {
                isValidated: true,
                hasValidatedThisSession: true,
                isLoading: false,
              },
              false,
              "auth/validateSession/networkError"
            );
            return get().isAuthenticated;
          }
        },

        // Force re-validation - bypasses hasValidatedThisSession check
        // Use after payment to refresh user's subscription status
        forceRevalidate: async (): Promise<boolean> => {
          const state = get();
          const token = state.token || getTokenFromStorage();

          if (!token) {
            return false;
          }

          // Don't set loading to avoid UI flickering
          try {
            interface SessionResponse {
              data: User;
            }
            const response = await apiGet<SessionResponse>("/me");

            // Success - update user data
            const expiresAt = Date.now() + 86400 * 1000;
            set(
              {
                user: response.data,
                token,
                tokenExpiresAt: expiresAt,
                isAuthenticated: true,
                isValidated: true,
                hasValidatedThisSession: true,
              },
              false,
              "auth/forceRevalidate/success"
            );
            return true;
          } catch (error) {
            console.error("Force revalidation error:", error);
            // Don't clear auth on error - user just paid, don't log them out
            return state.isAuthenticated;
          }
        },
      }),
      {
        name: "auth-storage",
        storage: createJSONStorage(() => localStorage),
        // Only persist essential auth data
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          tokenExpiresAt: state.tokenExpiresAt,
          isAuthenticated: state.isAuthenticated,
          // NOT persisted: isLoading, isValidated, hasValidatedThisSession
          // These are runtime-only states
        }),
        // Handle hydration - don't reset hasValidatedThisSession
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.error("Failed to rehydrate auth store:", error);
            try {
              localStorage.removeItem("auth-storage");
            } catch (e) {
              console.error("Failed to clear corrupted storage:", e);
            }
          }
          // Note: We DON'T reset isValidated or hasValidatedThisSession here
          // Let the AuthGuard trigger validation if needed
        },
      }
    ),
    { name: "AuthStore" }
  )
);
