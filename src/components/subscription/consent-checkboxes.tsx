"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { Shield } from "lucide-react";

interface ConsentCheckboxesProps {
  recurringConsent: boolean;
  storageConsent: boolean;
  onRecurringChange: (checked: boolean) => void;
  onStorageChange: (checked: boolean) => void;
}

export function ConsentCheckboxes({
  recurringConsent,
  storageConsent,
  onRecurringChange,
  onStorageChange,
}: ConsentCheckboxesProps) {
  const t = useTranslations("subscription.checkout");

  return (
    <div className="space-y-5">
      <ConsentItem
        id="recurring-consent"
        checked={recurringConsent}
        onChange={onRecurringChange}
      >
        {t("consentRecurring")}{" "}
        <a
          href="#"
          className="text-primary underline hover:no-underline font-medium"
          target="_blank"
          rel="noopener noreferrer"
        >
          ({t("termsLink")})
        </a>
      </ConsentItem>

      <ConsentItem
        id="storage-consent"
        checked={storageConsent}
        onChange={onStorageChange}
      >
        <div className="flex items-start gap-2">
          <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <span>{t("consentStorage")}</span>
        </div>
      </ConsentItem>
    </div>
  );
}

function ConsentItem({
  id,
  checked,
  onChange,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
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
      <Label
        htmlFor={id}
        className="text-sm font-normal leading-relaxed cursor-pointer flex-1"
      >
        {children}
      </Label>
    </div>
  );
}

