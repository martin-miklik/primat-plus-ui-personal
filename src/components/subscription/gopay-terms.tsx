import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import type { BillingPlan } from "@/lib/validations/billing";

interface GoPayTermsProps {
  plan: BillingPlan;
}

export function GoPayTerms({ plan }: GoPayTermsProps) {
  const t = useTranslations("subscription.checkout");

  const billingPeriodText =
    plan.billingPeriod === "monthly" ? t("monthly") : t("yearly");
  const billingFrequencyText =
    plan.billingPeriod === "monthly" ? t("everyMonth") : t("everyYear");

  return (
    <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6 shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Info className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">{t("recurringPayment")}</h3>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="payment-details" className="border-border/50">
          <AccordionTrigger className="text-sm font-medium hover:text-primary">
            {t("paymentDetails")}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <InfoRow label={t("reason")} value={t("reasonText")} />
              <InfoRow label={t("amount")} value={plan.priceFormatted} />
              <InfoRow label={t("amountType")} value={t("fixedAmount")} />
              <InfoRow label={t("billingPeriod")} value={billingPeriodText} />
              <InfoRow
                label={t("billingFrequency")}
                value={billingFrequencyText}
              />
              <InfoRow label={t("frequencyType")} value={t("fixedFrequency")} />
              <InfoRow label={t("nextBillingDate")} value={t("afterTrial")} />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="communication" className="border-border/50">
          <AccordionTrigger className="text-sm font-medium hover:text-primary">
            {t("communication")}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t("contactMethod")}
                </span>
                <p className="text-sm mt-1.5">
                  <a
                    href={`mailto:${t("supportEmail")}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {t("supportEmail")}
                  </a>
                </p>
              </div>

              <InfoRow label={t("howToCancel")} value={t("cancelInfo")} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <p className="text-sm mt-1.5 leading-relaxed">{value}</p>
    </div>
  );
}
