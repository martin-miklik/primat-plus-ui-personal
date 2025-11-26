"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBillingPlans } from "@/lib/api/queries/billing";
import { PricingTable } from "@/components/paywall/pricing-table";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Typography } from "@/components/ui/Typography";
import ElectricBorder from "@/components/ElectricBorder";

export default function SubscriptionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: plans, isLoading: plansLoading } = useBillingPlans();

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

  if (plansLoading || isPremium) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container space-y-12">
      {/* Header */}

      <Typography variant="h1" className="text-4xl md:text-5xl">
        Předplatné
      </Typography>

      {/* Available Plans */}
      {plans && plans.length > 0 && (
        <div className="space-y-8">
          <PricingTable plans={plans} />

          {/* Call to Action */}
          <ElectricBorder
            color="#FFCC03"
            speed={1}
            chaos={0.5}
            thickness={3}
            style={{ borderRadius: 16 }}
            className="max-w-md mx-auto"
          >
            <div className="max-w-md mx-auto">
              <button
                onClick={() => handleSelectPlan(plans[0].id)}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 transition-all duration-300 p-8 hover:cursor-pointer  w-full"
              >
                <div className="relative z-10 text-center space-y-4">
                  <div className="text-2xl font-bold">
                    Vyzkoušet {plans[0].trialDays} dní zdarma
                  </div>
                  <div className="text-muted-foreground">
                    Poté {plans[0].priceFormatted} měsíčně
                  </div>
                  <div className="pt-2">
                    <div className="inline-flex items-center gap-2 text-primary text-lg font-semibold group-hover:gap-3 transition-all">
                      <span>Začít nyní</span>
                      <svg
                        className="w-6 h-6"
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
                  </div>
                </div>
                {/* Animated gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </ElectricBorder>
        </div>
      )}
    </div>
  );
}
