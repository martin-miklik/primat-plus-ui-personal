"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useChatStore } from "@/stores/chat-store";
import { useSendMessage } from "@/lib/api/mutations/chat";
import { listenToMockCentrifugo } from "@/mocks/utils/mock-centrifugo";
import { useChatSubscription } from "@/hooks/use-chat-subscription";
import { useCentrifuge } from "@/hooks/use-centrifuge";
import { UserMessage } from "./user-message";
import { AssistantMessage } from "./assistant-message";
import { TypingIndicator } from "./typing-indicator";
import { ChatInput } from "./chat-input";
import { ModelToggle } from "./model-toggle";
import { ConnectionStatus } from "./connection-status";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Check if we should use real Centrifugo or MSW mock
const USE_REAL_CENTRIFUGO =
  process.env.NEXT_PUBLIC_ENABLE_MSW === "false" ||
  process.env.NEXT_PUBLIC_CHAT_USE_REAL_API === "true";

interface ChatInterfaceProps {
  sourceId: number;
  sourceName: string;
  subjectId: number;
  topicId: number;
}

export function ChatInterface({ sourceId, sourceName, subjectId, topicId }: ChatInterfaceProps) {
  const t = useTranslations("chat");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Chat store
  const messages = useChatStore((state) => state.getMessages(sourceId));
  const selectedModel = useChatStore((state) => state.selectedModel);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const activeChannel = useChatStore((state) => state.activeChannel);
  const activeJobId = useChatStore((state) => state.activeJobId);

  const initializeWelcomeMessage = useChatStore(
    (state) => state.initializeWelcomeMessage
  );
  const setModel = useChatStore((state) => state.setModel);
  const addUserMessage = useChatStore((state) => state.addUserMessage);
  const startAssistantMessage = useChatStore(
    (state) => state.startAssistantMessage
  );
  const appendChunk = useChatStore((state) => state.appendChunk);
  const completeMessage = useChatStore((state) => state.completeMessage);
  const setError = useChatStore((state) => state.setError);
  const setStreaming = useChatStore((state) => state.setStreaming);
  const setActiveChannel = useChatStore((state) => state.setActiveChannel);
  const setActiveJobId = useChatStore((state) => state.setActiveJobId);

  // Send message mutation
  const sendMessageMutation = useSendMessage();

  // Centrifuge connection (only for Phase 2)
  const { isConnected, isConnecting } = useCentrifuge({
    enabled: USE_REAL_CENTRIFUGO,
  });

  // Initialize welcome message on mount
  useEffect(() => {
    initializeWelcomeMessage(sourceId, sourceName);
  }, [sourceId, sourceName, initializeWelcomeMessage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle events from either mock or real Centrifugo
  const handleCentrifugoEvent = (event: {
    type: "chat_started" | "gemini_chunk" | "gemini_complete" | "chat_error";
    jobId: string;
    content?: string;
    error?: string;
    timestamp: number;
  }) => {
    if (!activeJobId) return;

    switch (event.type) {
      case "chat_started":
        setStreaming(true);
        break;

      case "gemini_chunk":
        if (event.content) {
          appendChunk(sourceId, `ai-${activeJobId}`, event.content);
        }
        break;

      case "gemini_complete":
        completeMessage(sourceId, `ai-${activeJobId}`);
        setStreaming(false);
        setActiveChannel(null);
        setActiveJobId(null);
        break;

      case "chat_error":
        setError(
          sourceId,
          `ai-${activeJobId}`,
          event.error || t("errors.generic")
        );
        setStreaming(false);
        setActiveChannel(null);
        setActiveJobId(null);
        toast.error(t("errors.sendFailed"), {
          description: event.error || t("errors.generic"),
        });
        break;
    }
  };

  // Phase 2: Real Centrifugo subscription
  useChatSubscription({
    channel: USE_REAL_CENTRIFUGO ? activeChannel : null,
    enabled: USE_REAL_CENTRIFUGO && !!activeChannel,
    onEvent: handleCentrifugoEvent,
  });

  // Phase 1: Mock Centrifugo (for development with MSW)
  useEffect(() => {
    if (USE_REAL_CENTRIFUGO || !activeChannel) return;

    const cleanup = listenToMockCentrifugo(activeChannel, handleCentrifugoEvent);
    return cleanup;
  }, [
    activeChannel,
    USE_REAL_CENTRIFUGO,
    // handleCentrifugoEvent is defined above and uses these dependencies
  ]);

  const handleSend = async (message: string) => {
    // Add user message to store
    addUserMessage(sourceId, message);

    try {
      // Send to backend
      const response = await sendMessageMutation.mutateAsync({
        message,
        sourceId,
        model: selectedModel,
      });

      // Store channel and jobId for subscription
      setActiveChannel(response.channel);
      setActiveJobId(response.jobId);

      // Create placeholder for AI response
      startAssistantMessage(sourceId, `ai-${response.jobId}`, selectedModel);
    } catch (error) {
      // Error handling is done by the mutation hook (toast)
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background px-3 py-3 md:px-4 md:py-4">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            {/* Back button */}
            <Link href={`/predmety/${subjectId}/temata/${topicId}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 flex-shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            
            {/* Source name and subtitle */}
            <div className="min-w-0 flex-1">
              <h2 className="text-base md:text-lg font-semibold truncate">{sourceName}</h2>
              <p className="text-xs md:text-sm text-muted-foreground hidden md:block">{t("subtitle")}</p>
            </div>
            
            {/* Show connection status only in Phase 2 */}
            {USE_REAL_CENTRIFUGO && (
              <ConnectionStatus
                isConnected={isConnected}
                isConnecting={isConnecting}
                className="hidden lg:flex"
              />
            )}
          </div>
          
          {/* Model toggle */}
          <ModelToggle
            value={selectedModel}
            onChange={setModel}
            disabled={isStreaming}
          />
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3 md:p-4">
        <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <div key={message.id}>
              {message.role === "user" ? (
                <UserMessage message={message} />
              ) : (
                <AssistantMessage message={message} />
              )}
              {/* Show typing indicator after last user message if streaming */}
              {message.role === "user" &&
                index === messages.length - 1 &&
                isStreaming &&
                !messages.some((m) => m.status === "streaming") && (
                  <div className="mt-4 md:mt-6">
                    <TypingIndicator />
                  </div>
                )}
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <Separator />

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </div>
  );
}

