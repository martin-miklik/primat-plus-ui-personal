"use client";

import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * MaterialCardSkeleton
 * 
 * Simple loading placeholder for material cards.
 * Shows a pulsing animation while sources are being fetched from the API.
 * 
 * Note: This is NOT for upload progress. Use MaterialCard with uploadState
 * prop for showing upload progress with WebSocket updates.
 */
export function MaterialCardSkeleton() {
  return (
    <div
      className={cn(
        "relative rounded-lg border bg-card shadow-sm p-0 h-full animate-pulse"
      )}
    >
      {/* Card Content */}
      <div className="flex flex-col gap-4 p-4 h-full">
        {/* Top: Icon + Info */}
        <div className="flex items-start gap-3 flex-1">
          {/* Icon placeholder */}
          <div className="flex-shrink-0 rounded-lg p-3 bg-muted">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Content placeholder */}
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>

        {/* Divider placeholder */}
        <div className="h-px bg-muted" />

        {/* Bottom: Action Buttons placeholder */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 bg-muted rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
