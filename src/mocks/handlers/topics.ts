import { http, HttpResponse, delay } from "msw";
import { mockTopics, createMockTopic } from "@/mocks/fixtures/topics";
import { Topic } from "@/lib/validations/topic";
import { apiPath } from "@/mocks/config";

const topics = [...mockTopics];

export const topicsHandlers = [
  // GET /api/v1/subjects/:subjectId/topics - List topics for a subject
  http.get(apiPath("/subjects/:subjectId/topics"), async ({ params }) => {
    await delay(250);

    const subjectId = Number(params.subjectId);
    const subjectTopics = topics.filter((t) => t.subjectId === subjectId);

    return HttpResponse.json({
      success: true,
      data: subjectTopics,
      timestamp: new Date().toISOString(),
      version: "v1",
    });
  }),

  // GET /api/v1/topics/:id - Get single topic
  http.get(apiPath("/topics/:id"), async ({ params }) => {
    await delay(200);

    const id = Number(params.id);
    const topic = topics.find((t) => t.id === id);

    if (!topic) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Téma nenalezeno",
            status: 404,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: topic,
      timestamp: new Date().toISOString(),
      version: "v1",
    });
  }),

  // POST /api/v1/subjects/:subjectId/topics - Create new topic
  http.post(apiPath("/subjects/:subjectId/topics"), async ({ params, request }) => {
    await delay(400);

    const subjectId = Number(params.subjectId);
    const body = (await request.json()) as Record<string, unknown>;

    if (!body.name || typeof body.name !== "string") {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Název tématu je povinný",
            status: 400,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 400 }
      );
    }

    const newTopic = createMockTopic({
      subjectId: subjectId,
      name: body.name,
      description: body.description as string | undefined,
      order: (body.order as number | undefined) || topics.length,
    });

    topics.push(newTopic);

    return HttpResponse.json(
      {
        success: true,
        data: newTopic,
        timestamp: new Date().toISOString(),
        version: "v1",
      },
      { status: 201 }
    );
  }),

  // PATCH /api/v1/topics/:id - Update topic (keeping for compatibility)
  http.patch(apiPath("/topics/:id"), async ({ params, request }) => {
    await delay(300);

    const id = Number(params.id);
    const body = (await request.json()) as Record<string, unknown>;
    const topicIndex = topics.findIndex((t) => t.id === id);

    if (topicIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Téma nenalezeno",
            status: 404,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
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
      success: true,
      data: updatedTopic,
      timestamp: new Date().toISOString(),
      version: "v1",
    });
  }),

  // PUT /api/v1/topics/:id - Rename topic (backend uses this)
  http.put(apiPath("/topics/:id"), async ({ params, request }) => {
    await delay(300);

    const id = Number(params.id);
    const body = (await request.json()) as Record<string, unknown>;
    const topicIndex = topics.findIndex((t) => t.id === id);

    if (topicIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Téma nenalezeno",
            status: 404,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 404 }
      );
    }

    const updatedTopic: Topic = {
      ...topics[topicIndex],
      name: (body.name as string) || topics[topicIndex].name,
      updatedAt: new Date().toISOString(),
    };

    topics[topicIndex] = updatedTopic;

    return HttpResponse.json({
      success: true,
      data: updatedTopic,
      timestamp: new Date().toISOString(),
      version: "v1",
    });
  }),

  // DELETE /api/v1/topics/:id - Delete topic
  http.delete(apiPath("/topics/:id"), async ({ params }) => {
    await delay(300);

    const id = Number(params.id);
    const topicIndex = topics.findIndex((t) => t.id === id);

    if (topicIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Téma nenalezeno",
            status: 404,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 404 }
      );
    }

    topics.splice(topicIndex, 1);

    return HttpResponse.json({
      success: true,
      data: true,
      timestamp: new Date().toISOString(),
      version: "v1",
    });
  }),
];
