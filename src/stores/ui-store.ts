import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";

interface UIState {
  // Sidebar
  sidebarOpen: boolean;

  // Theme (if you want to manage it here instead of next-themes)
  reducedMotion: boolean;

  // Modals - stack to support multiple modals
  modalStack: string[];

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId?: string) => void; // Close specific or top modal
  closeAllModals: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: false,
        reducedMotion: false,
        modalStack: [],

        toggleSidebar: () =>
          set(
            (state) => ({
              sidebarOpen: !state.sidebarOpen,
            }),
            false,
            "ui/toggleSidebar"
          ),

        setSidebarOpen: (open) =>
          set(
            {
              sidebarOpen: open,
            },
            false,
            "ui/setSidebarOpen"
          ),

        setReducedMotion: (reduced) =>
          set(
            {
              reducedMotion: reduced,
            },
            false,
            "ui/setReducedMotion"
          ),

        openModal: (modalId) =>
          set(
            (state) => ({
              modalStack: [...state.modalStack, modalId],
            }),
            false,
            "ui/openModal"
          ),

        closeModal: (modalId) =>
          set(
            (state) => ({
              modalStack: modalId
                ? state.modalStack.filter((id) => id !== modalId)
                : state.modalStack.slice(0, -1), // Remove last if no ID specified
            }),
            false,
            "ui/closeModal"
          ),

        closeAllModals: () =>
          set(
            {
              modalStack: [],
            },
            false,
            "ui/closeAllModals"
          ),
      }),
      {
        name: "ui-storage",
        storage: createJSONStorage(() => localStorage),
      }
    ),
    { name: "UIStore" }
  )
);
