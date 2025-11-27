"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBillingPlans, useBillingLimits } from "@/lib/api/queries/billing";
import {
  Loader2,
  Sparkles,
  Check,
  Zap,
  Clock,
  Shield,
  TrendingUp,
  BookOpen,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import StarBorder from "@/components/StarBorder";

export default function SubscriptionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: plans, isLoading: plansLoading } = useBillingPlans();
  const { data: limits, isLoading: limitsLoading } = useBillingLimits();

  const isPremium =
    user?.subscriptionType === "premium" || user?.subscriptionType === "trial";

  // Redirect premium users to management page
  useEffect(() => {
    if (isPremium && !plansLoading) {
      router.push("/predplatne/sprava");
    }
  }, [isPremium, plansLoading, router]);

  const handleSelectPlan = (planId: number) => {
    router.push(`/predplatne/checkout?planId=${planId}`);
  };

  if (plansLoading || limitsLoading || isPremium) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const plan = plans?.[0];
  const hasUsedTrial = limits?.hasUsedTrial ?? false;

  if (!plan) return null;

  return (
    <div className="relative  flex flex-col items-center justify-center">
      {/* Background gradient effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-yellow-500/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="container max-w-6xl py-12 md:py-20 space-y-16 px-4 md:px-8 flex flex-col items-center justify-center">
        {/* Hero Section */}
        <div className="text-center space-y-6 animate-fade-in-up">
          {hasUsedTrial ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border text-sm font-medium text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Zkušební období již využito</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Speciální nabídka: {plan.trialDays} dní zdarma</span>
            </div>
          )}

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
            Odemkni plný potenciál
            <br />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-brand-yellow bg-clip-text text-transparent">
              Primát Plus Premium
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Získej neomezený přístup ke všem funkcím a urychli své studium s
            pokročilými AI nástroji
          </p>

          {/* Pricing */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {plan.priceFormatted}
            </div>
            <div className="text-left">
              <div className="text-sm text-muted-foreground">
                / {plan.billingPeriod === "monthly" ? "měsíc" : "rok"}
              </div>
              {hasUsedTrial && (
                <div className="text-xs text-muted-foreground">
                  platba ihned
                </div>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <div
            className="pt-6 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <StarBorder
              as="button"
              color="#FFCC00"
              speed="3s"
              onClick={() => handleSelectPlan(plan.id)}
              className="mx-auto group hover:scale-105 transition-transform duration-300"
            >
              <div className="flex items-center gap-3 px-8 py-4 text-lg font-semibold">
                <Zap className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                <span>
                  {hasUsedTrial
                    ? "Začít Premium nyní"
                    : `Začít zdarma na ${plan.trialDays} dní`}
                </span>
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
              </div>
            </StarBorder>
          </div>

          <p
            className="text-sm text-muted-foreground animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            {hasUsedTrial ? (
              <>
                <Shield className="inline h-4 w-4 mr-1" />
                Zruš kdykoliv • První platba ihned
              </>
            ) : (
              <>
                <Clock className="inline h-4 w-4 mr-1" />
                Zruš kdykoliv během zkušební doby bez poplatku
              </>
            )}
          </p>
        </div>

        {/* Features Grid */}
        <div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          {plan.features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm leading-relaxed pt-1">{feature}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div
          className="grid md:grid-cols-3 gap-8 py-12 animate-fade-in"
          style={{ animationDelay: "0.8s" }}
        >
          <div className="text-center space-y-3">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Neomezené studium</h3>
            <p className="text-muted-foreground text-sm">
              Vytvoř si kolik předmětů a materiálů potřebuješ, bez jakýchkoliv
              limitů
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5">
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold">AI Asistent</h3>
            <p className="text-muted-foreground text-sm">
              Neomezené AI konverzace pro pomoc s učením a vysvětlování látky
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold">Pokročilé nástroje</h3>
            <p className="text-muted-foreground text-sm">
              Generování testů, flashcard, a pokročilé analytiky tvého pokroku
            </p>
          </div>
        </div>

        {/* Trust Badge */}
        <div
          className="flex flex-col items-center justify-center gap-4 py-8 animate-fade-in"
          style={{ animationDelay: "1s" }}
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-5 w-5 text-green-500" />
            <span>Zabezpečená platba přes GoPay • PCI-DSS Level 1</span>
          </div>
          <div className="text-sm text-muted-foreground">
            🔒 Platební údaje jsou uloženy bezpečně podle nejvyšších standardů
          </div>
        </div>

        {/* Final CTA */}
        <div
          className="text-center space-y-6 py-12 animate-fade-in"
          style={{ animationDelay: "1.2s" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold">Připravený začít?</h2>

          <StarBorder
            as="button"
            color="#FFCC00"
            speed="3s"
            onClick={() => handleSelectPlan(plan.id)}
            className="mx-auto group hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-center gap-3 px-10 py-5 text-xl font-semibold">
              <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform" />
              <span>Začít Premium zdarma</span>
            </div>
          </StarBorder>
        </div>
      </div>
    </div>
  );
}
