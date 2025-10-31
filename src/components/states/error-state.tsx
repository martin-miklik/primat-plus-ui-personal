"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title,
  message,
  onRetry,
  retryLabel,
  className,
}: ErrorStateProps) {
  const t = useTranslations("states.error");
  const tCommon = useTranslations("common");

  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircle className="text-destructive" />
        </EmptyMedia>
        <EmptyTitle>{title || t("title")}</EmptyTitle>
        <EmptyDescription>{message || t("message")}</EmptyDescription>
      </EmptyHeader>
      {onRetry && (
        <EmptyContent>
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw />
            {retryLabel || tCommon("tryAgain")}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}

// Specific error state variants
export function NotFoundState({
  title,
  message,
  onBack,
  className,
}: {
  title?: string;
  message?: string;
  onBack?: () => void;
  className?: string;
}) {
  const t = useTranslations("states.error");

  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircle />
        </EmptyMedia>
        <EmptyTitle>{title || t("notFound")}</EmptyTitle>
        <EmptyDescription>{message || t("notFoundMessage")}</EmptyDescription>
      </EmptyHeader>
      {onBack && (
        <EmptyContent>
          <Button onClick={onBack} variant="outline" size="sm">
            {t("goBack")}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}

export function NetworkErrorState({
  message,
  onRetry,
  className,
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  const t = useTranslations("states.error");
  const tCommon = useTranslations("common");

  return (
    <ErrorState
      title={t("title")}
      message={message || t("networkError")}
      onRetry={onRetry}
      retryLabel={tCommon("tryAgain")}
      className={className}
    />
  );
}
