"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { ChatInterface } from "@/components/chat/chat-interface";
import { useSource } from "@/lib/api/queries/sources";

interface ChatPageProps {
  params: Promise<{
    id: string;
    topicId: string;
    sourceId: string;
  }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  const t = useTranslations();
  const {
    id: subjectIdParam,
    topicId: topicIdParam,
    sourceId: sourceIdParam,
  } = use(params);
  const subjectId = Number(subjectIdParam);
  const topicId = Number(topicIdParam);
  const sourceId = Number(sourceIdParam);

  // Fetch source data to get the name
  const { data: sourceData, isLoading, isError } = useSource(sourceId);
  const source = sourceData?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  if (isError || !source) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 p-4">
        <div className="text-destructive text-center">
          {t("sources.error.title")}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <ChatInterface
        sourceId={sourceId}
        sourceName={source.name}
        subjectId={subjectId}
        topicId={topicId}
      />
    </div>
  );
}
