import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AnswerFeedbackResponse } from "@/lib/validations/test";

/**
 * Answer state for tracking user responses
 */
export interface SavedAnswer {
  questionIndex: number;
  answer: string | string[] | boolean | null;
  feedback?: AnswerFeedbackResponse;
  answeredAt: string; // ISO timestamp
}

/**
 * Test progress state stored locally
 */
interface TestProgressState {
  instanceId: string | null;
  currentQuestionIndex: number;
  answers: SavedAnswer[];
  lastUpdated: string; // ISO timestamp
}

/**
 * Test progress store
 */
interface TestProgressStore {
  // State per test instance (keyed by instanceId)
  progress: Record<string, TestProgressState>;

  // Actions
  saveProgress: (
    instanceId: string,
    currentQuestionIndex: number,
    answers: SavedAnswer[]
  ) => void;
  loadProgress: (instanceId: string) => TestProgressState | null;
  clearProgress: (instanceId: string) => void;
  clearAllProgress: () => void;

  // Cleanup old progress (older than 7 days)
  cleanupOldProgress: () => void;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const useTestProgressStore = create<TestProgressStore>()(
  persist(
    (set, get) => ({
      progress: {},

      // Save current test progress
      saveProgress: (instanceId, currentQuestionIndex, answers) => {
        set(
          (state) => ({
            progress: {
              ...state.progress,
              [instanceId]: {
                instanceId,
                currentQuestionIndex,
                answers,
                lastUpdated: new Date().toISOString(),
              },
            },
          }),
          false
        );
      },

      // Load saved progress for an instance
      loadProgress: (instanceId) => {
        const state = get();
        const progress = state.progress[instanceId];

        if (!progress) return null;

        // Check if progress is too old (>7 days)
        const lastUpdated = new Date(progress.lastUpdated).getTime();
        const now = Date.now();

        if (now - lastUpdated > SEVEN_DAYS_MS) {
          // Progress is stale, clean it up
          get().clearProgress(instanceId);
          return null;
        }

        return progress;
      },

      // Clear progress for specific instance
      clearProgress: (instanceId) => {
        set((state) => {
          const { [instanceId]: _, ...rest } = state.progress;
          return { progress: rest };
        }, false);
      },

      // Clear all stored progress
      clearAllProgress: () => {
        set({ progress: {} }, false);
      },

      // Remove progress older than 7 days
      cleanupOldProgress: () => {
        set((state) => {
          const now = Date.now();
          const cleaned: Record<string, TestProgressState> = {};

          Object.entries(state.progress).forEach(([id, data]) => {
            const lastUpdated = new Date(data.lastUpdated).getTime();
            if (now - lastUpdated <= SEVEN_DAYS_MS) {
              cleaned[id] = data;
            }
          });

          return { progress: cleaned };
        }, false);
      },
    }),
    {
      name: "test-progress-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist the progress object
      partialize: (state) => ({ progress: state.progress }),
    }
  )
);

// Run cleanup on load
if (typeof window !== "undefined") {
  useTestProgressStore.getState().cleanupOldProgress();
}
