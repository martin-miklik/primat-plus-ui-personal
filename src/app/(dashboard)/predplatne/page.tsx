"use client";

import { useBillingPlans, useSubscription } from "@/lib/api/queries/billing";
import {
  useCheckout,
  useCancelSubscription,
} from "@/lib/api/mutations/billing";
import { PricingTable } from "@/components/paywall/pricing-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { data: plans, isLoading: plansLoading } = useBillingPlans();
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const checkoutMutation = useCheckout();
  const cancelMutation = useCancelSubscription();

  const handleUpgrade = (planId: number) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
    checkoutMutation.mutate({
      planId,
      returnUrl: `${window.location.origin}/predplatne/uspech`,
      notifyUrl: `${apiUrl}/billing/gopay-webhook`,
    });
  };

  if (plansLoading || subLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isPremium =
    user?.subscriptionType === "premium" || user?.subscriptionType === "trial";

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Předplatné</h1>
        <p className="text-muted-foreground">
          Spravujte své předplatné Primát Plus
        </p>
      </div>

      {/* Current Subscription */}
      {isPremium && subscription?.currentPlan && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Aktuální předplatné</h2>
          <div className="space-y-2">
            <p>
              <strong>Plán:</strong> {subscription.currentPlan.name}
            </p>
            <p>
              <strong>Stav:</strong>{" "}
              {subscription.subscriptionType === "trial"
                ? "Zkušební období"
                : "Aktivní"}
            </p>
            {subscription.daysRemaining && (
              <p>
                <strong>Zbývá dnů:</strong> {subscription.daysRemaining}
              </p>
            )}
            {subscription.currentPlan.nextBillingDate && (
              <p>
                <strong>Další platba:</strong>{" "}
                {new Date(
                  subscription.currentPlan.nextBillingDate
                ).toLocaleDateString("cs-CZ")}
              </p>
            )}
          </div>

          {subscription.autoRenew && (
            <Button
              variant="destructive"
              className="mt-4"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              Zrušit předplatné
            </Button>
          )}
        </Card>
      )}

      {/* Available Plans */}
      {!isPremium && plans && (
        <>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Dostupné plány</h2>
            <PricingTable plans={plans} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <Button
                key={plan.id}
                size="lg"
                onClick={() => handleUpgrade(plan.id)}
                disabled={checkoutMutation.isPending}
              >
                {checkoutMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Vybrat {plan.name}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

