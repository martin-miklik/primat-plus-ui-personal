import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import { User } from "@/lib/validations/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  tokenExpiresAt: number | null; // Timestamp when token expires
  isAuthenticated: boolean;
  isLoading: boolean;
  isValidated: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setValidated: (validated: boolean) => void;
  isTokenExpiringSoon: () => boolean; // Check if token expires within 1 hour
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        tokenExpiresAt: null,
        isAuthenticated: false,
        isLoading: false,
        isValidated: false,

        setAuth: (user, token) => {
          // JWT tokens from backend expire in 86400 seconds (24 hours)
          const expiresAt = Date.now() + 86400 * 1000;
          
          set(
            {
              user,
              token,
              tokenExpiresAt: expiresAt,
              isAuthenticated: true,
              isValidated: true,
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
              isValidated: false,
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
          set(
            {
              isLoading: loading,
            },
            false,
            "auth/setLoading"
          ),

        setValidated: (validated) =>
          set(
            {
              isValidated: validated,
            },
            false,
            "auth/setValidated"
          ),

        isTokenExpiringSoon: () => {
          const state = get();
          if (!state.tokenExpiresAt) return false;
          
          // Check if token expires within 1 hour
          const oneHour = 60 * 60 * 1000;
          return state.tokenExpiresAt - Date.now() < oneHour;
        },
      }),
      {
        name: "auth-storage",
        storage: createJSONStorage(() => localStorage),
        // Add error handling for corrupted localStorage
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.error("Failed to rehydrate auth store:", error);
            // Clear corrupted storage
            try {
              localStorage.removeItem("auth-storage");
            } catch (e) {
              console.error("Failed to clear corrupted storage:", e);
            }
          }
        },
      }
    ),
    { name: "AuthStore" }
  )
);
