import { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout";
import { AuthGuard } from "@/components/auth";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
