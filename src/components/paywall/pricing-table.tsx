import { Check, Sparkles, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BillingPlan } from "@/lib/validations/billing";

interface PricingTableProps {
  plans: BillingPlan[];
}

export function PricingTable({ plans }: PricingTableProps) {
  return (
    <div className=" gap-6 mx-auto">
      {plans.map((plan) => {
        const isPopular = plan.billingPeriod === "yearly";
        return (
          <div
            key={plan.id}
            className={`relative overflow-hidden rounded-3xl border-2 transition-all duration-300  ${
              isPopular
                ? "border-primary shadow-2xl shadow-primary/20"
                : "border-border/50 shadow-lg"
            }`}
          >
            {/* Background gradient */}
            <div
              className={`absolute inset-0 ${
                isPopular
                  ? "bg-gradient-to-br from-primary/10 via-primary/5 to-background"
                  : "bg-gradient-to-br from-background to-muted/20"
              }`}
            />

            {/* Popular badge */}
            {isPopular && (
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-bold rounded-bl-2xl flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>NEJOBLÍBENĚJŠÍ</span>
              </div>
            )}

            {/* Savings badge */}
            {plan.savingsPercent && (
              <div className="absolute top-6 left-6 z-10">
                <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 border-0 shadow-md px-3 py-1.5">
                  <TrendingDown className="h-3.5 w-3.5 mr-1" />
                  Ušetříte {plan.savingsPercent}%
                </Badge>
              </div>
            )}

            <div className="relative p-8">
              {/* Plan name */}
              <div className="mb-6 mt-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {plan.billingPeriod === "monthly"
                    ? "Fakturováno měsíčně"
                    : "Fakturováno ročně"}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {plan.priceFormatted.replace(" Kč", "")}
                  </span>
                  <span className="text-2xl text-muted-foreground">Kč</span>
                </div>
                {plan.pricePerMonth && plan.billingPeriod === "yearly" && (
                  <p className="text-sm text-muted-foreground">
                    Pouze {Math.round(plan.pricePerMonth)} Kč měsíčně
                  </p>
                )}
                <p className="text-sm text-primary font-semibold mt-2">
                  {plan.trialDays} dní zdarma
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />

              {/* Features */}
              <ul className="space-y-3.5">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 group">
                    <div className="mt-0.5 p-1 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}

