import { http, HttpResponse, delay } from "msw";

export const uploadHandlers = [
  // POST /api/upload - Upload file
  http.post("/api/upload", async ({ request }) => {
    // Simulate longer upload time
    await delay(2000);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return HttpResponse.json(
        { error: "Soubor je povinný", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return HttpResponse.json(
        {
          error: "Velikost souboru překračuje limit 50MB",
          code: "FILE_TOO_LARGE",
        },
        { status: 413 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      return HttpResponse.json(
        {
          error:
            "Neplatný typ souboru. Povoleny jsou pouze PDF, DOCX, DOC a TXT",
          code: "INVALID_FILE_TYPE",
        },
        { status: 415 }
      );
    }

    // Mock successful upload
    const mockFileUrl = `https://storage.example.com/files/${crypto.randomUUID()}.${file.name
      .split(".")
      .pop()}`;

    return HttpResponse.json({
      data: {
        fileUrl: mockFileUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
      message: "Soubor byl úspěšně nahrán",
    });
  }),

  // POST /api/materials/:materialId/process - Trigger AI processing
  http.post("/api/materials/:materialId/process", async ({ params }) => {
    await delay(1000);

    const { materialId } = params;

    // Simulate processing start
    return HttpResponse.json({
      data: {
        materialId,
        status: "processing",
        estimatedTime: 60, // seconds
      },
      message: "Zpracování bylo zahájeno",
    });
  }),

  // GET /api/materials/:materialId/process-status - Check processing status
  http.get("/api/materials/:materialId/process-status", async ({ params }) => {
    await delay(200);

    const { materialId } = params;

    // Randomly return different statuses for demo
    const statuses = ["processing", "completed", "failed"];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return HttpResponse.json({
      data: {
        materialId,
        status: randomStatus,
        progress: randomStatus === "processing" ? 65 : 100,
        flashcardsGenerated: randomStatus === "completed" ? 15 : 0,
        testsGenerated: randomStatus === "completed" ? 2 : 0,
      },
    });
  }),
];
