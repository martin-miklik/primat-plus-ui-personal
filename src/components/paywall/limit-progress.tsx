import { Progress } from "@/components/ui/progress";

interface LimitProgressProps {
  label: string;
  used: number;
  max: number;
}

export function LimitProgress({ label, used, max }: LimitProgressProps) {
  const percentage = (used / max) * 100;
  const isAtLimit = used >= max;
  const isNearLimit = percentage >= 80;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span
          className={
            isAtLimit
              ? "text-destructive font-medium"
              : "text-muted-foreground"
          }
        >
          {used} / {max}
        </span>
      </div>
      <Progress
        value={percentage}
        className="h-2"
        indicatorClassName={
          isAtLimit
            ? "bg-destructive"
            : isNearLimit
              ? "bg-yellow-500"
              : undefined
        }
      />
    </div>
  );
}

