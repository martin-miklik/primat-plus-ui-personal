"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useSubject } from "@/lib/api/queries/subjects";
import { useTopic } from "@/lib/api/queries/topics";
import { useSource } from "@/lib/api/queries/sources";

// Custom page title overrides
const pageTitleOverrides: Record<string, string> = {
  predmety: "Předměty",
  learn: "Učit se",
  tests: "Testy",
  testy: "Testy",
  settings: "Nastavení",
  flashcards: "Flashkarty",
  materials: "Materiály",
  chat: "AI Chat",
};

function formatSegment(segment: string): string {
  // Check if we have a custom override
  if (pageTitleOverrides[segment]) {
    return pageTitleOverrides[segment];
  }

  // Capitalize first letter
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}

export function AppBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter((segment) => segment !== "");

  // Extract IDs from path for data fetching
  const subjectIdIndex = segments.indexOf("predmety") + 1;
  const subjectId =
    subjectIdIndex > 0 && segments[subjectIdIndex]
      ? Number(segments[subjectIdIndex])
      : null;

  const topicIdIndex = segments.indexOf("temata") + 1;
  const topicId =
    topicIdIndex > 0 && segments[topicIdIndex]
      ? Number(segments[topicIdIndex])
      : null;

  const sourceIdIndex = segments.indexOf("zdroje") + 1;
  const sourceId =
    sourceIdIndex > 0 && segments[sourceIdIndex]
      ? Number(segments[sourceIdIndex])
      : null;

  // Fetch subject, topic, and source data
  const { data: subjectData } = useSubject(subjectId || 0);
  const { data: topicData } = useTopic(topicId || 0);
  const { data: sourceData } = useSource(sourceId || 0);

  // Home only
  if (segments.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-2">
              <Home className="size-4" />
              <span className="sr-only md:not-sr-only">Přehled</span>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Filter out "temata" and "zdroje" from segments
  const filteredSegments = segments.filter(
    (segment) => segment !== "temata" && segment !== "zdroje"
  );

  // Build breadcrumb path - track position in original segments array
  const breadcrumbs: Array<{ title: string; href: string; isLast: boolean }> =
    [];

  // Track which positions we've already processed to avoid duplicates
  const processedOriginalIndices = new Set<number>();

  filteredSegments.forEach((segment, index) => {
    const isLast = index === filteredSegments.length - 1;

    // Skip if this is a numeric ID that will be replaced by name
    const isNumeric = /^\d+$/.test(segment);
    if (isNumeric) {
      // Find all occurrences of this segment in original array
      const allIndices: number[] = [];
      segments.forEach((seg, idx) => {
        if (seg === segment && !processedOriginalIndices.has(idx)) {
          allIndices.push(idx);
        }
      });
      
      // Use the first unprocessed occurrence
      const originalIndex = allIndices[0];
      if (originalIndex === undefined) return;
      
      processedOriginalIndices.add(originalIndex);
      const previousSegment = segments[originalIndex - 1];
      
      // Check if this is a subject ID
      if (previousSegment === "predmety" && subjectData?.data) {
        breadcrumbs.push({
          title: subjectData.data.name,
          href: `/predmety/${segment}`,
          isLast,
        });
      }
      // Check if this is a topic ID - always show it
      else if (previousSegment === "temata" && topicData?.data) {
        breadcrumbs.push({
          title: topicData.data.name,
          href: `/predmety/${subjectId}/temata/${segment}`,
          isLast,
        });
      }
      // Check if this is a source ID - SKIP IT (sources don't have their own page)
      // The chat/testy page will be shown as the last breadcrumb instead
      else if (previousSegment === "zdroje" && sourceData?.data) {
        // Don't add source to breadcrumbs - it doesn't have a page
        // Just skip it
      }
    } else {
      // Regular segment (not an ID)
      const originalIndex = segments.indexOf(segment);
      const href = `/${segments.slice(0, originalIndex + 1).join("/")}`;
      breadcrumbs.push({
        title: formatSegment(segment),
        href,
        isLast,
      });
    }
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home link */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="size-4" />
              <span className="sr-only md:not-sr-only">Přehled</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Path segments */}
        {breadcrumbs.map((crumb, index) => (
          <BreadcrumbItem key={`${crumb.href}-${index}`}>
            <BreadcrumbSeparator>
              <ChevronRight className="size-4" />
            </BreadcrumbSeparator>
            {crumb.isLast ? (
              <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link href={crumb.href}>{crumb.title}</Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
