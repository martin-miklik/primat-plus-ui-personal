"use client";

import { useTranslations } from "next-intl";
import { FileQuestion, FolderOpen, Inbox, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

// Generic empty state with icon
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline";
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Empty className={className}>
      <EmptyHeader>
        {icon && <EmptyMedia variant="icon">{icon}</EmptyMedia>}
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {action && (
        <EmptyContent>
          <Button
            onClick={action.onClick}
            variant={action.variant || "default"}
            size="sm"
          >
            {action.label}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}

// Specific empty state variants for common scenarios

export function NoResultsState({
  searchQuery,
  onClear,
  className,
}: {
  searchQuery?: string;
  onClear?: () => void;
  className?: string;
}) {
  const t = useTranslations("states.empty");

  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Search />
        </EmptyMedia>
        <EmptyTitle>{t("noResults")}</EmptyTitle>
        <EmptyDescription>
          {searchQuery
            ? t("noResultsFor", { query: searchQuery })
            : t("noResults")}
        </EmptyDescription>
      </EmptyHeader>
      {onClear && (
        <EmptyContent>
          <Button onClick={onClear} variant="outline" size="sm">
            {t("clearSearch")}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}

export function NoDataState({
  entityName = "items",
  onCreate,
  createLabel,
  className,
}: {
  entityName?: string;
  onCreate?: () => void;
  createLabel?: string;
  className?: string;
}) {
  const t = useTranslations("states.empty");
  const tCommon = useTranslations("common");

  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Inbox />
        </EmptyMedia>
        <EmptyTitle>{t("noDataYet", { entity: entityName })}</EmptyTitle>
        <EmptyDescription>
          {t("getStarted", { entity: entityName })}
        </EmptyDescription>
      </EmptyHeader>
      {onCreate && (
        <EmptyContent>
          <Button onClick={onCreate} size="sm">
            {createLabel || tCommon("create")}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}

export function NoFilesState({
  onUpload,
  accept,
  className,
}: {
  onUpload?: () => void;
  accept?: string;
  className?: string;
}) {
  const t = useTranslations("states.empty");

  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpen />
        </EmptyMedia>
        <EmptyTitle>{t("noFiles")}</EmptyTitle>
        <EmptyDescription>
          {t("uploadFiles")} {accept && `Supported formats: ${accept}`}
        </EmptyDescription>
      </EmptyHeader>
      {onUpload && (
        <EmptyContent>
          <Button onClick={onUpload} size="sm">
            {t("uploadFiles")}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}

export function ResourceNotFoundState({
  resourceType = "resource",
  onBack,
  className,
}: {
  resourceType?: string;
  onBack?: () => void;
  className?: string;
}) {
  const tError = useTranslations("states.error");

  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileQuestion />
        </EmptyMedia>
        <EmptyTitle>
          {resourceType} {tError("notFound").toLowerCase()}
        </EmptyTitle>
        <EmptyDescription>{tError("notFoundMessage")}</EmptyDescription>
      </EmptyHeader>
      {onBack && (
        <EmptyContent>
          <Button onClick={onBack} variant="outline" size="sm">
            {tError("goBack")}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}
