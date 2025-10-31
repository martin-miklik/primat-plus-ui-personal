"use client";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface TopicListItemProps {
  id: string;
  name: string;
  cardsCount: number;
  isActive?: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TopicListItem({
  id,
  name,
  cardsCount,
  isActive = false,
  onSelect,
  onEdit,
  onDelete,
}: TopicListItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center justify-between w-full px-4 py-3",
        "hover:bg-accent transition-colors cursor-pointer",
        "border-l-2",
        isActive
          ? "border-primary bg-accent"
          : "border-transparent hover:border-muted-foreground/20"
      )}
      onClick={() => onSelect(id)}
    >
      <span
        className={cn(
          "font-medium truncate flex-1 mr-2",
          isActive && "text-primary"
        )}
      >
        {name}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="secondary" className="text-xs">
          {cardsCount}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Otevřít menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(id);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Upravit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Smazat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}






