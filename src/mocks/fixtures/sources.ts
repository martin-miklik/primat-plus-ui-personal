import { Source } from "@/lib/validations/source";

export const mockSources: Source[] = [
  // Math - Kvadratické rovnice (Topic ID: 1)
  {
    id: 1,
    topicId: 1,
    name: "Introduction to Quadratic Equations",
    type: "pdf",
    mimeType: "application/pdf",
    filePath: "/uploads/quadratic.pdf",
    fileUrl: "http://localhost:3000/uploads/quadratic.pdf",
    url: null,
    fileSize: 2048000,
    status: "processed",
    jobId: "job-1234567890-abc123",
    startTime: null,
    endTime: null,
    context: `# Kvadratické rovnice

## Úvod do kvadratických rovnic

Kvadratická rovnice je algebraická rovnice druhého stupně, která má obecný tvar:

\`ax² + bx + c = 0\`

kde **a ≠ 0**, a koeficienty a, b, c jsou reálná čísla.

### Základní pojmy

- **Diskriminant**: Hodnota D = b² - 4ac určuje počet a typ řešení
- **Kořeny rovnice**: Hodnoty x, které splňují rovnici
- **Parabola**: Grafické znázornění kvadratické funkce

## Metody řešení

### 1. Rozklad na součin

Pokud lze levou stranu rozložit na součin:

\`\`\`
(x - x₁)(x - x₂) = 0
\`\`\`

### 2. Kvadratický vzorec

Univerzální vzorec pro řešení:

\`x = (-b ± √(b² - 4ac)) / 2a\`

### 3. Doplnění na čtverec

Úprava rovnice do tvaru:

\`(x + p)² = q\`

## Typy řešení podle diskriminantu

1. **D > 0**: Dva různé reálné kořeny
2. **D = 0**: Jeden dvojnásobný reálný kořen
3. **D < 0**: Dva komplexně sdružené kořeny

> **Důležité**: Před použitím vzorce je třeba ověřit, že a ≠ 0.

## Příklady použití

- Fyzika: Rovnoměrně zrychlený pohyb
- Geometrie: Výpočet obsahu a obvodu
- Ekonomie: Optimalizační úlohy

---

*Tento materiál byl zpracován pro výukové účely.*`,
    contextLength: 5000,
    errorMessage: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 0,
    testsCount: 0,
  },
  {
    id: 2,
    topicId: 1,
    name: "Solving Quadratic Equations",
    type: "docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    filePath: "/uploads/solving-quadratic.docx",
    fileUrl: "http://localhost:3000/uploads/solving-quadratic.docx",
    url: null,
    fileSize: 1536000,
    status: "processed",
    jobId: "job-1234567891-abc124",
    startTime: null,
    endTime: null,
    context: "Methods for solving quadratic equations include...",
    contextLength: 4200,
    errorMessage: null,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 0,
    testsCount: 0,
  },
  // Math - Derivace (Topic ID: 2)
  {
    id: 3,
    topicId: 2,
    name: "Derivatives Introduction",
    type: "pdf",
    mimeType: "application/pdf",
    filePath: "/uploads/derivatives.pdf",
    fileUrl: "http://localhost:3000/uploads/derivatives.pdf",
    url: null,
    fileSize: 3072000,
    status: "processed",
    jobId: "job-1234567892-abc125",
    startTime: null,
    endTime: null,
    context: "A derivative measures how a function changes...",
    contextLength: 6800,
    errorMessage: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 0,
    testsCount: 0,
  },
  // Physics - Newton's Laws (Topic ID: 3)
  {
    id: 4,
    topicId: 3,
    name: "Newton's Laws of Motion",
    type: "note",
    mimeType: "text/plain",
    filePath: null,
    fileUrl: null,
    url: null,
    fileSize: null,
    status: "processed",
    jobId: null,
    startTime: null,
    endTime: null,
    context: "Newton's three laws of motion describe the relationship...",
    contextLength: 2500,
    errorMessage: null,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 0,
    testsCount: 0,
  },
  {
    id: 5,
    topicId: 3,
    name: "Force and Motion Analysis",
    type: "pdf",
    mimeType: "application/pdf",
    filePath: "/uploads/force-motion.pdf",
    fileUrl: "http://localhost:3000/uploads/force-motion.pdf",
    url: null,
    fileSize: 2560000,
    status: "processed",
    jobId: "job-1234567893-abc126",
    startTime: null,
    endTime: null,
    context: "Understanding force and motion through practical examples...",
    contextLength: 5500,
    errorMessage: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 0,
    testsCount: 0,
  },
  // CS - Sorting Algorithms (Topic ID: 5)
  {
    id: 6,
    topicId: 5,
    name: "Sorting Algorithms Overview",
    type: "txt",
    mimeType: "text/plain",
    filePath: "/uploads/sorting.txt",
    fileUrl: "http://localhost:3000/uploads/sorting.txt",
    url: null,
    fileSize: 512000,
    status: "processed",
    jobId: "job-1234567894-abc127",
    startTime: null,
    endTime: null,
    context: `# Třídící algoritmy

## Úvod

Třídící algoritmy jsou fundamentální součástí informatiky a používají se k uspořádání dat podle určitého klíče.

### Časová složitost

Při hodnocení algoritmů rozlišujeme:

- **Best case**: Nejlepší možný případ
- **Average case**: Průměrný případ
- **Worst case**: Nejhorší možný případ

## Základní třídící algoritmy

### 1. Bubble Sort

Jednoduchý algoritmus, který opakovaně prochází seznam a porovnává *sousední* prvky.

\`\`\`python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
\`\`\`

**Složitost**: O(n²)

### 2. Quick Sort

Efektivní algoritmus založený na principu "rozděl a panuj".

**Postup**:

1. Vyber pivot
2. Rozděl pole na dvě části
3. Rekurzivně aplikuj na obě části

**Složitost**: O(n log n) průměrně, O(n²) nejhůře

### 3. Merge Sort

Stabilní třídící algoritmus s garantovanou složitostí O(n log n).

> Merge Sort je často preferován pro velké datové soubory, kde je důležitá stabilita.

## Porovnání algoritmů

| Algoritmus | Časová složitost | Paměťová složitost | Stabilní |
|------------|------------------|-------------------|----------|
| Bubble Sort | O(n²) | O(1) | Ano |
| Quick Sort | O(n log n) | O(log n) | Ne |
| Merge Sort | O(n log n) | O(n) | Ano |

## Kdy použít který algoritmus?

- **Malá data**: Insertion Sort
- **Velká data**: Quick Sort nebo Merge Sort
- **Potřeba stability**: Merge Sort
- **Omezená paměť**: Heap Sort

---

*Poznámka: Výběr správného algoritmu závisí na konkrétním použití.*`,
    contextLength: 3200,
    errorMessage: null,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 0,
    testsCount: 0,
  },
  // CS - Data Structures (Topic ID: 6)
  {
    id: 7,
    topicId: 6,
    name: "Trees and Graphs",
    type: "pdf",
    mimeType: "application/pdf",
    filePath: "/uploads/trees-graphs.pdf",
    fileUrl: "http://localhost:3000/uploads/trees-graphs.pdf",
    url: null,
    fileSize: 4096000,
    status: "processing",
    jobId: "job-1234567895-abc128",
    startTime: null,
    endTime: null,
    context: null,
    contextLength: null,
    errorMessage: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 0,
    testsCount: 0,
  },
  // YouTube source example
  {
    id: 8,
    topicId: 5,
    name: "Sorting Algorithms Explained (Video)",
    type: "youtube",
    mimeType: "video/youtube",
    filePath: null,
    fileUrl: null,
    url: "https://www.youtube.com/watch?v=example123",
    fileSize: null,
    status: "processed",
    jobId: "job-1234567896-abc129",
    startTime: 0,
    endTime: 600,
    context: "Video transcript: Introduction to sorting algorithms...",
    contextLength: 8500,
    errorMessage: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 0,
    testsCount: 0,
  },
];

// Counter for generating new IDs
let nextSourceId = 9;

// Helper to get a source by ID
export function getMockSourceById(id: number): Source | undefined {
  return mockSources.find((source) => source.id === id);
}

// Helper to get sources by topic ID
export function getMockSourcesByTopicId(topicId: number): Source[] {
  return mockSources.filter((source) => source.topicId === topicId);
}

// Helper to create a new mock source
export function createMockSource(
  data: Omit<
    Source,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "status"
    | "jobId"
    | "context"
    | "contextLength"
    | "errorMessage"
    | "flashcardsCount"
    | "testsCount"
  >
): Source {
  return {
    id: nextSourceId++,
    ...data,
    status: "uploaded",
    jobId: `job-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    context: null,
    contextLength: null,
    errorMessage: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    flashcardsCount: 0,
    testsCount: 0,
  };
}
