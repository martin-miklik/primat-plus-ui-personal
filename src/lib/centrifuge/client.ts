import { Centrifuge } from "centrifuge";
import { CENTRIFUGE_URL, CENTRIFUGE_RECONNECT_DELAYS } from "@/lib/constants";

export interface CentrifugeConfig {
  url?: string;
  token?: string;
  debug?: boolean;
}

export function createCentrifugeClient(config: CentrifugeConfig = {}) {
  const { url = CENTRIFUGE_URL, token, debug = false } = config;

  const centrifuge = new Centrifuge(url, {
    // Provide token if available
    ...(token && { token }),

    // Debug mode
    debug,

    // Connection configuration
    timeout: 5000,

    // Exponential backoff for reconnection
    minReconnectDelay: CENTRIFUGE_RECONNECT_DELAYS[0],
    maxReconnectDelay:
      CENTRIFUGE_RECONNECT_DELAYS[CENTRIFUGE_RECONNECT_DELAYS.length - 1],
  });

  // Connection event handlers
  centrifuge.on("connecting", (ctx) => {
    if (debug) console.log("[Centrifuge] Connecting...", ctx);
  });

  centrifuge.on("connected", (ctx) => {
    if (debug) console.log("[Centrifuge] Connected", ctx);
  });

  centrifuge.on("disconnected", (ctx) => {
    if (debug) console.log("[Centrifuge] Disconnected", ctx);
  });

  centrifuge.on("error", (ctx) => {
    console.error("[Centrifuge] Error", ctx);
  });

  return centrifuge;
}
