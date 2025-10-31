"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  BookOpen,
  GraduationCap,
  Home,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { Typography } from "@/components/ui/Typography";

export function AppSidebar() {
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tBrand = useTranslations("brand");

  const navigation = [
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
    {
      title: tNav("learn"),
      url: "/ucit-se",
      icon: GraduationCap,
    },
    {
      title: tNav("settings"),
      url: "/nastaveni",
      icon: Settings,
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
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.url;
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
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
