"use client";

import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  onReconnect?: () => void;
  className?: string;
}

export function ConnectionStatus({
  isConnected,
  isConnecting,
  onReconnect,
  className,
}: ConnectionStatusProps) {
  const t = useTranslations("chat.connection");

  if (isConnected) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-xs text-muted-foreground",
          className
        )}
      >
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span>{t("connected")}</span>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-xs text-muted-foreground",
          className
        )}
      >
        <div className="flex items-center gap-1.5">
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span>{t("connecting")}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs text-destructive",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <WifiOff className="h-3 w-3" />
        <span>{t("disconnected")}</span>
      </div>
      {onReconnect && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReconnect}
          className="h-6 px-2 text-xs"
        >
          {t("reconnect")}
        </Button>
      )}
    </div>
  );
}


