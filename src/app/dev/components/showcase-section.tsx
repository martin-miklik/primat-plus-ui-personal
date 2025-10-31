"use client";

import { ReactNode, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShowcaseSectionProps {
  title: string;
  description: string;
  children: ReactNode;
  defaultExpanded?: boolean;
}

export function ShowcaseSection({
  title,
  description,
  children,
  defaultExpanded = true,
}: ShowcaseSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section className="space-y-6 rounded-lg border bg-card">
      <div className="p-6 pb-0">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="shrink-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && <div className="px-6 pb-6 space-y-8">{children}</div>}
    </section>
  );
}
