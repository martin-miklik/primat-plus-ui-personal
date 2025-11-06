"use client";

import Link from "next/link";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
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

export interface TopicCardProps {
  id: number;
  subjectId: number;
  name: string;
  cardsCount?: number; // Keep for compatibility but not displayed
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function TopicCard({
  id,
  subjectId,
  name,
  onEdit,
  onDelete,
}: TopicCardProps) {
  const t = useTranslations("topics");
  const showActions = onEdit || onDelete;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-black/5 p-0",
        "border-border/50 bg-gradient-to-r from-background via-primary/3 to-primary/5 w-full"
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-accent/[0.03] to-primary/[0.08] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Dropdown menu */}
      {showActions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1/2 -translate-y-1/2 right-3 z-10 h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 transition-opacity duration-200"
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
      <Link
        href={`/predmety/${subjectId}/temata/${id}`}
        className="block py-4 px-5 cursor-pointer"
      >
        <Typography variant="h4" className="truncate pr-8">
          {name}
        </Typography>
      </Link>
    </Card>
  );
}
