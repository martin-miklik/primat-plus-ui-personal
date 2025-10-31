import { http, HttpResponse, delay } from "msw";
import { mockSubjects, createMockSubject } from "@/mocks/fixtures/subjects";
import { Subject } from "@/lib/validations/subject";

// In-memory store for subjects (resets on page reload)
const subjects = [...mockSubjects];

export const subjectsHandlers = [
  // GET /api/subjects - List all subjects
  http.get("/api/subjects", async () => {
    await delay(300); // Simulate network delay

    return HttpResponse.json({
      data: subjects,
      total: subjects.length,
    });
  }),

  // GET /api/subjects/:id - Get single subject
  http.get("/api/subjects/:id", async ({ params }) => {
    await delay(200);

    const { id } = params;
    const subject = subjects.find((s) => s.id === id);

    if (!subject) {
      return HttpResponse.json(
        { error: "Předmět nenalezen", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: subject });
  }),

  // POST /api/subjects - Create new subject
  http.post("/api/subjects", async ({ request }) => {
    await delay(400);

    const body = (await request.json()) as Record<string, unknown>;

    // Validate required fields
    if (!body.name || typeof body.name !== "string") {
      return HttpResponse.json(
        { error: "Název předmětu je povinný", code: "VALIDATION_ERROR" },
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
      { data: newSubject, message: "Předmět byl úspěšně vytvořen" },
      { status: 201 }
    );
  }),

  // PATCH /api/subjects/:id - Update subject
  http.patch("/api/subjects/:id", async ({ params, request }) => {
    await delay(300);

    const { id } = params;
    const body = (await request.json()) as Record<string, unknown>;
    const subjectIndex = subjects.findIndex((s) => s.id === id);

    if (subjectIndex === -1) {
      return HttpResponse.json(
        { error: "Předmět nenalezen", code: "NOT_FOUND" },
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
      data: updatedSubject,
      message: "Předmět byl úspěšně aktualizován",
    });
  }),

  // DELETE /api/subjects/:id - Delete subject
  http.delete("/api/subjects/:id", async ({ params }) => {
    await delay(300);

    const { id } = params;
    const subjectIndex = subjects.findIndex((s) => s.id === id);

    if (subjectIndex === -1) {
      return HttpResponse.json(
        { error: "Předmět nenalezen", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    subjects.splice(subjectIndex, 1);

    return HttpResponse.json({
      message: "Předmět byl úspěšně smazán",
    });
  }),
];
