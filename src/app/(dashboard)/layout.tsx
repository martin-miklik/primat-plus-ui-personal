import { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout";
import { AuthGuard, SessionMonitor } from "@/components/auth";
import { PaywallSheet } from "@/components/paywall/paywall-sheet";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <AuthGuard>
      <SessionMonitor />
      <PaywallSheet />
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
