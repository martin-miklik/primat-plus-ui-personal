"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubjectCard } from "@/components/ui/subject-card";
import { SubjectCardSkeleton } from "@/components/subjects";
import {
  CreateSubjectDialog,
  EditSubjectDialog,
  DeleteSubjectDialog,
} from "@/components/dialogs";
import { EmptyState } from "@/components/states/empty-states";
import { useDialog } from "@/hooks/use-dialog";
import { useSubjects } from "@/lib/api/queries/subjects";
import { Subject } from "@/lib/validations/subject";

export default function SubjectsPage() {
  const t = useTranslations("subjects");
  const tError = useTranslations("subjects.error");
  const tEmpty = useTranslations("subjects.empty");

  const createDialog = useDialog("create-subject");
  const editDialog = useDialog("edit-subject");
  const deleteDialog = useDialog("delete-subject");

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const { data, isLoading, isError, refetch } = useSubjects();

  const subjects = data?.data || [];

  const handleEdit = (id: number) => {
    const subject = subjects.find((s) => s.id === id);
    if (subject) {
      setSelectedSubject(subject);
      editDialog.open();
    }
  };

  const handleDelete = (id: number) => {
    const subject = subjects.find((s) => s.id === id);
    if (subject) {
      setSelectedSubject(subject);
      deleteDialog.open();
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
        </div>
        <Button onClick={createDialog.open}>
          <PlusIcon className="mr-2 h-4 w-4" />
          {t("create")}
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SubjectCardSkeleton key={i} />
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
      {!isLoading && !isError && subjects.length === 0 && (
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

      {/* Subjects Grid */}
      {!isLoading && !isError && subjects.length > 0 && (
        <AnimatePresence mode="popLayout">
          <motion.div
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
            layout
          >
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.id}
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
                <SubjectCard
                  id={subject.id}
                  name={subject.name}
                  description={subject.description}
                  icon={subject.icon}
                  color={subject.color}
                  topicsCount={subject.topicsCount}
                  sourcesCount={subject.sourcesCount}
                  variant="grid"
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Dialogs */}
      <CreateSubjectDialog />
      <EditSubjectDialog subject={selectedSubject} />
      <DeleteSubjectDialog subject={selectedSubject} />
    </div>
  );
}
