import { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout";
import { AuthGuard, SessionMonitor } from "@/components/auth";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <AuthGuard>
      <SessionMonitor />
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
