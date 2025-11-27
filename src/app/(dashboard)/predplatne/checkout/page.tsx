"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Loader2,
  Check,
  Sparkles,
  Shield,
  CreditCard,
  Lock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSubscriptionGuard } from "@/hooks/use-subscription-guard";
import { useBillingPlans } from "@/lib/api/queries/billing";
import { useCheckout } from "@/lib/api/mutations/billing";
import { GoPayTerms } from "@/components/subscription/gopay-terms";
import { ConsentCheckboxes } from "@/components/subscription/consent-checkboxes";
import StarBorder from "@/components/StarBorder";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("subscription.checkout");

  const planId = searchParams.get("planId");
  const { isLoading: isGuardLoading } = useSubscriptionGuard("free");

  const { data: plans, isLoading: plansLoading } = useBillingPlans();
  const checkoutMutation = useCheckout();

  const [paymentTermsConsent, setPaymentTermsConsent] = useState(false);
  const [paymentDetailsConsent, setPaymentDetailsConsent] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);
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

    // Validate all 3 consents
    if (!paymentTermsConsent || !paymentDetailsConsent || !gdprConsent) {
      setError(t("errors.consentRequired"));
      return;
    }

    setError(null);

    // Backend expects these parameters
    checkoutMutation.mutate(
      {
        returnUrl: `${window.location.origin}/predplatne/uspech?status=success`,
        paymentDetails: paymentDetailsConsent,
        paymentTerms: paymentTermsConsent,
        gdpr: gdprConsent,
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

  const allConsentsGiven =
    paymentTermsConsent && paymentDetailsConsent && gdprConsent;

  // Loading state
  if (isGuardLoading || plansLoading || !selectedPlan) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Background gradient effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="container max-w-7xl py-8 md:py-12 px-4 md:px-8">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/predplatne")}
          className="mb-6 hover:bg-primary/10 animate-fade-in"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zpět na předplatné
        </Button>

        {/* Progress Steps */}
        <div
          className="flex items-center justify-center gap-2 mb-8 md:mb-12 animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium hidden sm:inline">
              Výběr plánu
            </span>
          </div>
          <div className="h-0.5 w-12 md:w-24 bg-primary" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center ring-4 ring-primary/20">
              <CreditCard className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium hidden sm:inline">
              Dokončení objednávky
            </span>
          </div>
          <div className="h-0.5 w-12 md:w-24 bg-border" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
              Hotovo
            </span>
          </div>
        </div>

        {/* Header */}
        <div
          className="text-center mb-12 space-y-3 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Dokončení objednávky
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Už jste jen krůček od odemknutí všech prémiových funkcí
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            variant="destructive"
            className="mb-8 max-w-3xl mx-auto animate-fade-in border-destructive/50"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left/Top Column - Plan Summary (Compact) */}
          <div
            className="lg:col-span-1 space-y-6 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            {/* Plan Summary Card */}
            <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-xl">
              <div className="absolute top-0 right-0 h-24 w-24 bg-primary/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-primary/20">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedPlan.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedPlan.trialDays} dní zdarma
                    </p>
                  </div>
                </div>

                <div className="mb-4 pb-4 border-b border-border/50">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                      {selectedPlan.priceFormatted}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /{" "}
                      {selectedPlan.billingPeriod === "monthly"
                        ? "měsíc"
                        : "rok"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {selectedPlan.features.slice(0, 4).map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {selectedPlan.features.length > 4 && (
                    <p className="text-xs text-muted-foreground pl-6">
                      +{selectedPlan.features.length - 4} dalších funkcí
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border/50">
              <Shield className="h-5 w-5 text-green-500" />
              <div className="text-sm">
                <div className="font-medium">Zabezpečená platba</div>
                <div className="text-xs text-muted-foreground">
                  GoPay • PCI-DSS Level 1
                </div>
              </div>
            </div>
          </div>

          {/* Right/Bottom Column - Payment Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* GoPay Terms */}
            <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Informace o předplatném
              </h2>
              <GoPayTerms plan={selectedPlan} />
            </div>

            {/* Consent Checkboxes */}
            <div className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Souhlasy
              </h2>
              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-lg">
                <ConsentCheckboxes
                  paymentTermsConsent={paymentTermsConsent}
                  paymentDetailsConsent={paymentDetailsConsent}
                  gdprConsent={gdprConsent}
                  onPaymentTermsChange={setPaymentTermsConsent}
                  onPaymentDetailsChange={setPaymentDetailsConsent}
                  onGdprChange={setGdprConsent}
                />
              </div>
            </div>

            {/* CTA Section */}
            <div className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-background to-card/50 p-6 md:p-8 shadow-xl">
                <div className="space-y-6">
                  {/* Progress indicator */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Souhlasy poskytnuty:
                    </span>
                    <span
                      className={`font-semibold ${
                        allConsentsGiven ? "text-green-500" : "text-primary"
                      }`}
                    >
                      {
                        [
                          paymentTermsConsent,
                          paymentDetailsConsent,
                          gdprConsent,
                        ].filter(Boolean).length
                      }{" "}
                      / 3
                    </span>
                  </div>

                  {/* Main CTA */}
                  {allConsentsGiven ? (
                    <StarBorder
                      as="button"
                      color="#FFCC00"
                      speed="3s"
                      onClick={handleProceedToPayment}
                      disabled={checkoutMutation.isPending}
                      className="w-full group hover:scale-[1.02] transition-transform duration-300"
                    >
                      <div className="flex items-center justify-center gap-3 px-6 py-4 text-lg font-semibold">
                        {checkoutMutation.isPending ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Zpracovávám...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                            <span>Pokračovat na platbu</span>
                            <svg
                              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                              />
                            </svg>
                          </>
                        )}
                      </div>
                    </StarBorder>
                  ) : (
                    <Button
                      size="lg"
                      disabled
                      className="w-full h-14 text-lg font-semibold"
                    >
                      Zaškrtněte všechny souhlasy pro pokračování
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    onClick={() => router.push("/predplatne")}
                    disabled={checkoutMutation.isPending}
                    className="w-full"
                  >
                    Zrušit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
