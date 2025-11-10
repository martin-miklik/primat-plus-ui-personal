"use client";

import { useEffect, useRef } from "react";
import type { Subscription } from "centrifuge";
import { useCentrifuge } from "./use-centrifuge";

interface ChatEvent {
  type: "chat_started" | "gemini_chunk" | "gemini_complete" | "chat_error";
  jobId: string;
  content?: string;
  error?: string;
  timestamp: number;
}

interface UseChatSubscriptionOptions {
  channel: string | null;
  enabled: boolean;
  onEvent: (event: ChatEvent) => void;
}

/**
 * Hook for subscribing to real Centrifugo chat channels
 * Based on the upload subscription pattern
 */
export function useChatSubscription({
  channel,
  enabled,
  onEvent,
}: UseChatSubscriptionOptions) {
  const { client, isConnected } = useCentrifuge({ enabled });
  const subscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    // Don't subscribe if not enabled, no channel, or client not connected
    if (!enabled || !channel || !client || !isConnected) {
      return;
    }

    console.log(`[Chat] Subscribing to channel: ${channel}`);

    // Create subscription
    const subscription = client.newSubscription(channel);

    // Handle incoming messages
    subscription.on("publication", (ctx) => {
      console.log("[Chat] Received event:", ctx.data);
      
      const event = ctx.data as ChatEvent;
      onEvent(event);
    });

    // Handle subscription events
    subscription.on("subscribing", () => {
      console.log(`[Chat] Subscribing to ${channel}...`);
    });

    subscription.on("subscribed", () => {
      console.log(`[Chat] Successfully subscribed to ${channel}`);
    });

    subscription.on("unsubscribed", () => {
      console.log(`[Chat] Unsubscribed from ${channel}`);
    });

    subscription.on("error", (err) => {
      console.error(`[Chat] Subscription error on ${channel}:`, err);
    });

    // Subscribe
    subscription.subscribe();
    subscriptionRef.current = subscription;

    // Cleanup
    return () => {
      console.log(`[Chat] Cleaning up subscription for ${channel}`);
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current.removeAllListeners();
        subscriptionRef.current = null;
      }
    };
  }, [channel, enabled, client, isConnected, onEvent]);

  return {
    isSubscribed: !!subscriptionRef.current && isConnected,
  };
}


