"use client";

import { use, useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopicListItem, TopicListSkeleton } from "@/components/topics";
import {
  CreateTopicDialog,
  EditTopicDialog,
  DeleteTopicDialog,
} from "@/components/dialogs";
import { EmptyState } from "@/components/states/empty-states";
import { MaterialsList } from "@/components/materials/materials-list";
import { useDialog } from "@/hooks/use-dialog";
import { useTopics } from "@/lib/api/queries/topics";
import { useSubject } from "@/lib/api/queries/subjects";
import { Topic } from "@/lib/validations/topic";
import Link from "next/link";
import { Typography } from "@/components/ui/Typography";

interface SubjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const { id: subjectIdParam } = use(params);
  const subjectId = Number(subjectIdParam); // Parse string to number

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const t = useTranslations("topics");
  const tError = useTranslations("topics.error");
  const tEmpty = useTranslations("topics.empty");

  const createDialog = useDialog("create-topic");
  const editDialog = useDialog("edit-topic");
  const deleteDialog = useDialog("delete-topic");

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Fetch subject and topics
  const { data: subjectData } = useSubject(subjectId);
  const {
    data: topicsData,
    isLoading,
    isError,
    refetch,
  } = useTopics(subjectId);

  const subject = subjectData?.data;
  const topics = useMemo(() => topicsData?.data || [], [topicsData?.data]);

  // Get selected topic ID from URL or default to first topic
  const selectedTopicIdParam = searchParams.get("topic");
  const selectedTopicId = selectedTopicIdParam
    ? Number(selectedTopicIdParam)
    : topics[0]?.id;
  const selectedTopicData = topics.find((t) => t.id === selectedTopicId);

  // Update URL when topic is selected
  const handleTopicSelect = useCallback(
    (topicId: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("topic", String(topicId)); // Convert number to string for URL
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Auto-select first topic when topics load
  useEffect(() => {
    if (topics.length > 0 && !selectedTopicId) {
      handleTopicSelect(topics[0].id);
    }
  }, [topics, selectedTopicId, handleTopicSelect]);

  const handleEdit = (id: number) => {
    const topic = topics.find((t) => t.id === id);
    if (topic) {
      setSelectedTopic(topic);
      editDialog.open();
    }
  };

  const handleDelete = (id: number) => {
    const topic = topics.find((t) => t.id === id);
    if (topic) {
      setSelectedTopic(topic);
      deleteDialog.open();
    }
  };

  // Handle topic deletion - select next/previous topic
  const handleTopicDeleted = (deletedId: number) => {
    if (selectedTopicId === deletedId) {
      const currentIndex = topics.findIndex((t) => t.id === deletedId);
      const nextTopic = topics[currentIndex + 1] || topics[currentIndex - 1];
      if (nextTopic) {
        handleTopicSelect(nextTopic.id);
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] overflow-hidden">
      {/* Left Panel - Topics List */}
      <aside className="w-80 border-r flex flex-col bg-background">
        {/* Header */}
        <div className="border-b space-y-4 pr-4 pb-4">
          <div className="flex items-center gap-2">
            <Link href="/predmety">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex justify-between items-center w-full">
              <Typography variant="h3" className="truncate">
                {subject?.name || "Předmět"}
              </Typography>
              {subject?.icon && (
                <span className="text-2xl">{subject.icon}</span>
              )}
            </div>
          </div>
          <Button onClick={createDialog.open} className="w-full" size="sm">
            <PlusIcon className="mr-2 h-4 w-4" />
            {t("create")}
          </Button>
        </div>

        {/* Topics List */}
        <div className="flex-1 overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <TopicListSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="p-4">
              <div className="flex flex-col items-center justify-center text-center py-8">
                <AlertCircle className="h-10 w-10 text-destructive mb-3" />
                <p className="text-sm font-medium mb-1">{tError("title")}</p>
                <p className="text-xs text-muted-foreground mb-4">
                  {tError("description")}
                </p>
                <Button onClick={() => refetch()} variant="outline" size="sm">
                  {tError("retry")}
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && topics.length === 0 && (
            <div className="p-4">
              <EmptyState
                icon={<PlusIcon className="h-10 w-10" />}
                title={tEmpty("title")}
                description={tEmpty("description")}
                action={{
                  label: tEmpty("action"),
                  onClick: createDialog.open,
                  variant: "default",
                }}
                className="py-8"
              />
            </div>
          )}

          {/* Topics List */}
          {!isLoading && !isError && topics.length > 0 && (
            <AnimatePresence mode="popLayout">
              <div className="space-y-1">
                {topics.map((topic, index) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{
                      delay: index * 0.03,
                      duration: 0.2,
                    }}
                  >
                    <TopicListItem
                      id={topic.id}
                      name={topic.name}
                      cardsCount={topic.cardsCount}
                      isActive={topic.id === selectedTopicId}
                      onSelect={handleTopicSelect}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </aside>

      {/* Right Panel - Materials */}
      <main className="flex-1 overflow-hidden bg-muted/10">
        <MaterialsList
          topicId={selectedTopicId || null}
          topicName={selectedTopicData?.name}
        />
      </main>

      {/* Dialogs */}
      <CreateTopicDialog subjectId={subjectId} />
      <EditTopicDialog topic={selectedTopic} />
      <DeleteTopicDialog topic={selectedTopic} onDeleted={handleTopicDeleted} />
    </div>
  );
}
