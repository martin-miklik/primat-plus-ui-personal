import { http, HttpResponse, delay } from "msw";
import { mockSubjects } from "@/mocks/fixtures/subjects";
import { mockTopics } from "@/mocks/fixtures/topics";
import { mockTestResults } from "@/mocks/fixtures/tests";
import { apiPath } from "@/mocks/config";

export const dashboardHandlers = [
  http.get(apiPath("/dashboard"), async () => {
    await delay(300);

    // Get random 3-5 subjects for "recent"
    const recentSubjectsCount = Math.floor(Math.random() * 3) + 3; // 3-5
    const recentSubjects = mockSubjects.slice(0, recentSubjectsCount).map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      icon: s.icon,
      color: s.color,
      topicsCount: Math.floor(Math.random() * 10) + 1,
      createdAt: new Date().toISOString(),
    }));

    // Get 3-5 most recently studied topics
    const recentTopicsCount = Math.floor(Math.random() * 3) + 3; // 3-5
    const recentTopics = [...mockTopics]
      .sort((a, b) => {
        const dateA = a.lastStudied ? new Date(a.lastStudied).getTime() : 0;
        const dateB = b.lastStudied ? new Date(b.lastStudied).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, recentTopicsCount)
      .map((t) => ({
        id: t.id,
        name: t.name,
        subjectId: t.subjectId,
        subjectName: t.subjectName,
        subjectColor: t.subjectColor,
        cardsCount: t.cardsCount,
        createdAt: new Date().toISOString(),
      }));

    // Get 3-5 most recent test results
    const recentTestsCount = Math.floor(Math.random() * 3) + 3; // 3-5
    const recentTests = [...mockTestResults]
      .sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      )
      .slice(0, recentTestsCount);

    // Random stats
    const dueCardsCount = Math.floor(Math.random() * 51);
    const studyStreak = Math.floor(Math.random() * 31);
    const flashcardsCount = Math.floor(Math.random() * 200) + 50;
    const reviewedToday = Math.floor(Math.random() * 30);

    return HttpResponse.json({
      data: {
        stats: {
          subjectsCount: mockSubjects.length,
          topicsCount: mockTopics.length,
          sourcesCount: Math.floor(Math.random() * 20) + 5,
          flashcardsCount,
          dueCardsCount,
          testsCompletedCount: mockTestResults.length,
          averageTestScore: Math.floor(Math.random() * 40) + 60,
          studyStreak,
          reviewedToday,
        },
        recentSubjects,
        recentTopics,
        recentTests,
        recommendedAction: {
          type: dueCardsCount > 0 ? "practice_cards" : "create_content",
          message:
            dueCardsCount > 0
              ? `Máte ${dueCardsCount} kartiček připravených k procvičování`
              : "Začněte vytvořením prvního předmětu",
          subjectId: dueCardsCount > 0 ? mockSubjects[0].id : null,
          subjectName: dueCardsCount > 0 ? mockSubjects[0].name : null,
          sourceId: dueCardsCount > 0 ? 1 : null,
          count: dueCardsCount,
        },
      },
    });
  }),
];
