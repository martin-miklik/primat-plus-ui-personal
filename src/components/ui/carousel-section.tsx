import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CarouselSectionProps {
  children: ReactNode;
  className?: string;
}

export function CarouselSection({ children, className }: CarouselSectionProps) {
  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <div className="relative -mx-4 md:-mx-8">
        <div
          className={cn(
            "flex gap-4 overflow-x-scroll overflow-y-visible pb-4 px-4 md:px-8",
            "scroll-smooth",
            "[scrollbar-width:none]",
            "[&::-webkit-scrollbar]:hidden",
            "flex-nowrap"
          )}
          style={{
            scrollSnapType: "x mandatory",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
