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

  useEffect(() => {
    if (!enabled || !client || !isConnected) return;

    // Create subscription
    const sub = client.newSubscription(channel);

    // Set up subscription handlers
    sub.on("publication", (ctx) => {
      const pubData = ctx.data as T;
      setData(pubData);
      onPublication?.(pubData);
    });

    sub.on("subscribed", () => {
      setIsSubscribed(true);
      onSubscribed?.();
    });

    sub.on("unsubscribed", () => {
      setIsSubscribed(false);
      onUnsubscribed?.();
    });

    sub.on("error", (ctx) => {
      const error = new Error(ctx.error?.message || "Subscription error");
      onError?.(error);
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
  }, [
    enabled,
    client,
    isConnected,
    channel,
    onPublication,
    onSubscribed,
    onUnsubscribed,
    onError,
  ]);

  return {
    subscription: subscriptionRef.current,
    isSubscribed,
    data,
    unsubscribe: () => subscriptionRef.current?.unsubscribe(),
  };
}
