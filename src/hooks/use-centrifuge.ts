"use client";

import { useEffect, useRef, useState } from "react";
import { Centrifuge, Subscription } from "centrifuge";
import { createCentrifugeClient } from "@/lib/centrifuge/client";

export interface UseCentrifugeOptions {
  enabled?: boolean;
  token?: string;
  debug?: boolean;
}

export function useCentrifuge(options: UseCentrifugeOptions = {}) {
  const { enabled = true, token, debug = false } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const centrifugeRef = useRef<Centrifuge | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Create Centrifuge client
    const client = createCentrifugeClient({ token, debug });
    centrifugeRef.current = client;

    // Set up connection handlers
    client.on("connecting", () => setIsConnecting(true));
    client.on("connected", () => {
      setIsConnected(true);
      setIsConnecting(false);
    });
    client.on("disconnected", () => {
      setIsConnected(false);
      setIsConnecting(false);
    });

    // Connect
    client.connect();

    // Cleanup
    return () => {
      client.disconnect();
      centrifugeRef.current = null;
    };
  }, [enabled, token, debug]);

  return {
    client: centrifugeRef.current,
    isConnected,
    isConnecting,
  };
}

export interface UseSubscriptionOptions<T = unknown> {
  enabled?: boolean;
  onPublication?: (data: T) => void;
  onSubscribed?: () => void;
  onUnsubscribed?: () => void;
  onError?: (error: Error) => void;
}

export function useSubscription<T = unknown>(
  channel: string,
  options: UseSubscriptionOptions<T> = {}
) {
  const {
    enabled = true,
    onPublication,
    onSubscribed,
    onUnsubscribed,
    onError,
  } = options;

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const subscriptionRef = useRef<Subscription | null>(null);
  const { client, isConnected } = useCentrifuge({ enabled });

  // Use refs for callbacks to avoid effect re-runs
  const onPublicationRef = useRef(onPublication);
  const onSubscribedRef = useRef(onSubscribed);
  const onUnsubscribedRef = useRef(onUnsubscribed);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onPublicationRef.current = onPublication;
    onSubscribedRef.current = onSubscribed;
    onUnsubscribedRef.current = onUnsubscribed;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (!enabled || !client || !isConnected || !channel) return;

    // Check if subscription already exists
    const existingSub = client.getSubscription(channel);
    if (existingSub) {
      // Reuse existing subscription
      subscriptionRef.current = existingSub;
      setIsSubscribed(existingSub.state === "subscribed");
      
      // Add our handlers to the existing subscription
      const publicationHandler = (ctx: { data: T }) => {
        const pubData = ctx.data as T;
        setData(pubData);
        onPublicationRef.current?.(pubData);
      };

      const subscribedHandler = () => {
        setIsSubscribed(true);
        onSubscribedRef.current?.();
      };

      const unsubscribedHandler = () => {
        setIsSubscribed(false);
        onUnsubscribedRef.current?.();
      };

      const errorHandler = (ctx: { error?: { message?: string } }) => {
        const error = new Error(ctx.error?.message || "Subscription error");
        onErrorRef.current?.(error);
      };

      existingSub.on("publication", publicationHandler);
      existingSub.on("subscribed", subscribedHandler);
      existingSub.on("unsubscribed", unsubscribedHandler);
      existingSub.on("error", errorHandler);

      // Cleanup only removes our handlers, doesn't unsubscribe
      return () => {
        existingSub.off("publication", publicationHandler);
        existingSub.off("subscribed", subscribedHandler);
        existingSub.off("unsubscribed", unsubscribedHandler);
        existingSub.off("error", errorHandler);
      };
    }

    // Create new subscription
    const sub = client.newSubscription(channel);

    // Set up subscription handlers
    sub.on("publication", (ctx) => {
      const pubData = ctx.data as T;
      setData(pubData);
      onPublicationRef.current?.(pubData);
    });

    sub.on("subscribed", () => {
      setIsSubscribed(true);
      onSubscribedRef.current?.();
    });

    sub.on("unsubscribed", () => {
      setIsSubscribed(false);
      onUnsubscribedRef.current?.();
    });

    sub.on("error", (ctx) => {
      const error = new Error(ctx.error?.message || "Subscription error");
      onErrorRef.current?.(error);
    });

    // Subscribe
    sub.subscribe();
    subscriptionRef.current = sub;

    // Cleanup
    return () => {
      sub.unsubscribe();
      sub.removeAllListeners();
      subscriptionRef.current = null;
    };
  }, [enabled, client, isConnected, channel]);

  return {
    subscription: subscriptionRef.current,
    isSubscribed,
    data,
    unsubscribe: () => subscriptionRef.current?.unsubscribe(),
  };
}
