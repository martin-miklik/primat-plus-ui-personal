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
import { formatDistanceToNow } from "date-fns";
import { cs } from "date-fns/locale";

interface TopicCardProps {
  id: string;
  name: string;
  subjectId: string;
  subjectName: string;
  subjectColor?: string;
  cardsCount: number;
  lastStudied?: string;
}

export function TopicCard({
  id,
  name,
  subjectId,
  subjectName,
  subjectColor,
  cardsCount,
  lastStudied,
}: TopicCardProps) {
  const t = useTranslations("dashboard.sections.topics");

  return (
    <Card className="min-w-[220px] w-[220px] flex-shrink-0 transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="mb-2">
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
        </div>
        <CardTitle className="line-clamp-2 text-base">{name}</CardTitle>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground">
          {cardsCount} kartiček
          {lastStudied && (
            <>
              {" • "}
              {formatDistanceToNow(new Date(lastStudied), {
                addSuffix: true,
                locale: cs,
              })}
            </>
          )}
        </p>
      </CardContent>

      <CardFooter className="gap-2 pt-0">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href={`/subjects/${subjectId}/topics/${id}`}>
            {t("detail")}
          </Link>
        </Button>
        <Button size="sm" className="flex-1" asChild>
          <Link href={`/learn?topic=${id}`}>{t("learn")}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}









