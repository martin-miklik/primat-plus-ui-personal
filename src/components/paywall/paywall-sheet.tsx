"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { usePaywallStore } from "@/stores/paywall-store";
import { useBillingPlans } from "@/lib/api/queries/billing";
import { PricingTable } from "./pricing-table";
import { LimitProgress } from "./limit-progress";
import { Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const REASON_MESSAGES = {
  subject_limit: {
    title: "Dosáhli jste limitu předmětů",
    description:
      "Ve Free verzi můžete mít pouze 1 předmět. Přejděte na Premium a získejte neomezený počet předmětů.",
  },
  source_limit: {
    title: "Dosáhli jste limitu materiálů",
    description:
      "Ve Free verzi můžete mít pouze 1 materiál na předmět. Přejděte na Premium a přidávejte neomezeně.",
  },
  chat_limit_soft: {
    title: "Blížíte se limitu konverzací",
    description:
      "Ve Free verzi můžete vést 3 konverzace na materiál. Upgrade na Premium pro neomezené AI chaty.",
  },
  chat_limit_hard: {
    title: "Dosáhli jste limitu konverzací",
    description:
      "Vyčerpali jste 3 konverzace pro tento materiál. Přejděte na Premium pro neomezené AI chaty.",
  },
  test_question_limit: {
    title: "Příliš mnoho otázek",
    description:
      "Ve Free verzi můžete generovat testy max. do 15 otázek. Premium nabízí testy až se 100 otázkami.",
  },
  flashcard_limit: {
    title: "Příliš mnoho kartiček",
    description:
      "Ve Free verzi můžete generovat max. 30 kartiček najednou. Premium nabízí až 100 kartiček.",
  },
};

export function PaywallSheet() {
  const router = useRouter();
  const { isOpen, reason, limits, close } = usePaywallStore();
  const { data: plans } = useBillingPlans();

  if (!reason) return null;

  const message = REASON_MESSAGES[reason];

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 md:p-8 border-b border-border/50">
          <DialogHeader>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm">
                <Crown className="h-7 w-7 text-yellow-500" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl md:text-3xl mb-2">
                  {message.title}
                </DialogTitle>
                <DialogDescription className="text-base md:text-lg">
                  {message.description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Current Limits */}
          {limits && (
            <div className="rounded-2xl bg-muted/30 p-6 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Vaše aktuální využití
              </h3>
              <div className="space-y-3">
                <LimitProgress
                  label="Předměty"
                  used={limits.limits.subjects.used}
                  max={limits.limits.subjects.max}
                />
                <LimitProgress
                  label="Materiály"
                  used={limits.limits.sources.used}
                  max={limits.limits.sources.max}
                />
                <LimitProgress
                  label="AI konverzace"
                  used={limits.limits.chatConversations.used}
                  max={limits.limits.chatConversations.max}
                />
              </div>
            </div>
          )}

          {/* Pricing Table */}
          {plans && (
            <div>
              <h3 className="text-xl font-semibold mb-6 text-center">
                Odemkněte plný potenciál s Premium
              </h3>
              <PricingTable plans={plans} />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 border-t border-border/50">
            <Button
              onClick={() => {
                close();
                router.push("/predplatne");
              }}
              size="lg"
              className="gap-2 min-w-[220px] shadow-lg"
            >
              <Sparkles className="h-5 w-5" />
              Vyzkoušet Premium 14 dní zdarma
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

