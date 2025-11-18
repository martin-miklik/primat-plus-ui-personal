"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Brain,
  Plus,
  FileText,
  Layers,
  Flame,
  Target,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardHeroProps {
  userName?: string;
  streak?: number;
  dueToday?: number;
  reviewedToday?: number;
  totalCards?: number;
  isLoading?: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const, // easeOut bezier curve
    },
  },
};

const actionButtons = [
  {
    key: "learn",
    icon: Brain,
    href: "/learn",
    variant: "primary" as const,
  },
  {
    key: "newSubject",
    icon: Plus,
    href: "/subjects?action=create",
    variant: "default" as const,
  },
  {
    key: "takeTest",
    icon: FileText,
    href: "/predmety",
    variant: "default" as const,
  },
  {
    key: "cards",
    icon: Layers,
    href: "/learn",
    variant: "default" as const,
  },
];

export function DashboardHero({
  userName,
  streak = 0,
  dueToday = 0,
  reviewedToday = 0,
  totalCards = 0,
  isLoading = false,
}: DashboardHeroProps) {
  const tWelcome = useTranslations("dashboard.welcome");
  const tActions = useTranslations("dashboard.quickActions");
  const tStats = useTranslations("dashboard.dailyOverview");

  const greeting = userName
    ? tWelcome("greeting", { name: userName })
    : tWelcome("greetingDefault");

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-primary/10 p-8 lg:p-12">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute right-1/3 top-1/2 h-48 w-48 rounded-full bg-blue-500/5 blur-2xl" />
      </div>

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10"
      >
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left side: Greeting + Quick Actions */}
          <div className="flex flex-col gap-4 justify-between">
            {/* Greeting */}
            <motion.div variants={item} className="space-y-2">
              <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-4xl font-bold text-transparent lg:text-5xl">
                {greeting}
              </h1>
              <p className="text-lg text-muted-foreground">
                {tWelcome("subtitle")}
              </p>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              variants={item}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
            >
              {actionButtons.map((action) => (
                <motion.div
                  key={action.key}
                  variants={item}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href={action.href}>
                    <Card
                      className={cn(
                        "group cursor-pointer border backdrop-blur-sm transition-all duration-200 hover:shadow-lg",
                        action.variant === "primary"
                          ? "border-primary/20 bg-primary/10 hover:bg-primary/15"
                          : "border-border/50 bg-background/50 hover:bg-background/80"
                      )}
                    >
                      <div className="flex flex-col items-center gap-3 p-4 text-center">
                        <div
                          className={cn(
                            "flex size-12 items-center justify-center rounded-xl transition-colors",
                            action.variant === "primary"
                              ? "bg-primary/20 text-primary"
                              : "bg-muted/50 text-foreground group-hover:bg-muted"
                          )}
                        >
                          <action.icon className="size-6" />
                        </div>
                        <span className="text-sm font-semibold">
                          {tActions(`${action.key}.title`)}
                        </span>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right side: Stats */}
          <motion.div variants={item}>
            {isLoading ? (
              <Card className="h-full border-border/50 bg-background/50 p-6 backdrop-blur-sm">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-24" />
                    ))}
                  </div>
                </div>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {/* Streak */}
                  <div className="flex flex-col items-center gap-2 rounded-xl bg-orange-500/10 p-4 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-orange-500/20">
                      <Flame className="size-6 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold">{streak}</p>
                    <p className="text-xs text-muted-foreground">
                      {tStats("streak")}
                    </p>
                  </div>

                  {/* Due Today */}
                  <div className="flex flex-col items-center gap-2 rounded-xl bg-primary/10 p-4 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/20">
                      <Target className="size-6 text-primary" />
                    </div>
                    <p className="text-2xl font-bold">{dueToday}</p>
                    <p className="text-xs text-muted-foreground">
                      {tStats("dueToday")}
                    </p>
                  </div>

                  {/* Reviewed Today */}
                  <div className="flex flex-col items-center gap-2 rounded-xl bg-green-500/10 p-4 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-green-500/20">
                      <CheckCircle2 className="size-6 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold">{reviewedToday}</p>
                    <p className="text-xs text-muted-foreground">
                      {tStats("reviewedToday")}
                    </p>
                  </div>

                  {/* Total Cards */}
                  <div className="flex flex-col items-center gap-2 rounded-xl bg-blue-500/10 p-4 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-blue-500/20">
                      <Layers className="size-6 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold">{totalCards}</p>
                    <p className="text-xs text-muted-foreground">
                      {tStats("totalCards")}
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
