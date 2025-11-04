import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const nextConfig: NextConfig = {
  /* config options here */

  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here
  },

  // Proxy API requests to backend (only when MSW is disabled)
  async rewrites() {
    // Only proxy if MSW is disabled
    const mswEnabled = process.env.NEXT_PUBLIC_ENABLE_MSW === "true";
    
    if (mswEnabled) {
      // When MSW is enabled, don't proxy (let MSW handle it)
      return [];
    }

    // When MSW is disabled, proxy to real backend
    const backendUrl = process.env.BACKEND_URL || "http://api.primat-plus.localhost";
    
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },

  // Sentry webpack plugin options
  webpack: (config) => {
    return config;
  },
};

// Sentry configuration
const sentryConfig = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload source maps in production only
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
};

// Wrap with both next-intl and Sentry config
const configWithIntl = withNextIntl(nextConfig);

export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(configWithIntl, sentryConfig)
  : configWithIntl;
