import { http, HttpResponse, delay } from "msw";
import { mockSubjects } from "@/mocks/fixtures/subjects";
import { mockTopics } from "@/mocks/fixtures/topics";
import { mockCards } from "@/mocks/fixtures/cards";
import { mockTestResults } from "@/mocks/fixtures/tests";
import { apiPath } from "@/mocks/config";

export const dashboardHandlers = [
  http.get(apiPath("/dashboard"), async () => {
    await delay(300);

    // Get random 3-5 subjects for "recent"
    const recentSubjectsCount = Math.floor(Math.random() * 3) + 3; // 3-5
    const recentSubjects = mockSubjects.slice(0, recentSubjectsCount);

    // Get 3-5 most recently studied topics
    const recentTopicsCount = Math.floor(Math.random() * 3) + 3; // 3-5
    const recentTopics = [...mockTopics]
      .sort((a, b) => {
        const dateA = a.lastStudied ? new Date(a.lastStudied).getTime() : 0;
        const dateB = b.lastStudied ? new Date(b.lastStudied).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, recentTopicsCount);

    // Get 5 most recently reviewed cards
    const recentCards = [...mockCards]
      .sort((a, b) => {
        const dateA = a.reviewedAt ? new Date(a.reviewedAt).getTime() : 0;
        const dateB = b.reviewedAt ? new Date(b.reviewedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);

    // Get 3-5 most recent test results
    const recentTestsCount = Math.floor(Math.random() * 3) + 3; // 3-5
    const recentTests = [...mockTestResults]
      .sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      )
      .slice(0, recentTestsCount);

    // Random due cards count (0-50)
    const dueCardsCount = Math.floor(Math.random() * 51);

    // Random study streak (0-30 days)
    const studyStreak = Math.floor(Math.random() * 31);

    // Total cards count
    const totalCards = mockCards.length;

    return HttpResponse.json({
      data: {
        recentSubjects,
        recentTopics,
        recentCards,
        recentTests,
        dueCardsCount,
        studyStreak,
        totalCards,
      },
    });
  }),
];
