import { http, HttpResponse, delay } from "msw";
import { mockMaterials, createMockMaterial } from "@/mocks/fixtures/materials";
import { Material } from "@/lib/validations/material";

const materials = [...mockMaterials];

export const materialsHandlers = [
  // GET /api/topics/:topicId/materials - List materials for a topic
  http.get("/api/topics/:topicId/materials", async ({ params }) => {
    await delay(250);

    const { topicId } = params;
    const topicMaterials = materials.filter((m) => m.topicId === topicId);

    return HttpResponse.json({
      data: topicMaterials,
      total: topicMaterials.length,
    });
  }),

  // GET /api/materials/:id - Get single material
  http.get("/api/materials/:id", async ({ params }) => {
    await delay(200);

    const { id } = params;
    const material = materials.find((m) => m.id === id);

    if (!material) {
      return HttpResponse.json(
        { error: "Materiál nenalezen", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: material });
  }),

  // POST /api/topics/:topicId/materials - Create new material
  http.post("/api/topics/:topicId/materials", async ({ params, request }) => {
    await delay(400);

    const { topicId } = params;
    const body = (await request.json()) as Record<string, unknown>;

    if (!body.name || typeof body.name !== "string") {
      return HttpResponse.json(
        { error: "Název materiálu je povinný", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const newMaterial = createMockMaterial({
      topicId: topicId as string,
      name: body.name,
      type: (body.type as "pdf" | "docx" | "doc" | "txt" | "note") || "note",
      fileUrl: body.fileUrl as string | undefined,
      content: body.content as string | undefined,
      fileSize: body.fileSize as number | undefined,
    });

    materials.push(newMaterial);

    return HttpResponse.json(
      { data: newMaterial, message: "Materiál byl úspěšně vytvořen" },
      { status: 201 }
    );
  }),

  // PATCH /api/materials/:id - Update material
  http.patch("/api/materials/:id", async ({ params, request }) => {
    await delay(300);

    const { id } = params;
    const body = (await request.json()) as Record<string, unknown>;
    const materialIndex = materials.findIndex((m) => m.id === id);

    if (materialIndex === -1) {
      return HttpResponse.json(
        { error: "Materiál nenalezen", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const updatedMaterial: Material = {
      ...materials[materialIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    materials[materialIndex] = updatedMaterial;

    return HttpResponse.json({
      data: updatedMaterial,
      message: "Materiál byl úspěšně aktualizován",
    });
  }),

  // DELETE /api/materials/:id - Delete material
  http.delete("/api/materials/:id", async ({ params }) => {
    await delay(300);

    const { id } = params;
    const materialIndex = materials.findIndex((m) => m.id === id);

    if (materialIndex === -1) {
      return HttpResponse.json(
        { error: "Materiál nenalezen", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    materials.splice(materialIndex, 1);

    return HttpResponse.json({
      message: "Materiál byl úspěšně smazán",
    });
  }),
];
