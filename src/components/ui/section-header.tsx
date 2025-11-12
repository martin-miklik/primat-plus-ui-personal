import Link from "next/link";
import { ChevronRight, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  viewAllHref: string;
  viewAllLabel?: string;
}

export function SectionHeader({
  title,
  icon: Icon,
  viewAllHref,
  viewAllLabel = "Zobrazit vše",
}: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-xl font-semibold">
        {Icon && <Icon className="size-5" />}
        {title}
      </h2>
      <Button variant="ghost" size="sm" asChild>
        <Link href={viewAllHref}>
          {viewAllLabel}
          <ChevronRight className="ml-1 size-4" />
        </Link>
      </Button>
    </div>
  );
}




















