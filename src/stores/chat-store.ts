import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ChatModel = "fast" | "accurate";

export type MessageStatus = "sending" | "streaming" | "complete" | "error";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  status?: MessageStatus;
  model?: ChatModel;
}

interface ChatState {
  messagesBySource: Record<number, ChatMessage[]>;
  selectedModel: ChatModel;
  isStreaming: boolean;
  activeChannel: string | null;
  activeJobId: string | null;
}

interface ChatActions {
  // Message management
  addUserMessage: (sourceId: number, message: string) => string;
  startAssistantMessage: (
    sourceId: number,
    messageId: string,
    model: ChatModel
  ) => void;
  appendChunk: (sourceId: number, messageId: string, chunk: string) => void;
  completeMessage: (sourceId: number, messageId: string) => void;
  setError: (sourceId: number, messageId: string, error: string) => void;

  // Model and streaming state
  setModel: (model: ChatModel) => void;
  setStreaming: (isStreaming: boolean) => void;
  setActiveChannel: (channel: string | null) => void;
  setActiveJobId: (jobId: string | null) => void;

  // Utility
  clearMessages: (sourceId: number) => void;
  initializeWelcomeMessage: (sourceId: number, sourceName: string) => void;

  // Selectors
  getMessages: (sourceId: number) => ChatMessage[];
  getLatestMessage: (sourceId: number) => ChatMessage | undefined;
  getStreamingMessage: (sourceId: number) => ChatMessage | undefined;
}

type ChatStore = ChatState & ChatActions;

const generateMessageId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      messagesBySource: {},
      selectedModel: "fast",
      isStreaming: false,
      activeChannel: null,
      activeJobId: null,

      // Actions
      addUserMessage: (sourceId, message) => {
        const messageId = generateMessageId();
        const newMessage: ChatMessage = {
          id: messageId,
          role: "user",
          content: message,
          timestamp: Date.now(),
          status: "sending",
        };

        set((state) => ({
          messagesBySource: {
            ...state.messagesBySource,
            [sourceId]: [...(state.messagesBySource[sourceId] || []), newMessage],
          },
        }));

        return messageId;
      },

      startAssistantMessage: (sourceId, messageId, model) => {
        const newMessage: ChatMessage = {
          id: messageId,
          role: "assistant",
          content: "",
          timestamp: Date.now(),
          status: "streaming",
          model,
        };

        set((state) => ({
          messagesBySource: {
            ...state.messagesBySource,
            [sourceId]: [...(state.messagesBySource[sourceId] || []), newMessage],
          },
        }));
      },

      appendChunk: (sourceId, messageId, chunk) => {
        set((state) => {
          const messages = state.messagesBySource[sourceId] || [];
          const messageIndex = messages.findIndex((m) => m.id === messageId);

          if (messageIndex === -1) return state;

          const updatedMessages = [...messages];
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            content: updatedMessages[messageIndex].content + chunk,
            status: "streaming",
          };

          return {
            messagesBySource: {
              ...state.messagesBySource,
              [sourceId]: updatedMessages,
            },
          };
        });
      },

      completeMessage: (sourceId, messageId) => {
        set((state) => {
          const messages = state.messagesBySource[sourceId] || [];
          const messageIndex = messages.findIndex((m) => m.id === messageId);

          if (messageIndex === -1) return state;

          const updatedMessages = [...messages];
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            status: "complete",
          };

          // Also update user message status if it was the one being sent
          const userMessageIndex = messages.findIndex(
            (m) => m.role === "user" && m.status === "sending"
          );
          if (userMessageIndex !== -1) {
            updatedMessages[userMessageIndex] = {
              ...updatedMessages[userMessageIndex],
              status: "complete",
            };
          }

          return {
            messagesBySource: {
              ...state.messagesBySource,
              [sourceId]: updatedMessages,
            },
          };
        });
      },

      setError: (sourceId, messageId, error) => {
        set((state) => {
          const messages = state.messagesBySource[sourceId] || [];
          const messageIndex = messages.findIndex((m) => m.id === messageId);

          if (messageIndex === -1) return state;

          const updatedMessages = [...messages];
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            status: "error",
            content:
              updatedMessages[messageIndex].content ||
              `Error: ${error}`,
          };

          return {
            messagesBySource: {
              ...state.messagesBySource,
              [sourceId]: updatedMessages,
            },
          };
        });
      },

      setModel: (model) => set({ selectedModel: model }),

      setStreaming: (isStreaming) => set({ isStreaming }),

      setActiveChannel: (channel) => set({ activeChannel: channel }),

      setActiveJobId: (jobId) => set({ activeJobId: jobId }),

      clearMessages: (sourceId) => {
        set((state) => ({
          messagesBySource: {
            ...state.messagesBySource,
            [sourceId]: [],
          },
        }));
      },

      initializeWelcomeMessage: (sourceId, sourceName) => {
        const state = get();
        const messages = state.messagesBySource[sourceId];

        // Only initialize if no messages exist
        if (!messages || messages.length === 0) {
          const welcomeMessage: ChatMessage = {
            id: generateMessageId(),
            role: "assistant",
            content: `Ahoj! Jsem tvůj AI asistent pro materiál **${sourceName}**. Mohu ti pomoci s otázkami, vysvětlením pojmů nebo shrnutím obsahu. Na co se chceš zeptat?`,
            timestamp: Date.now(),
            status: "complete",
          };

          set((state) => ({
            messagesBySource: {
              ...state.messagesBySource,
              [sourceId]: [welcomeMessage],
            },
          }));
        }
      },

      // Selectors
      getMessages: (sourceId) => {
        return get().messagesBySource[sourceId] || [];
      },

      getLatestMessage: (sourceId) => {
        const messages = get().messagesBySource[sourceId] || [];
        return messages[messages.length - 1];
      },

      getStreamingMessage: (sourceId) => {
        const messages = get().messagesBySource[sourceId] || [];
        return messages.find((m) => m.status === "streaming");
      },
    }),
    {
      name: "chat-storage",
      // Only persist messages, not streaming state or active channel
      partialize: (state) => ({
        messagesBySource: state.messagesBySource,
        selectedModel: state.selectedModel,
      }),
    }
  )
);


