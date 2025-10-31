import { http, HttpResponse, delay } from "msw";
import { mockTopics, createMockTopic } from "@/mocks/fixtures/topics";
import { Topic } from "@/lib/validations/topic";

const topics = [...mockTopics];

export const topicsHandlers = [
  // GET /api/subjects/:subjectId/topics - List topics for a subject
  http.get("/api/subjects/:subjectId/topics", async ({ params }) => {
    await delay(250);

    const { subjectId } = params;
    const subjectTopics = topics.filter((t) => t.subjectId === subjectId);

    return HttpResponse.json({
      data: subjectTopics,
      total: subjectTopics.length,
    });
  }),

  // GET /api/topics/:id - Get single topic
  http.get("/api/topics/:id", async ({ params }) => {
    await delay(200);

    const { id } = params;
    const topic = topics.find((t) => t.id === id);

    if (!topic) {
      return HttpResponse.json(
        { error: "Téma nenalezeno", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: topic });
  }),

  // POST /api/subjects/:subjectId/topics - Create new topic
  http.post("/api/subjects/:subjectId/topics", async ({ params, request }) => {
    await delay(400);

    const { subjectId } = params;
    const body = (await request.json()) as Record<string, unknown>;

    if (!body.name || typeof body.name !== "string") {
      return HttpResponse.json(
        { error: "Název tématu je povinný", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const newTopic = createMockTopic({
      subjectId: subjectId as string,
      name: body.name,
      description: body.description as string | undefined,
      order: (body.order as number | undefined) || topics.length,
    });

    topics.push(newTopic);

    return HttpResponse.json(
      { data: newTopic, message: "Téma bylo úspěšně vytvořeno" },
      { status: 201 }
    );
  }),

  // PATCH /api/topics/:id - Update topic
  http.patch("/api/topics/:id", async ({ params, request }) => {
    await delay(300);

    const { id } = params;
    const body = (await request.json()) as Record<string, unknown>;
    const topicIndex = topics.findIndex((t) => t.id === id);

    if (topicIndex === -1) {
      return HttpResponse.json(
        { error: "Téma nenalezeno", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const updatedTopic: Topic = {
      ...topics[topicIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    topics[topicIndex] = updatedTopic;

    return HttpResponse.json({
      data: updatedTopic,
      message: "Téma bylo úspěšně aktualizováno",
    });
  }),

  // DELETE /api/topics/:id - Delete topic
  http.delete("/api/topics/:id", async ({ params }) => {
    await delay(300);

    const { id } = params;
    const topicIndex = topics.findIndex((t) => t.id === id);

    if (topicIndex === -1) {
      return HttpResponse.json(
        { error: "Téma nenalezeno", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    topics.splice(topicIndex, 1);

    return HttpResponse.json({
      message: "Téma bylo úspěšně smazáno",
    });
  }),
];
