"use client";

import { useTranslations } from "next-intl";

export default function LearnPage() {
  const t = useTranslations("learn");

  return (
    <div>
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
    </div>
  );
}
