"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { BookOpen, CreditCard, Home } from "lucide-react";
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
  useSidebar,
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
  const { state } = useSidebar();

  const isFreeUser = user?.subscriptionType === "free";
  const isCollapsed = state === "collapsed";

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
    ...(isFreeUser
      ? [
          {
            title: tNav("subscription"),
            url: "/predplatne",
            icon: CreditCard,
          },
        ]
      : []),
  ];

  return (
    <Sidebar collapsible="icon" className="relative p-0">
      {/* <div
        className="pointer-events-none absolute left-1/2 top-0 z-0 -translate-x-1/2"
        style={{
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(255, 204, 0, 1) 0%, rgba(255, 204, 0, 0.4) 30%, transparent 70%)",
        }}
      /> */}

      <SidebarHeader className="relative z-10 p-0">
        <div className="bg-brand-yellow py-2.25 px-0 group-data-[collapsible=icon]:py-2">
          <div className="flex items-center justify-center">
            {isCollapsed ? (
              <Image
                src="/logo_miniature.svg"
                alt={tBrand("name")}
                width={24}
                height={18}
                className="h-auto"
                priority
              />
            ) : (
              <Image
                src="/logo.svg"
                alt={tBrand("name")}
                width={136}
                height={37}
                className="h-auto w-42"
                priority
              />
            )}
          </div>
        </div>
        {/* <div className="from-brand-yellow/100  to-brand-yellow/0 bg-gradient-to-b h-4"/> */}
      </SidebarHeader>

      <SidebarContent className="relative z-10">
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
          <div className="px-4 py-3 group-data-[collapsible=icon]:hidden">
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

        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
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
