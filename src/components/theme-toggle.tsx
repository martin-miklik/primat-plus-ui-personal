"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Theme Toggle Component
 *
 * Three-state theme switcher: Light / Dark / System
 * - Syncs with system preference when set to "system"
 * - Persists user preference to localStorage
 * - Smooth transitions and visual feedback
 *
 * @example
 * <ThemeToggle />
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("theme");
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render placeholder with same dimensions to prevent layout shift
    return (
      <div className="flex rounded-md border p-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
          <Sun className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
          <Moon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
          <Monitor className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="flex rounded-md border p-1"
      role="radiogroup"
      aria-label={t("toggle")}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme("light")}
        className={`h-8 w-8 ${theme === "light" ? "bg-accent" : ""}`}
        title={t("light")}
        aria-label={t("light")}
        aria-pressed={theme === "light"}
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme("dark")}
        className={`h-8 w-8 ${theme === "dark" ? "bg-accent" : ""}`}
        title={t("dark")}
        aria-label={t("dark")}
        aria-pressed={theme === "dark"}
      >
        <Moon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme("system")}
        className={`h-8 w-8 ${theme === "system" ? "bg-accent" : ""}`}
        title={t("system")}
        aria-label={t("system")}
        aria-pressed={theme === "system"}
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  );
}
