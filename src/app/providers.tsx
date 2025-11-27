"use client";

import { ReactNode, useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { makeQueryClient } from "@/lib/query-client";
import { initializeStorage } from "@/lib/utils/storage-validator";

// MSW initialization
async function enableMocking() {
  if (typeof window === "undefined") {
    return;
  }

  // Only enable MSW in development AND if the flag is enabled
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  // Check if MSW should be enabled via env var
  const mswEnabled = process.env.NEXT_PUBLIC_ENABLE_MSW === "true";

  if (!mswEnabled) {
    // Unregister service worker if MSW is disabled
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      console.log("✅ MSW Service Worker unregistered");
    }
    return;
  }

  const { worker } = await import("@/mocks/browser");

  return worker.start({
    onUnhandledRequest: "bypass", // Don't warn about unhandled requests
  });
}

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => makeQueryClient());
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    // Validate and clean localStorage on app initialization
    initializeStorage();
    
    enableMocking().then(() => {
      setMswReady(true);
    });
  }, []);

  // Auto-login test user in development if not logged in
  // Disabled to allow testing of login flow
  // useEffect(() => {
  //   if (process.env.NODE_ENV === "development" && mswReady && !user) {
  //     setAuth(
  //       {
  //         id: "test-user-1",
  //         email: "test@primatplus.com",
  //         name: "Test User",
  //         subscription: "premium",
  //       },
  //       "test-token-123"
  //     );
  //   }
  // }, [mswReady, user, setAuth]);

  // In development, wait for MSW to be ready (only if MSW is enabled)
  const mswEnabled = process.env.NEXT_PUBLIC_ENABLE_MSW === "true";
  if (process.env.NODE_ENV === "development" && mswEnabled && !mswReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" expand={false} richColors closeButton />
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
