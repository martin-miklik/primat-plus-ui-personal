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

// Custom page title overrides
const pageTitleOverrides: Record<string, string> = {
  predmety: "Předměty",
  learn: "Učit se",
  tests: "Testy",
  settings: "Nastavení",
  flashcards: "Flashkarty",
  materials: "Materiály",
  topics: "Témata",
};

function formatSegment(segment: string): string {
  // Check if we have a custom override
  if (pageTitleOverrides[segment]) {
    return pageTitleOverrides[segment];
  }

  // Check if it's a UUID (simple check)
  if (segment.length === 36 && segment.split("-").length === 5) {
    return "...";
  }

  // Capitalize first letter
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}

export function AppBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter((segment) => segment !== "");

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
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const title = formatSegment(segment);

          return (
            <BreadcrumbItem key={href}>
              <BreadcrumbSeparator>
                <ChevronRight className="size-4" />
              </BreadcrumbSeparator>
              {isLast ? (
                <BreadcrumbPage>{title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={href}>{title}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
