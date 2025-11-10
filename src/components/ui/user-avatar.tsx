"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({ className, fallbackClassName }: UserAvatarProps) {
  const { user } = useAuthStore();

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <Avatar className={cn("h-8 w-8 rounded-lg", className)}>
      <AvatarFallback className={cn("rounded-lg text-xs", fallbackClassName)}>
        {userInitials}
      </AvatarFallback>
    </Avatar>
  );
}


