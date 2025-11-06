"use client";

import { use, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopicCardSkeleton } from "@/components/topics";
import {
  CreateTopicDialog,
  EditTopicDialog,
  DeleteTopicDialog,
} from "@/components/dialogs";
import { EmptyState } from "@/components/states/empty-states";
import { TopicCard } from "@/components/ui/topic-card";
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
  const subjectId = Number(subjectIdParam);

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
  const topics = topicsData?.data || [];

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

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/predmety">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <Typography variant="h1">{subject?.name || "Předmět"}</Typography>
              {subject?.icon && (
                <span className="text-3xl">{subject.icon}</span>
              )}
            </div>
            {subject?.description && (
              <Typography variant="muted" className="mt-2">
                {subject.description}
              </Typography>
            )}
          </div>
        </div>
        <Button onClick={createDialog.open}>
          <PlusIcon className="mr-2 h-4 w-4" />
          {t("create")}
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <TopicCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">{tError("title")}</h3>
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
            {tError("description")}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            {tError("retry")}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && topics.length === 0 && (
        <EmptyState
          icon={<PlusIcon className="h-12 w-12" />}
          title={tEmpty("title")}
          description={tEmpty("description")}
          action={{
            label: tEmpty("action"),
            onClick: createDialog.open,
          }}
          className="py-12"
        />
      )}

      {/* Topics Grid */}
      {!isLoading && !isError && topics.length > 0 && (
        <AnimatePresence mode="popLayout">
          <motion.div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            layout
          >
            {topics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  delay: index * 0.05,
                  duration: 0.3,
                  ease: "easeOut",
                }}
                layout
              >
                <TopicCard
                  id={topic.id}
                  subjectId={subjectId}
                  name={topic.name}
                  cardsCount={topic.cardsCount}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Dialogs */}
      <CreateTopicDialog subjectId={subjectId} />
      <EditTopicDialog topic={selectedTopic} />
      <DeleteTopicDialog topic={selectedTopic} />
    </div>
  );
}
