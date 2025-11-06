"use client";

import Link from "next/link";
import { BookOpen, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Typography } from "./Typography";

export interface SubjectCardProps {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  topicsCount?: number;
  sourcesCount?: number;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function SubjectCard({
  id,
  name,
  description,
  icon,
  color = "#6B7280",
  onEdit,
  onDelete,
}: SubjectCardProps) {
  const t = useTranslations("subjects");
  const showActions = onEdit || onDelete;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/5",
        "border-border/50 bg-gradient-to-b from-background via-primary/3 to-primary/7 w-full p-0"
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-accent/[0.03] to-primary/[0.08] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Dropdown menu - positioned at top right with better spacing */}
      {showActions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 transition-opacity duration-200"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Otevřít menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(id);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                {t("edit")}
              </DropdownMenuItem>
            )}
            {onEdit && onDelete && <DropdownMenuSeparator />}
            {onDelete && (
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(id);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("delete")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Clickable card content - entire card is clickable */}
      <Link href={`/predmety/${id}`} className="block py-6 px-5">
        <div className="flex flex-col items-center text-center space-y-4 cursor-pointer">
          {/* Icon with ring and shadow effect - centered and larger */}
          <div className="relative flex-shrink-0">
            <div
              className="absolute inset-0 rounded-full opacity-20 blur-lg"
              style={{ backgroundColor: color }}
            />
            <div
              className="relative flex size-16 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-105"
              style={{
                backgroundColor: "transparent",
                borderColor: color,
                boxShadow: `0 0 0 2px var(--background), 0 0 0 4px ${color}`,
              }}
            >
              <div
                className="absolute inset-0 rounded-full opacity-10"
                style={{
                  background: `linear-gradient(135deg, ${color} 0%, transparent 100%)`,
                }}
              />
              {icon ? (
                <span className="relative text-3xl filter drop-shadow-sm transition-all duration-200 group-hover:scale-110">
                  {icon}
                </span>
              ) : (
                <BookOpen
                  className="relative size-8 transition-colors duration-300"
                  style={{ color: color }}
                />
              )}
            </div>
          </div>

          {/* Title */}
          <Typography variant="h3" className="w-full break-words text-center">
            {name}
          </Typography>

          {/* Description - truncated to 2 lines */}
          {description && (
            <Typography
              variant="muted"
              className="w-full text-sm line-clamp-2 min-h-[2.5rem] text-center"
            >
              {description}
            </Typography>
          )}
        </div>
      </Link>
    </Card>
  );
}
