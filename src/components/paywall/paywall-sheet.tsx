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
  free_period_expired: {
    title: "Zkušební období vypršelo",
    description:
      "Vaše 14denní zkušební období Free verze vypršelo. Přejděte na Premium a pokračujte bez omezení.",
  },
};

export function PaywallSheet() {
  const router = useRouter();
  const { isOpen, reason, limits, close } = usePaywallStore();
  const { data: plans } = useBillingPlans();

  if (!reason) return null;

  const message = REASON_MESSAGES[reason];
  const isSoftPaywall = reason === "chat_limit_soft";

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            <DialogTitle className="text-2xl">{message.title}</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {message.description}
          </DialogDescription>
        </DialogHeader>

        {/* Current Limits */}
        {limits && (
          <div className="my-6 space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Vaše aktuální využití:
            </h3>
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
        )}

        {/* Pricing Table */}
        {plans && <PricingTable plans={plans} />}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {isSoftPaywall && (
            <Button variant="outline" onClick={close}>
              Pokračovat Free
            </Button>
          )}
          <Button
            onClick={() => {
              close();
              router.push("/predplatne");
            }}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Vyzkoušet Premium zdarma 14 dní
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

