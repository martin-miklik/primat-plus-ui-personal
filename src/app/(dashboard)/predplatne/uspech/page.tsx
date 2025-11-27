"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import { useBillingLimits } from "@/lib/api/queries/billing";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const t = useTranslations("subscription.success");
  const tFailed = useTranslations("subscription.failed");

  const status = searchParams.get("status");
  const isMock = searchParams.get("mock");
  const [isRefreshing, setIsRefreshing] = useState(true);
  const hasRefreshed = useRef(false);

  const isSuccess = status === "success";
  
  // Get billing limits to check if user has used trial
  const { data: limits } = useBillingLimits();
  const hasUsedTrial = limits?.hasUsedTrial ?? false;

  // Get forceRevalidate from store - stable reference, bypasses hasValidatedThisSession
  const forceRevalidate = useAuthStore((state) => state.forceRevalidate);

  useEffect(() => {
    // Only refresh data ONCE when component mounts
    if (hasRefreshed.current) return;
    hasRefreshed.current = true;

    const refreshData = async () => {
      try {
        // Force re-validate to get updated user data (new subscription status)
        // This bypasses hasValidatedThisSession check without triggering AuthGuard
        await forceRevalidate();

        // Invalidate billing queries to refresh subscription details
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.BILLING_LIMITS,
        });
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.BILLING_SUBSCRIPTION,
        });
      } catch (error) {
        console.error("Error refreshing data after payment:", error);
        // Continue anyway - don't block the user
      } finally {
        setIsRefreshing(false);
      }
    };

    refreshData();

    // Auto-redirect to dashboard after 3 seconds on success
    let timer: NodeJS.Timeout | undefined;
    if (isSuccess) {
      timer = setTimeout(() => {
        router.push("/");
      }, 3000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - run once on mount

  return (
    <div className="flex items-center justify-center p-4">
      <div className="container max-w-2xl">
        <div className="rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 md:p-12 text-center shadow-2xl">
          {isSuccess ? (
            <>
              {/* Success Icon */}
              <div className="relative mb-6 inline-block">
                <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
                <div className="relative p-4 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                  <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {t("title")}
              </h1>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                {t("description")}
              </p>

              {isMock && (
                <div className="inline-block px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-sm mb-6">
                  {t("mockNotice")}
                </div>
              )}

              {isRefreshing ? (
                <div className="flex items-center justify-center gap-3 text-muted-foreground mb-8">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t("redirecting")}</span>
                </div>
              ) : (
                // Only show trial info if user hasn't used their trial yet
                !hasUsedTrial && (
                  <div className="rounded-2xl bg-primary/5 border border-primary/20 p-6 mb-8 max-w-md mx-auto">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-semibold">{t("trialInfo")}</span>
                    </div>
                    <p className="text-2xl font-bold text-primary mb-2">
                      {t("trialDays")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("renewalInfo")}
                    </p>
                  </div>
                )
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  size="lg"
                  className="min-w-[180px]"
                >
                  {t("goToDashboard")}
                </Button>
                <Button
                  size="lg"
                  onClick={() => router.push("/predplatne/sprava")}
                  className="min-w-[180px] shadow-lg"
                >
                  {t("goToManagement")}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Error Icon */}
              <div className="relative mb-6 inline-block">
                <div className="absolute inset-0 bg-destructive/20 blur-2xl rounded-full" />
                <div className="relative p-4 rounded-full bg-gradient-to-br from-destructive/20 to-red-500/20">
                  <XCircle className="h-16 w-16 text-destructive" />
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                {tFailed("title")}
              </h1>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                {tFailed("description")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  size="lg"
                  className="min-w-[180px]"
                >
                  {tFailed("goBack")}
                </Button>
                <Button
                  onClick={() => router.push("/predplatne")}
                  size="lg"
                  className="min-w-[180px]"
                >
                  {tFailed("tryAgain")}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
