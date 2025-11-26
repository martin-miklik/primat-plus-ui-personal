"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSubscriptionGuard } from "@/hooks/use-subscription-guard";
import { useBillingPlans } from "@/lib/api/queries/billing";
import { useCheckout } from "@/lib/api/mutations/billing";
import { PlanSummary } from "@/components/subscription/plan-summary";
import { GoPayTerms } from "@/components/subscription/gopay-terms";
import { ConsentCheckboxes } from "@/components/subscription/consent-checkboxes";
import { Typography } from "@/components/ui/Typography";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("subscription.checkout");
  const tCommon = useTranslations("common");

  const planId = searchParams.get("planId");
  const { isLoading: isGuardLoading } = useSubscriptionGuard("free");

  const { data: plans, isLoading: plansLoading } = useBillingPlans();
  const checkoutMutation = useCheckout();

  const [recurringConsent, setRecurringConsent] = useState(false);
  const [storageConsent, setStorageConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find selected plan
  const selectedPlan = plans?.find((p) => p.id === Number(planId));

  useEffect(() => {
    // Redirect if no plan selected
    if (!plansLoading && !selectedPlan && !isGuardLoading) {
      router.push("/predplatne");
    }
  }, [plansLoading, selectedPlan, router, isGuardLoading]);

  const handleProceedToPayment = () => {
    if (!selectedPlan) return;

    // Validate consents
    if (!recurringConsent || !storageConsent) {
      setError(t("errors.consentRequired"));
      return;
    }

    setError(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
    checkoutMutation.mutate(
      {
        planId: selectedPlan.id,
        returnUrl: `${window.location.origin}/predplatne/uspech`,
        notifyUrl: `${apiUrl}/billing/gopay-webhook`,
      },
      {
        onError: (error: unknown) => {
          // Handle specific error codes from backend
          const errorCode = (
            error as { response?: { data?: { error?: { code?: string } } } }
          )?.response?.data?.error?.code;

          if (errorCode === "TRIAL_ALREADY_USED") {
            setError(t("errors.trialUsed"));
          } else if (errorCode === "ALREADY_SUBSCRIBED") {
            setError(t("errors.alreadySubscribed"));
          } else {
            setError(
              "Nastala chyba při vytváření platby. Zkuste to prosím znovu."
            );
          }
        },
      }
    );
  };

  // Loading state
  if (isGuardLoading || plansLoading || !selectedPlan) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/predplatne")}
          className="hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("backToPlans")}
        </Button>

        <div>
          <Typography variant="h1" className="text-3xl md:text-4xl">
            {t("title")}
          </Typography>
          <Typography variant="muted" className="mt-2 text-base md:text-lg">
            {t("subtitle")}
          </Typography>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="border-destructive/50">
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Plan Summary */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t("selectedPlan")}
            </h2>
            <PlanSummary plan={selectedPlan} />
          </div>

          {/* GoPay Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t("paymentDetails")}
            </h2>
            <GoPayTerms plan={selectedPlan} />
          </div>
        </div>

        {/* Right Column - Consent & Action */}
        <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          {/* Consent Section */}
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t("consent")}
            </h2>
            <ConsentCheckboxes
              recurringConsent={recurringConsent}
              storageConsent={storageConsent}
              onRecurringChange={setRecurringConsent}
              onStorageChange={setStorageConsent}
            />
          </div>

          {/* Action Buttons - Sticky */}
          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 to-background p-6 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🔒</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Zabezpečená platba přes GoPay
                </p>
              </div>

              <Button
                size="lg"
                onClick={handleProceedToPayment}
                disabled={
                  !recurringConsent ||
                  !storageConsent ||
                  checkoutMutation.isPending
                }
                className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all"
              >
                {checkoutMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t("processing")}
                  </>
                ) : (
                  t("continueToPayment")
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={() => router.push("/predplatne")}
                disabled={checkoutMutation.isPending}
                className="w-full"
              >
                {tCommon("cancel")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
