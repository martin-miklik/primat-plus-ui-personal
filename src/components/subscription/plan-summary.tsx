import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import type { BillingPlan } from "@/lib/validations/billing";

interface PlanSummaryProps {
  plan: BillingPlan;
}

export function PlanSummary({ plan }: PlanSummaryProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-background to-background p-6 shadow-lg">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 h-24 w-24 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {plan.trialDays} dní zdarma
              </p>
            </div>
          </div>
          {plan.savingsPercent && (
            <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 border-0 shadow-md">
              -{plan.savingsPercent}%
            </Badge>
          )}
        </div>

        {/* Price */}
        <div className="mb-6 pb-6 border-b border-border/50">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {plan.priceFormatted}
            </span>
            <span className="text-muted-foreground text-lg">
              / {plan.billingPeriod === "monthly" ? "měsíc" : "rok"}
            </span>
          </div>
          {plan.pricePerMonth && plan.billingPeriod === "yearly" && (
            <p className="text-sm text-muted-foreground">
              Pouze {Math.round(plan.pricePerMonth)} Kč měsíčně
            </p>
          )}
        </div>

        {/* Features */}
        <div className="space-y-3">
          {plan.features.map((feature, i) => (
            <div key={i} className="flex items-start gap-3 group">
              <div className="mt-0.5 p-1 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Check className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm leading-relaxed">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

