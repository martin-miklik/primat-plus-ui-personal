"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { Shield, FileText, Lock } from "lucide-react";

interface ConsentCheckboxesProps {
  paymentTermsConsent: boolean;
  paymentDetailsConsent: boolean;
  gdprConsent: boolean;
  onPaymentTermsChange: (checked: boolean) => void;
  onPaymentDetailsChange: (checked: boolean) => void;
  onGdprChange: (checked: boolean) => void;
}

export function ConsentCheckboxes({
  paymentTermsConsent,
  paymentDetailsConsent,
  gdprConsent,
  onPaymentTermsChange,
  onPaymentDetailsChange,
  onGdprChange,
}: ConsentCheckboxesProps) {
  const t = useTranslations("subscription.checkout");

  return (
    <div className="space-y-5">
      <ConsentItem
        id="payment-terms"
        checked={paymentTermsConsent}
        onChange={onPaymentTermsChange}
        icon={<FileText className="h-4 w-4 text-primary" />}
      >
        {t("consentRecurring")}{" "}
        <a
          href="https://www.primat.cz/podminky-uzivani"
          className="text-primary underline hover:no-underline font-medium"
          target="_blank"
          rel="noopener noreferrer"
        >
          (Podmínky užívání)
        </a>
      </ConsentItem>

      <ConsentItem
        id="payment-details"
        checked={paymentDetailsConsent}
        onChange={onPaymentDetailsChange}
        icon={<Shield className="h-4 w-4 text-primary" />}
      >
        {t("consentStorage")}
      </ConsentItem>

      <ConsentItem
        id="gdpr"
        checked={gdprConsent}
        onChange={onGdprChange}
        icon={<Lock className="h-4 w-4 text-primary" />}
      >
        Souhlasím se{" "}
        <a
          href="https://www.primat.cz/ochrana-osobnich-udaju"
          className="text-primary underline hover:no-underline font-medium"
          target="_blank"
          rel="noopener noreferrer"
        >
          zpracováním osobních údajů
        </a>{" "}
        v souladu s GDPR
      </ConsentItem>
    </div>
  );
}

function ConsentItem({
  id,
  checked,
  onChange,
  icon,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start space-x-3 p-4 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="mt-0.5"
      />
      <div className="flex items-start gap-2 flex-1">
        <div className="mt-0.5">{icon}</div>
        <Label
          htmlFor={id}
          className="text-sm font-normal leading-relaxed cursor-pointer flex-1"
        >
          {children}
        </Label>
      </div>
    </div>
  );
}

