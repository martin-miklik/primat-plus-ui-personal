import { http, HttpResponse, delay } from "msw";
import { subjectsHandlers } from "./subjects";
import { topicsHandlers } from "./topics";
import { materialsHandlers } from "./materials";
import { flashcardsHandlers } from "./flashcards";
import { testsHandlers } from "./tests";
import { authHandlers } from "./auth";
import { uploadHandlers } from "./upload";
import { dashboardHandlers } from "./dashboard";

// Export all MSW request handlers
export const handlers = [
  ...dashboardHandlers,
  ...subjectsHandlers,
  ...topicsHandlers,
  ...materialsHandlers,
  ...flashcardsHandlers,
  ...testsHandlers,
  ...authHandlers,
  ...uploadHandlers,

  // Health check endpoint
  http.get("/api/health", () => {
    return HttpResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  }),

  // 500 Error simulation endpoint
  http.get("/api/error/500", async () => {
    await delay(200);
    return HttpResponse.json(
      {
        error: "Interní chyba serveru",
        message: "Na serveru se něco pokazilo",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }),

  // Timeout simulation endpoint (30+ seconds)
  http.get("/api/error/timeout", async () => {
    await delay(35000); // 35 seconds - exceeds typical timeout
    return HttpResponse.json({ data: "Mělo by vypršet časový limit" });
  }),

  // Random error simulation (for testing error states)
  http.get("/api/error/random", async () => {
    await delay(200);

    const errorTypes = [404, 500, 503];
    const randomError =
      errorTypes[Math.floor(Math.random() * errorTypes.length)];

    const errorMessages = {
      404: { error: "Nenalezeno", code: "NOT_FOUND" },
      500: { error: "Interní chyba serveru", code: "INTERNAL_ERROR" },
      503: { error: "Služba není dostupná", code: "SERVICE_UNAVAILABLE" },
    };

    return HttpResponse.json(
      errorMessages[randomError as keyof typeof errorMessages],
      { status: randomError }
    );
  }),

  // Simulate network delay (variable latency)
  http.get("/api/error/slow", async () => {
    const randomDelay = Math.floor(Math.random() * 5000) + 1000; // 1-6 seconds
    await delay(randomDelay);
    return HttpResponse.json({
      data: "Pomalá odpověď",
      delay: randomDelay,
    });
  }),
];
