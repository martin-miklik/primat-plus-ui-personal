import Link from "next/link";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

interface TestCardProps {
  id: string;
  name: string;
  subjectName: string;
  subjectColor?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
}

function getScoreBadgeColor(score: number): string {
  if (score >= 80) {
    return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
  } else if (score >= 60) {
    return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
  } else {
    return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
  }
}

export function TestCard({
  id,
  name,
  subjectName,
  subjectColor,
  score,
  totalQuestions,
  correctAnswers,
  completedAt,
}: TestCardProps) {
  const t = useTranslations("dashboard.sections.tests");

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
          <Badge variant="outline" className={getScoreBadgeColor(score)}>
            {score}%
          </Badge>
        </div>
        <CardTitle className="line-clamp-2 text-base">{name}</CardTitle>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground">
          {correctAnswers}/{totalQuestions} otázek
          <br />
          {format(new Date(completedAt), "d. MMM yyyy", { locale: cs })}
        </p>
      </CardContent>

      <CardFooter className="gap-2 pt-0">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href={`/tests/${id}`}>{t("detail")}</Link>
        </Button>
        <Button size="sm" className="flex-1" asChild>
          <Link href={`/tests/${id}/retake`}>{t("retake")}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}









