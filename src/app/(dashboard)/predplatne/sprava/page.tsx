"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, CreditCard, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useSubscriptionGuard } from "@/hooks/use-subscription-guard";
import { useSubscription } from "@/lib/api/queries/billing";
import { useCancelSubscription } from "@/lib/api/mutations/billing";
import { Typography } from "@/components/ui/Typography";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function ManagementPage() {
  const router = useRouter();
  const t = useTranslations("subscription.manage");
  const tCommon = useTranslations("common");

  const { isLoading: isGuardLoading } = useSubscriptionGuard("premium");
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const cancelMutation = useCancelSubscription();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const handleCancelSubscription = () => {
    cancelMutation.mutate(undefined, {
      onSuccess: (data) => {
        setCancelDialogOpen(false);
        toast.success(t("cancelSuccess"), {
          description: t("cancelSuccessDesc", {
            date: new Date(data.expiresAt).toLocaleDateString("cs-CZ"),
          }),
        });
      },
      onError: () => {
        toast.error(tCommon("error"), {
          description: "Nepodařilo se zrušit předplatné",
        });
      },
    });
  };

  // Loading state
  if (isGuardLoading || subLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No subscription data (free user got through somehow)
  if (!subscription) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 text-center shadow-lg">
          <Typography variant="h2" className="mb-4">
            {t("upgradePrompt")}
          </Typography>
          <Button onClick={() => router.push("/predplatne")}>
            {t("upgradeCta")}
          </Button>
        </div>
      </div>
    );
  }

  const isTrial = subscription.subscriptionType === "trial";

  return (
      <div className="container max-w-6xl py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Typography variant="h1" className="text-3xl md:text-4xl">
            {t("title")}
          </Typography>
          <Typography variant="muted" className="text-base md:text-lg">
            {t("subtitle")}
          </Typography>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Plan Card */}
          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                {t("plan")}
              </span>
            </div>
            <p className="text-2xl font-bold">
              {subscription.currentPlan?.name || "Premium"}
            </p>
            <Badge variant={isTrial ? "secondary" : "default"} className="mt-3">
              {isTrial ? t("trial") : t("active")}
            </Badge>
          </div>

          {/* Days Remaining Card */}
          {subscription.daysRemaining !== null && (
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <svg
                    className="h-5 w-5 text-orange-600 dark:text-orange-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  {t("daysRemaining")}
                </span>
              </div>
              <p className="text-2xl font-bold">{subscription.daysRemaining}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {isTrial ? "zkušebního období" : "předplatného"}
              </p>
            </div>
          )}

          {/* Next Billing Card */}
          {subscription.currentPlan?.nextBillingAmount && (
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  {t("nextBilling")}
                </span>
              </div>
              <p className="text-2xl font-bold">
                {subscription.currentPlan.nextBillingAmount} Kč
              </p>
              {subscription.currentPlan.nextBillingDate && (
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(
                    subscription.currentPlan.nextBillingDate
                  ).toLocaleDateString("cs-CZ")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Payment History */}
        {subscription.paymentHistory &&
          subscription.paymentHistory.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-6">
                {t("paymentHistory")}
              </h2>

              <div className="space-y-3">
                {subscription.paymentHistory.map((payment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl bg-background/50 hover:bg-background/80 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.date).toLocaleDateString("cs-CZ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold">{payment.amount} Kč</p>
                      <Badge
                        variant={
                          payment.status === "paid" ? "default" : "secondary"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Danger Zone */}
        {subscription.autoRenew && (
          <div className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2 text-destructive">
                  {t("dangerZone")}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("cancelWarning")}
                </p>
                <Button
                  variant="destructive"
                  onClick={() => setCancelDialogOpen(true)}
                  className="shadow-md"
                >
                  {t("cancelSubscription")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {t("cancelConfirm")}
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                {t("cancelWarning")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(false)}
              >
                {t("keepSubscription")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("cancelling")}
                  </>
                ) : (
                  t("cancelButton")
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}
