"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  // Pages that should have no padding (full-width landing pages)
  const noPaddingPages = ["/predplatne", "/predplatne/checkout"];
  const hasNoPadding = noPaddingPages.some((page) => pathname === page);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden z-10">
        <AppHeader />
        <div
          className={`flex flex-1 flex-col ${
            hasNoPadding ? "" : "gap-4 p-4 md:gap-8 md:p-8"
          } max-h-[calc(100vh-100px)] overflow-y-auto`}
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
