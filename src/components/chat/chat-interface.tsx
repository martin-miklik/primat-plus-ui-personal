"use client";

import { useEffect, useRef, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useChatStore } from "@/stores/chat-store";
import { useSendMessage } from "@/lib/api/mutations/chat";
import { listenToMockCentrifugo } from "@/mocks/utils/mock-centrifugo";
import { useJobSubscription } from "@/hooks/use-job-subscription";
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
import { usePaywall } from "@/hooks/use-paywall";
import { ApiError } from "@/lib/errors";

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

export function ChatInterface({
  sourceId,
  sourceName,
  subjectId,
  topicId,
}: ChatInterfaceProps) {
  const t = useTranslations("chat");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { checkLimit, showPaywall, isAtLimit } = usePaywall();

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

  // Phase 2: Real Centrifugo subscription using unified hook
  useJobSubscription({
    channel: USE_REAL_CENTRIFUGO ? (activeChannel ?? undefined) : undefined,
    process: "chat",
    enabled: USE_REAL_CENTRIFUGO && !!activeChannel,
    onStarted: () => {
      setStreaming(true);
    },
    onProgress: (event) => {
      // Handle chunk events
      if (event.type === "chunk" && event.content) {
        appendChunk(sourceId, `ai-${activeJobId}`, event.content);
      }
    },
    onComplete: () => {
      if (activeJobId) {
        completeMessage(sourceId, `ai-${activeJobId}`);
        setStreaming(false);
        setActiveChannel(null);
        setActiveJobId(null);
      }
    },
    onError: (event, errorMsg) => {
      if (activeJobId) {
        setError(sourceId, `ai-${activeJobId}`, errorMsg);
        setStreaming(false);
        setActiveChannel(null);
        setActiveJobId(null);
        toast.error(t("errors.sendFailed"), {
          description: errorMsg,
        });
      }
    },
  });

  // Phase 1: Mock Centrifugo (for development with MSW)
  // Mock events are now handled through the unified subscription hook
  useEffect(() => {
    if (USE_REAL_CENTRIFUGO || !activeChannel || !activeJobId) return;

    const handleMockEvent = (event: any) => {
      // Map mock events to store actions
      switch (event.type) {
        case "job_started":
          setStreaming(true);
          break;
        case "chunk":
          if (event.content) {
            appendChunk(sourceId, `ai-${activeJobId}`, event.content);
          }
          break;
        case "complete":
          completeMessage(sourceId, `ai-${activeJobId}`);
          setStreaming(false);
          setActiveChannel(null);
          setActiveJobId(null);
          break;
        case "error":
          setError(sourceId, `ai-${activeJobId}`, event.message || event.error);
          setStreaming(false);
          setActiveChannel(null);
          setActiveJobId(null);
          toast.error(t("errors.sendFailed"), {
            description: event.message || event.error,
          });
          break;
      }
    };

    const cleanup = listenToMockCentrifugo(activeChannel, handleMockEvent);
    return cleanup;
  }, [activeChannel, activeJobId, sourceId, appendChunk, completeMessage, setStreaming, setActiveChannel, setActiveJobId, setError, t]);

  const handleInputFocus = () => {
    // Soft paywall check - show warning when approaching limit
    if (!checkLimit("chat_input")) {
      showPaywall("chat_limit_soft");
    }
  };

  const handleSend = async (message: string) => {
    // Hard paywall check - block sending if at limit
    if (!checkLimit("chat_send")) {
      showPaywall("chat_limit_hard");
      return;
    }

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
      // Check if backend returned chat limit error
      if (error instanceof ApiError && error.code === "CHAT_LIMIT_REACHED") {
        showPaywall("chat_limit_hard");
      }
      // Other error handling is done by the mutation hook (toast)
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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:h-9 md:w-9 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>

            {/* Source name and subtitle */}
            <div className="min-w-0 flex-1">
              <h2 className="text-base md:text-lg font-semibold truncate">
                {sourceName}
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground hidden md:block">
                {t("subtitle")}
              </p>
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
      <ChatInput 
        onSend={handleSend} 
        onFocus={handleInputFocus}
        disabled={isStreaming || isAtLimit("chat")} 
        placeholder={isAtLimit("chat") ? t("limitReached") : undefined}
      />
    </div>
  );
}
