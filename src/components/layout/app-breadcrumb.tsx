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

// Custom page title overrides
const pageTitleOverrides: Record<string, string> = {
  predmety: "Předměty",
  learn: "Učit se",
  tests: "Testy",
  settings: "Nastavení",
  flashcards: "Flashkarty",
  materials: "Materiály",
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

  // Fetch subject and topic data
  const { data: subjectData } = useSubject(subjectId || 0);
  const { data: topicData } = useTopic(topicId || 0);

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

  // Filter out "temata" from segments
  const filteredSegments = segments.filter((segment) => segment !== "temata");

  // Build breadcrumb path
  const breadcrumbs: Array<{ title: string; href: string; isLast: boolean }> =
    [];

  filteredSegments.forEach((segment, index) => {
    const isLast = index === filteredSegments.length - 1;

    // Skip if this is a numeric ID that will be replaced by name
    const isNumeric = /^\d+$/.test(segment);
    if (isNumeric) {
      // Check if this is a subject ID
      if (
        segments[segments.indexOf(segment) - 1] === "predmety" &&
        subjectData?.data
      ) {
        breadcrumbs.push({
          title: subjectData.data.name,
          href: `/predmety/${segment}`,
          isLast,
        });
      }
      // Check if this is a topic ID
      else if (
        segments[segments.indexOf(segment) - 1] === "temata" &&
        topicData?.data
      ) {
        breadcrumbs.push({
          title: topicData.data.name,
          href: `/predmety/${subjectId}/temata/${segment}`,
          isLast,
        });
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
