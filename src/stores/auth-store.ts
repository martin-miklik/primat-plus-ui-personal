import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import { User } from "@/lib/validations/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isValidated: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setValidated: (validated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isValidated: false,

        setAuth: (user, token) =>
          set(
            {
              user,
              token,
              isAuthenticated: true,
              isValidated: true,
            },
            false,
            "auth/setAuth"
          ),

        clearAuth: () =>
          set(
            {
              user: null,
              token: null,
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
      }),
      {
        name: "auth-storage",
        storage: createJSONStorage(() => localStorage),
      }
    ),
    { name: "AuthStore" }
  )
);
