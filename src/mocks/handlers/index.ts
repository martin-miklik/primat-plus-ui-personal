import { http, HttpResponse, delay } from "msw";
import { subjectsHandlers } from "./subjects";
import { topicsHandlers } from "./topics";
import { sourcesHandlers } from "./sources";
import { flashcardsHandlers } from "./flashcards";
import { testsHandlers } from "./tests";
import { authHandlers } from "./auth";
import { uploadHandlers } from "./upload";
import { dashboardHandlers } from "./dashboard";
import { chatHandlers } from "./chat";
import { billingHandlers } from "./billing";
import { apiPath } from "@/mocks/config";

// Export all MSW request handlers
export const handlers = [
  ...dashboardHandlers,
  ...subjectsHandlers,
  ...topicsHandlers,
  ...sourcesHandlers,
  ...flashcardsHandlers,
  ...testsHandlers,
  ...authHandlers,
  ...uploadHandlers,
  ...chatHandlers,
  ...billingHandlers,

  // Health check endpoint (using v1)
  http.get(apiPath("/health"), () => {
    return HttpResponse.json({
      success: true,
      data: {
        status: "ok",
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      version: "v1",
    });
  }),

  // 500 Error simulation endpoint
  http.get(apiPath("/error/500"), async () => {
    await delay(200);
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Interní chyba serveru",
          status: 500,
        },
        timestamp: new Date().toISOString(),
        version: "v1",
      },
      { status: 500 }
    );
  }),

  // Timeout simulation endpoint (30+ seconds)
  http.get(apiPath("/error/timeout"), async () => {
    await delay(35000); // 35 seconds - exceeds typical timeout
    return HttpResponse.json({
      success: true,
      data: "Mělo by vypršet časový limit",
      timestamp: new Date().toISOString(),
      version: "v1",
    });
  }),

  // Random error simulation (for testing error states)
  http.get(apiPath("/error/random"), async () => {
    await delay(200);

    const errorTypes = [404, 500, 503];
    const randomError =
      errorTypes[Math.floor(Math.random() * errorTypes.length)];

    const errorMessages = {
      404: {
        success: false,
        error: { code: "NOT_FOUND", message: "Nenalezeno", status: 404 },
      },
      500: {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Interní chyba serveru",
          status: 500,
        },
      },
      503: {
        success: false,
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Služba není dostupná",
          status: 503,
        },
      },
    };

    return HttpResponse.json(
      {
        ...errorMessages[randomError as keyof typeof errorMessages],
        timestamp: new Date().toISOString(),
        version: "v1",
      },
      { status: randomError }
    );
  }),

  // Simulate network delay (variable latency)
  http.get(apiPath("/error/slow"), async () => {
    const randomDelay = Math.floor(Math.random() * 5000) + 1000; // 1-6 seconds
    await delay(randomDelay);
    return HttpResponse.json({
      success: true,
      data: {
        message: "Pomalá odpověď",
        delay: randomDelay,
      },
      timestamp: new Date().toISOString(),
      version: "v1",
    });
  }),
];
