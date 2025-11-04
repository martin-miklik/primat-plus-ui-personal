import { http, HttpResponse, delay } from "msw";
import { mockSubjects, createMockSubject } from "@/mocks/fixtures/subjects";
import { Subject } from "@/lib/validations/subject";
import { apiPath } from "@/mocks/config";

// In-memory store for subjects (resets on page reload)
const subjects = [...mockSubjects];

export const subjectsHandlers = [
  // GET /api/v1/subjects - List all subjects
  http.get(apiPath("/subjects"), async () => {
    await delay(300); // Simulate network delay

    return HttpResponse.json({
      success: true,
      data: subjects,
      timestamp: new Date().toISOString(),
      version: "v1",
    });
  }),

  // GET /api/v1/subjects/:id - Get single subject
  http.get(apiPath("/subjects/:id"), async ({ params }) => {
    await delay(200);

    const id = Number(params.id);
    const subject = subjects.find((s) => s.id === id);

    if (!subject) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Předmět nenalezen",
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
      data: subject,
      timestamp: new Date().toISOString(),
      version: "v1",
    });
  }),

  // POST /api/v1/subjects - Create new subject
  http.post(apiPath("/subjects"), async ({ request }) => {
    await delay(400);

    const body = (await request.json()) as Record<string, unknown>;

    // Validate required fields
    if (!body.name || typeof body.name !== "string") {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Název předmětu je povinný",
            status: 400,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 400 }
      );
    }

    const newSubject = createMockSubject({
      name: body.name as string,
      description: body.description as string | undefined,
      color: (body.color as string | undefined) || "#6B7280",
      icon: body.icon as string | undefined,
    });

    subjects.push(newSubject);

    return HttpResponse.json(
      {
        success: true,
        data: newSubject,
        timestamp: new Date().toISOString(),
        version: "v1",
      },
      { status: 201 }
    );
  }),

  // PATCH /api/v1/subjects/:id - Update subject (not used by backend, but keeping for compatibility)
  http.patch(apiPath("/subjects/:id"), async ({ params, request }) => {
    await delay(300);

    const id = Number(params.id);
    const body = (await request.json()) as Record<string, unknown>;
    const subjectIndex = subjects.findIndex((s) => s.id === id);

    if (subjectIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Předmět nenalezen",
            status: 404,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 404 }
      );
    }

    const updatedSubject: Subject = {
      ...subjects[subjectIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    subjects[subjectIndex] = updatedSubject;

    return HttpResponse.json({
      success: true,
      data: updatedSubject,
      timestamp: new Date().toISOString(),
      version: "v1",
    });
  }),

  // PUT /api/v1/subjects/:id - Update/Rename subject (backend uses this)
  http.put(apiPath("/subjects/:id"), async ({ params, request }) => {
    await delay(300);

    const id = Number(params.id);
    const body = (await request.json()) as Record<string, unknown>;
    const subjectIndex = subjects.findIndex((s) => s.id === id);

    if (subjectIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Předmět nenalezen",
            status: 404,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 404 }
      );
    }

    const updatedSubject: Subject = {
      ...subjects[subjectIndex],
      name: (body.name as string) || subjects[subjectIndex].name,
      updatedAt: new Date().toISOString(),
    };

    subjects[subjectIndex] = updatedSubject;

    return HttpResponse.json({
      success: true,
      data: updatedSubject,
      timestamp: new Date().toISOString(),
      version: "v1",
    });
  }),

  // DELETE /api/v1/subjects/:id - Delete subject
  http.delete(apiPath("/subjects/:id"), async ({ params }) => {
    await delay(300);

    const id = Number(params.id);
    const subjectIndex = subjects.findIndex((s) => s.id === id);

    if (subjectIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Předmět nenalezen",
            status: 404,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 404 }
      );
    }

    subjects.splice(subjectIndex, 1);

    return HttpResponse.json({
      success: true,
      data: true,
      timestamp: new Date().toISOString(),
      version: "v1",
    });
  }),
];
