import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActionCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  href: string;
  variant?: "default" | "primary";
  onClick?: () => void;
}

export function ActionCard({
  title,
  description,
  icon: Icon,
  href,
  variant = "default",
  onClick,
}: ActionCardProps) {
  const content = (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md",
        variant === "primary" && "border-primary bg-primary/5"
      )}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-lg",
            variant === "primary"
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="size-6" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">{title}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (onClick) {
    return <div onClick={onClick}>{content}</div>;
  }

  return <Link href={href}>{content}</Link>;
}












