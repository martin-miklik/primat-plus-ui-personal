import { http, HttpResponse, delay } from "msw";
import { mockSources, createMockSource } from "@/mocks/fixtures/sources";
import { apiPath } from "@/mocks/config";
import type { SourceType } from "@/lib/validations/source";

const sources = [...mockSources];

export const sourcesHandlers = [
  // GET /api/v1/sources - Get all sources
  http.get(apiPath("/sources"), async () => {
    await delay(250);

    return HttpResponse.json({
      success: true,
      data: sources,
      timestamp: new Date().toISOString(),
      version: "v1",
    });
  }),

  // GET /api/v1/sources/:id - Get single source
  http.get(apiPath("/sources/:id"), async ({ params }) => {
    await delay(200);

    const id = Number(params.id);
    const source = sources.find((s) => s.id === id);

    if (!source) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Zdroj nenalezen",
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
      data: source,
      timestamp: new Date().toISOString(),
      version: "v1",
    });
  }),

  // POST /api/v1/sources - Create new source (file upload or URL)
  http.post(apiPath("/sources"), async ({ request }) => {
    await delay(800); // Longer delay for file upload simulation

    const contentType = request.headers.get("content-type") || "";

    // Handle multipart/form-data (file upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const topicId = Number(formData.get("topicId"));

      if (!file) {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Soubor je povinný",
              status: 400,
            },
            timestamp: new Date().toISOString(),
            version: "v1",
          },
          { status: 400 }
        );
      }

      if (!topicId) {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Topic ID je povinné",
              status: 400,
            },
            timestamp: new Date().toISOString(),
            version: "v1",
          },
          { status: 400 }
        );
      }

      // Determine type from file extension
      const fileName = file.name;
      const extension = fileName.split(".").pop()?.toLowerCase();
      let type: "pdf" | "docx" | "doc" | "txt" = "txt";
      let mimeType = file.type;

      if (extension === "pdf") {
        type = "pdf";
        mimeType = "application/pdf";
      } else if (extension === "docx") {
        type = "docx";
        mimeType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      } else if (extension === "doc") {
        type = "doc";
        mimeType = "application/msword";
      } else if (extension === "txt") {
        type = "txt";
        mimeType = "text/plain";
      }

      const newSource = createMockSource({
        topicId,
        name: fileName,
        type,
        mimeType,
        filePath: `/uploads/${fileName}`,
        fileUrl: `http://localhost:3000/uploads/${fileName}`,
        url: null,
        fileSize: file.size,
        startTime: null,
        endTime: null,
      });

      sources.push(newSource);

      // Return response matching backend format
      return HttpResponse.json(
        {
          success: true,
          data: {
            id: newSource.id,
            jobId: newSource.jobId,
            channel: `source-processing-${newSource.jobId}`,
            status: newSource.status,
            name: newSource.name,
            type: newSource.type,
            mimeType: newSource.mimeType,
            fileSize: newSource.fileSize,
            filePath: newSource.filePath,
            url: newSource.url,
            topicId: newSource.topicId,
            startTime: newSource.startTime,
            endTime: newSource.endTime,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 201 }
      );
    }

    // Handle JSON (URL source)
    const body = (await request.json()) as Record<string, unknown>;

    if (!body.url || typeof body.url !== "string") {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "URL je povinná",
            status: 400,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 400 }
      );
    }

    const topicId = Number(body.topicId);
    if (!topicId) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Topic ID je povinné",
            status: 400,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 400 }
      );
    }

    // Determine if YouTube or webpage
    const url = body.url as string;
    const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
    const type = isYouTube ? "youtube" : "webpage";
    const mimeType = isYouTube ? "video/youtube" : "text/html";

    const newSource = createMockSource({
      topicId,
      name: (body.name as string) || (isYouTube ? "YouTube Video" : "Webpage"),
      type: type as SourceType,
      mimeType,
      filePath: null,
      fileUrl: null,
      url,
      fileSize: null,
      startTime: body.startTime ? Number(body.startTime) : null,
      endTime: body.endTime ? Number(body.endTime) : null,
    });

    sources.push(newSource);

    return HttpResponse.json(
      {
        success: true,
        data: {
          id: newSource.id,
          jobId: newSource.jobId,
          channel: `source-processing-${newSource.jobId}`,
          status: newSource.status,
          name: newSource.name,
          type: newSource.type,
          mimeType: newSource.mimeType,
          fileSize: newSource.fileSize,
          filePath: newSource.filePath,
          url: newSource.url,
          topicId: newSource.topicId,
          startTime: newSource.startTime,
          endTime: newSource.endTime,
        },
        timestamp: new Date().toISOString(),
        version: "v1",
      },
      { status: 201 }
    );
  }),

  // PUT /api/v1/sources/:id - Rename source
  http.put(apiPath("/sources/:id"), async ({ params, request }) => {
    await delay(300);

    const id = Number(params.id);
    const body = (await request.json()) as Record<string, unknown>;
    const sourceIndex = sources.findIndex((s) => s.id === id);

    if (sourceIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Zdroj nenalezen",
            status: 404,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 404 }
      );
    }

    if (!body.name || typeof body.name !== "string") {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Název je povinný",
            status: 400,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 400 }
      );
    }

    sources[sourceIndex] = {
      ...sources[sourceIndex],
      name: body.name as string,
      updatedAt: new Date().toISOString(),
    };

    // Backend returns only id and name for rename
    return HttpResponse.json({
      success: true,
      data: {
        id: sources[sourceIndex].id,
        name: sources[sourceIndex].name,
      },
      timestamp: new Date().toISOString(),
      version: "v1",
    });
  }),

  // DELETE /api/v1/sources/:id - Delete source
  http.delete(apiPath("/sources/:id"), async ({ params }) => {
    await delay(300);

    const id = Number(params.id);
    const sourceIndex = sources.findIndex((s) => s.id === id);

    if (sourceIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Zdroj nenalezen",
            status: 404,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 404 }
      );
    }

    sources.splice(sourceIndex, 1);

    return HttpResponse.json({
      success: true,
      data: true,
      timestamp: new Date().toISOString(),
      version: "v1",
    });
  }),
];

