import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Flashcard } from "@/lib/validations/flashcard";

interface FlashcardSessionState {
  // Session data
  cards: Flashcard[];
  currentIndex: number;
  completedCount: number;
  isActive: boolean;

  // Actions
  startSession: (cards: Flashcard[]) => void;
  nextCard: () => void;
  markCompleted: () => void;
  resetSession: () => void;
  
  // Getters
  getCurrentCard: () => Flashcard | null;
  getProgress: () => { current: number; total: number; percentage: number };
  isSessionComplete: () => boolean;
}

export const useFlashcardStore = create<FlashcardSessionState>()(
  devtools(
    (set, get) => ({
      // Initial state
      cards: [],
      currentIndex: 0,
      completedCount: 0,
      isActive: false,

      // Start a new practice session
      startSession: (cards) =>
        set(
          {
            cards,
            currentIndex: 0,
            completedCount: 0,
            isActive: true,
          },
          false,
          "flashcard/startSession"
        ),

      // Move to next card
      nextCard: () =>
        set(
          (state) => ({
            currentIndex: state.currentIndex + 1,
          }),
          false,
          "flashcard/nextCard"
        ),

      // Mark current card as completed
      markCompleted: () =>
        set(
          (state) => ({
            completedCount: state.completedCount + 1,
          }),
          false,
          "flashcard/markCompleted"
        ),

      // Reset session
      resetSession: () =>
        set(
          {
            cards: [],
            currentIndex: 0,
            completedCount: 0,
            isActive: false,
          },
          false,
          "flashcard/resetSession"
        ),

      // Get current card
      getCurrentCard: () => {
        const state = get();
        if (state.currentIndex >= state.cards.length) {
          return null;
        }
        return state.cards[state.currentIndex];
      },

      // Get progress information
      getProgress: () => {
        const state = get();
        const total = state.cards.length;
        const current = Math.min(state.completedCount, total);
        const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
        
        return {
          current,
          total,
          percentage,
        };
      },

      // Check if session is complete
      isSessionComplete: () => {
        const state = get();
        return state.completedCount >= state.cards.length && state.cards.length > 0;
      },
    }),
    { name: "FlashcardStore" }
  )
);












