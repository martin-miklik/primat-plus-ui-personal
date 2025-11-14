import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BillingPlan } from "@/lib/validations/billing";

interface PricingTableProps {
  plans: BillingPlan[];
}

export function PricingTable({ plans }: PricingTableProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4 my-6">
      {plans.map((plan) => (
        <Card key={plan.id} className="p-6 relative">
          {plan.savingsPercent && (
            <Badge className="absolute top-4 right-4 bg-green-600">
              Ušetříte {plan.savingsPercent}%
            </Badge>
          )}

          <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>

          <div className="mb-4">
            <span className="text-3xl font-bold">{plan.priceFormatted}</span>
            {plan.pricePerMonth && (
              <span className="text-muted-foreground text-sm ml-2">
                ({Math.round(plan.pricePerMonth)} Kč/měsíc)
              </span>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {plan.trialDays} dní zdarma, pak {plan.priceFormatted} /{" "}
              {plan.billingPeriod === "monthly" ? "měsíc" : "rok"}
            </p>
          </div>

          <ul className="space-y-2">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}

