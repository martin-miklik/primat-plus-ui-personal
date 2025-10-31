import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

/**
 * Subject Card Skeleton - Loading placeholder
 *
 * Matches the SubjectCard layout dimensions for seamless loading state
 */
export function SubjectCardSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {/* Icon skeleton */}
          <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />

          {/* Title and description skeleton */}
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Stats skeleton */}
        <Skeleton className="h-4 w-40" />
      </CardContent>

      <CardFooter className="gap-2 pt-0">
        {/* Button skeletons */}
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </CardFooter>
    </Card>
  );
}
