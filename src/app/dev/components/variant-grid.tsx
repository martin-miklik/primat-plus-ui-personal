import { ReactNode } from "react";

interface VariantGridProps {
  title: string;
  children: ReactNode;
}

export function VariantGrid({ title, children }: VariantGridProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
      <div className="flex flex-wrap gap-4">{children}</div>
    </div>
  );
}
