import { Skeleton } from "@/components/ui/skeleton";

export function TopicListSkeleton() {
  return (
    <div className="flex items-center justify-between w-full px-4 py-3 border-l-2 border-transparent">
      <Skeleton className="h-5 w-32 flex-1 mr-2" />
      <Skeleton className="h-5 w-8 rounded-full" />
    </div>
  );
}


















