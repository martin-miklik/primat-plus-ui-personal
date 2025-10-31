import Link from "next/link";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { cs } from "date-fns/locale";

interface FlashcardPreviewProps {
  id: string;
  question: string;
  subjectId: string;
  subjectName: string;
  subjectColor?: string;
  difficulty?: "easy" | "medium" | "hard" | "again";
  reviewedAt?: string;
}

const difficultyColors = {
  easy: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  medium:
    "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  hard: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  again: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
};

export function FlashcardPreview({
  id,
  question,
  subjectId,
  subjectName,
  subjectColor,
  difficulty,
  reviewedAt,
}: FlashcardPreviewProps) {
  const t = useTranslations("dashboard.sections.cards");
  const tDifficulty = useTranslations("dashboard.recentCards.difficulty");

  return (
    <Card className="min-w-[220px] w-[220px] flex-shrink-0 transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Badge
            variant="secondary"
            className="border"
            style={{
              borderColor: subjectColor || "#6B7280",
              color: subjectColor || "#6B7280",
            }}
          >
            {subjectName}
          </Badge>
          {difficulty && (
            <Badge variant="outline" className={difficultyColors[difficulty]}>
              {tDifficulty(difficulty)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="line-clamp-3 text-sm font-medium">{question}</p>
        {reviewedAt && (
          <p className="mt-2 text-xs text-muted-foreground">
            Procvičeno{" "}
            {formatDistanceToNow(new Date(reviewedAt), {
              addSuffix: true,
              locale: cs,
            })}
          </p>
        )}
      </CardContent>

      <CardFooter className="gap-2 pt-0">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href={`/subjects/${subjectId}`}>{t("detail")}</Link>
        </Button>
        <Button size="sm" className="flex-1" asChild>
          <Link href={`/learn?card=${id}`}>{t("learn")}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
