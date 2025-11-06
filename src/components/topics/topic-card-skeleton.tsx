import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

/**
 * Topic Card Skeleton - Loading placeholder
 *
 * Matches the TopicCard layout dimensions for seamless loading state
 */
export function TopicCardSkeleton() {
  return (
    <Card className="w-full p-4">
      <div className="flex items-center justify-between gap-2">
        {/* Title skeleton */}
        <Skeleton className="h-5 w-3/4" />

        {/* Action button skeleton */}
        <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
      </div>
    </Card>
  );
}

