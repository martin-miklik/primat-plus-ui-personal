"use client";

import { ReactNode, useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { makeQueryClient } from "@/lib/query-client";

// MSW initialization
async function enableMocking() {
  if (typeof window === "undefined") {
    return;
  }

  // Only enable MSW in development
  if (process.env.NODE_ENV !== "development") {
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

  // In development, wait for MSW to be ready
  if (process.env.NODE_ENV === "development" && !mswReady) {
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
        <Toaster position="top-right" expand={false} richColors closeButton/>
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
