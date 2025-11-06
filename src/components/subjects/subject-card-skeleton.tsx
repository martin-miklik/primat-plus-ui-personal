import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

/**
 * Subject Card Skeleton - Loading placeholder
 *
 * Matches the SubjectCard layout dimensions for seamless loading state
 */
export function SubjectCardSkeleton() {
  return (
    <Card className="w-full p-4">
      <div className="flex flex-col items-center text-center space-y-3">
        {/* Icon skeleton - centered and larger */}
        <Skeleton className="h-16 w-16 shrink-0 rounded-full" />

        {/* Title skeleton */}
        <Skeleton className="h-5 w-3/4" />

        {/* Description skeleton - 2 lines */}
        <div className="w-full space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6 mx-auto" />
        </div>
      </div>
    </Card>
  );
}
