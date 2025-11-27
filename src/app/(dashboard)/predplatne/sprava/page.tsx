"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Loader2,
  CreditCard,
  CheckCircle2,
  Calendar,
  Sparkles,
  Clock,
  TrendingUp,
  Receipt,
  Settings,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
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
      onSuccess: () => {
        setCancelDialogOpen(false);
        toast.success(t("cancelSuccess"), {
          description: subscription?.subscriptionExpiresAt
            ? `Předplatné zůstane aktivní do ${new Date(
                subscription.subscriptionExpiresAt
              ).toLocaleDateString("cs-CZ", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}`
            : "Automatická obnova byla zrušena",
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
  const isCanceled = !subscription.autoRenew;

  return (
    <div className="space-y-8">
      {/* Canceled Subscription Banner */}
      {isCanceled && subscription.subscriptionExpiresAt && (
        <div
          className="rounded-xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-background p-6 shadow-lg animate-fade-in"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold text-lg">
                  Předplatné bylo zrušeno
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Tvé Premium funkce zůstanou aktivní do{" "}
                <strong>
                  {new Date(subscription.subscriptionExpiresAt).toLocaleDateString(
                    "cs-CZ",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </strong>
                . Po tomto datu budeš mít pouze free přístup.
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => router.push("/predplatne")}
              className="gap-2 shadow-md group"
            >
              <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
              Reaktivovat předplatné
            </Button>
          </div>
        </div>
      )}

      {/* Header with Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Typography variant="h1" className="text-2xl md:text-3xl">
              {t("title")}
            </Typography>
            <Badge
              variant={isCanceled ? "destructive" : isTrial ? "secondary" : "default"}
              className="text-xs px-2 py-1"
            >
              {isCanceled ? (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Zrušeno
                </>
              ) : isTrial ? (
                <>
                  <Sparkles className="h-3 w-3 mr-1" />
                  {t("trial")}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {t("active")}
                </>
              )}
            </Badge>
          </div>
          <Typography variant="muted">
            {subscription.currentPlan?.name || "Premium"}
          </Typography>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Plan Overview */}
          <div className="rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 to-background overflow-hidden">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Aktuální předplatné
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Days Remaining */}
                {subscription.daysRemaining !== null && (
                  <div className="p-4 rounded-lg bg-background/60 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Zbývá
                      </span>
                    </div>
                    <p className="text-3xl font-bold">
                      {subscription.daysRemaining}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isTrial ? "dní zkušební doby" : "dní předplatného"}
                    </p>
                  </div>
                )}

                {/* Next Billing */}
                {subscription.currentPlan?.nextBillingAmount && (
                  <div className="p-4 rounded-lg bg-background/60 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Další platba
                      </span>
                    </div>
                    <p className="text-3xl font-bold">
                      {subscription.currentPlan.nextBillingAmount} Kč
                    </p>
                    {subscription.currentPlan.nextBillingDate && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(
                          subscription.currentPlan.nextBillingDate
                        ).toLocaleDateString("cs-CZ", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {isTrial && !isCanceled && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">
                        Zkušební období zdarma
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Po uplynutí zkušební doby bude automaticky strháno{" "}
                        {subscription.currentPlan?.nextBillingAmount} Kč za
                        měsíční předplatné.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {isCanceled && (
                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-orange-600 dark:text-orange-400">
                        Automatická obnova zrušena
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Předplatné skončí{" "}
                        {subscription.subscriptionExpiresAt &&
                          new Date(
                            subscription.subscriptionExpiresAt
                          ).toLocaleDateString("cs-CZ", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        . Můžeš ho kdyk reaktivovat.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment History */}
          {subscription.paymentHistory &&
            subscription.paymentHistory.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-muted-foreground" />
                    {t("paymentHistory")}
                  </h2>

                  <div className="space-y-2">
                    {subscription.paymentHistory.map((payment, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg bg-background/60 border border-border/30 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-primary/10">
                            <CreditCard className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {payment.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(payment.date).toLocaleDateString(
                                "cs-CZ",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 sm:justify-end">
                          <p className="font-semibold text-sm">
                            {payment.amount} Kč
                          </p>
                          <Badge
                            variant={
                              payment.status === "paid"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {payment.status === "paid"
                              ? "Zaplaceno"
                              : payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Right Column - Settings & Actions (1/3 width) */}
        <div className="space-y-6">
          {/* Settings Card */}
          <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5 text-muted-foreground" />
                Nastavení
              </h2>

              {/* Auto-renewal info */}
              <div className={`p-4 rounded-lg border ${
                subscription.autoRenew 
                  ? "bg-background/60 border-border/50" 
                  : "bg-orange-500/10 border-orange-500/20"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Automatická obnova
                  </span>
                  <Badge
                    variant={subscription.autoRenew ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {subscription.autoRenew ? "Zapnuto" : "Vypnuto"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {subscription.autoRenew
                    ? "Předplatné se automaticky obnoví na konci období"
                    : "Předplatné skončí na konci období"}
                </p>
              </div>

              {/* Payment method placeholder */}
              <div className="p-4 rounded-lg bg-background/60 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Platební metoda</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Platební karta (GoPay)
                </p>
              </div>
            </div>

            {/* Cancel or Re-activate Subscription */}
            <div className="p-6 pt-0">
              {subscription.autoRenew ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCancelDialogOpen(true)}
                  className="w-full text-muted-foreground hover:text-destructive hover:border-destructive/50"
                >
                  Zrušit předplatné
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => router.push("/predplatne")}
                  className="w-full gap-2 group"
                >
                  <RefreshCw className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-500" />
                  Reaktivovat
                </Button>
              )}
            </div>
          </div>

          {/* Help Card */}
          <div className="rounded-xl border border-border/50 bg-gradient-to-br from-muted/30 to-background p-6">
            <h3 className="font-semibold mb-2 text-sm">Potřebuješ pomoc?</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Máš otázku k předplatnému nebo potřebuješ změnit nastavení?
            </p>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href="mailto:podpora@primat.cz">Kontaktovat podporu</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">{t("cancelConfirm")}</DialogTitle>
            <DialogDescription className="text-base pt-2">
              Opravdu chceš zrušit předplatné? Tvé Premium funkce zůstanou
              aktivní do konce aktuálního období.
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
