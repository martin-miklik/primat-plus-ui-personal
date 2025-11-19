import { http, HttpResponse, delay } from "msw";
import { getMockChatResponse } from "@/mocks/fixtures/chat";
import { simulateStreamingResponse, simulateStreamError } from "@/mocks/utils/mock-centrifugo";
import { apiPath } from "@/mocks/config";

export const chatHandlers = [
  // GET /api/v1/chat/source/:sourceId - Get chat history for a source
  http.get(apiPath("/chat/source/:sourceId"), async ({ params }) => {
    const sourceId = Number(params.sourceId);
    
    // Simulate network delay
    await delay(100);

    // Return empty chat history for now (no persisted history in mock)
    return HttpResponse.json(
      {
        success: true,
        sourceId,
        chats: [],
        count: 0,
      },
      { status: 200 }
    );
  }),

  // POST /api/v1/chat/send - Send chat message
  http.post(apiPath("/chat/send"), async ({ request }) => {
    const body = (await request.json()) as {
      message?: string;
      sourceId?: number;
      channel?: string;
      model?: string;
    };

    // Validate required fields
    if (!body.message || !body.sourceId || !body.channel) {
      return HttpResponse.json(
        {
          success: false,
          error: "Missing required fields: message, sourceId, channel",
        },
        { status: 400 }
      );
    }

    // Simulate network delay
    await delay(200);

    // Generate job ID
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 10% chance of error for testing
    if (Math.random() < 0.1) {
      // Simulate error after a delay
      setTimeout(() => {
        simulateStreamError(
          body.channel!,
          jobId,
          "Simulovaná chyba - zkuste to znovu"
        );
      }, 1000);

      return HttpResponse.json(
        {
          success: true,
          channel: body.channel,
          jobId,
          status: "queued",
        },
        { status: 200 }
      );
    }

    // Get mock response based on message content
    const mockResponse = getMockChatResponse(body.message);

    // Start streaming simulation in background
    setTimeout(() => {
      simulateStreamingResponse(
        body.channel!,
        jobId,
        mockResponse,
        body.model || "gemini-flash-lite-latest"
      );
    }, 100);

    // Return success response immediately
    return HttpResponse.json(
      {
        success: true,
        channel: body.channel,
        jobId,
        status: "queued",
        message: "Chat message queued for processing",
      },
      { status: 200 }
    );
  }),
];

