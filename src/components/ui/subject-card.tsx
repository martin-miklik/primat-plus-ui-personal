"use client";

import Link from "next/link";
import {
  BookOpen,
  MoreVertical,
  Pencil,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Typography } from "./Typography";

export interface SubjectCardProps {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  topicsCount: number;
  sourcesCount: number;
  variant?: "carousel" | "grid";
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function SubjectCard({
  id,
  name,
  description,
  icon,
  color = "#6B7280",
  topicsCount,
  sourcesCount,
  variant = "carousel",
  onEdit,
  onDelete,
}: SubjectCardProps) {
  const t = useTranslations("dashboard.recentSubjects");
  const showActions = variant === "grid" && (onEdit || onDelete);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/5 h-full pb-0",
        "border-border/50 bg-gradient-to-b from-background via-primary/3 to-primary/7",
        variant === "carousel"
          ? "min-w-[220px] w-[220px] flex-shrink-0"
          : "w-full"
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-accent/[0.03] to-primary/[0.08] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Dropdown menu for grid variant - positioned at top */}
      {showActions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 z-10 h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Otevřít menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(id);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Upravit
              </DropdownMenuItem>
            )}
            {onEdit && onDelete && <DropdownMenuSeparator />}
            {onDelete && (
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(id);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Smazat
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Clickable card content */}
      <Link
        href={`/predmety/${id}`}
        className="flex flex-col h-full cursor-pointer"
      >
        <CardHeader className="relative flex-shrink-0 mb-2">
          <div className="flex items-center gap-3">
            {/* Icon with ring and shadow effect */}
            <div className="relative shrink-0 mr-2">
              <div
                className="absolute inset-0 rounded-xl opacity-20 blur-md"
                style={{ backgroundColor: color }}
              />
              <div
                className="relative flex size-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105"
                style={{
                  backgroundColor: "transparent",
                  borderColor: color,
                  boxShadow: `0 0 0 2px var(--background), 0 0 0 4px ${color}`,
                }}
              >
                <div
                  className="absolute inset-0 rounded-xl opacity-10"
                  style={{
                    background: `linear-gradient(135deg, ${color} 0%, transparent 100%)`,
                  }}
                />
                {icon ? (
                  <span className="relative text-2xl filter drop-shadow-sm transition-all duration-200 group-hover:scale-125">
                    {icon}
                  </span>
                ) : (
                  <BookOpen
                    className="relative size-6 transition-colors duration-300"
                    style={{ color: color }}
                  />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <Typography variant="h3">{name}</Typography>
              {variant === "grid" && description && (
                <Typography variant="body" className="py-1">
                  {description}
                </Typography>
              )}
            </div>

            {/* Arrow indicator - only show when there's no dropdown menu */}
            {!showActions && (
              <div className="shrink-0">
                <ArrowRight
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    "text-muted-foreground group-hover:text-foreground",
                    "group-hover:translate-x-1",
                    "opacity-60 md:opacity-0 md:group-hover:opacity-100"
                  )}
                />
              </div>
            )}
          </div>
        </CardHeader>

        {/* Spacer to push separator and content to bottom */}
        <div className="flex-grow" />

        <Separator className="opacity-50" />

        <CardContent className="relative flex items-center justify-center py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div
                className="size-1.5 rounded-full opacity-60"
                style={{ backgroundColor: color }}
              />
              <Typography
                variant="body"
                className="text-muted-foreground font-medium"
              >
                {topicsCount} <span className="font-normal">témat</span>
              </Typography>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="size-1.5 rounded-full opacity-60"
                style={{ backgroundColor: color }}
              />
              <Typography
                variant="body"
                className="text-muted-foreground font-medium"
              >
                {sourcesCount} <span className="font-normal">{t("sources")}</span>
              </Typography>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
