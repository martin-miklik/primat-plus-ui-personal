"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { BookOpen, GraduationCap, Home } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tBrand = useTranslations("brand");
  const tTheme = useTranslations("theme");
  const { user } = useAuth();

  const isFreeUser = user?.subscriptionType === "free";

  const mainNavigation = [
    {
      title: tNav("dashboard"),
      url: "/",
      icon: Home,
    },
    {
      title: tNav("subjects"),
      url: "/predmety",
      icon: BookOpen,
    },
  ];

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="bg-primary flex size-8 items-center justify-center rounded-lg">
            <GraduationCap className="text-primary-foreground size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{tBrand("name")}</span>
            <span className="text-muted-foreground text-xs">
              {tBrand("tagline")}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground">
            {tNav("navigationLabel")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => {
                const isActive =
                  item.url === "/"
                    ? pathname === "/"
                    : pathname === item.url ||
                      pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <item.icon />
                        <Typography variant="body">{item.title}</Typography>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* Upgrade CTA for free users */}
        {isFreeUser && (
          <div className="px-4 py-3">
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <div className="flex items-start gap-2 mb-2">
                <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-yellow-900 dark:text-yellow-100">
                    Vyzkoušejte Premium
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">
                    14 dní zdarma, pak 199 Kč/měsíc
                  </p>
                </div>
              </div>
              <Button asChild size="sm" className="w-full h-8 text-xs">
                <Link href="/predplatne">Upgrade</Link>
              </Button>
            </div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground">
            {tTheme("displayMode")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 py-1 flex">
              <ThemeToggle />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
