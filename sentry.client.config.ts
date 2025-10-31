import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // Adjust this value in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Set profilesSampleRate relative to tracesSampleRate
  profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps

  environment: process.env.NODE_ENV,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Capture Replay for Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Filter out low-priority errors
  beforeSend(event, hint) {
    const error = hint.originalException;

    // Ignore network errors in development
    if (process.env.NODE_ENV === "development") {
      return null;
    }

    // Filter specific errors
    if (error && typeof error === "object" && "message" in error) {
      const message = String(error.message);

      // Ignore common non-critical errors
      if (
        message.includes("ResizeObserver loop") ||
        message.includes("Non-Error promise rejection")
      ) {
        return null;
      }
    }

    return event;
  },
});
