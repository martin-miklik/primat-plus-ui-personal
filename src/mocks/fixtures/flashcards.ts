import { Flashcard } from "@/lib/validations/flashcard";

export const mockFlashcards: Flashcard[] = [
  // Introduction to Limits flashcards
  {
    id: "1",
    sourceId: 1,
    frontSide: "Limita funkce",
    backSide:
      "Hodnota, ke které se funkce blíží, když se vstupní hodnota přibližuje určité hodnotě.",
    nextRepetitionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    sourceId: 1,
    frontSide: "lim(x→0) sin(x)/x",
    backSide: "Rovno 1",
    nextRepetitionDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // Due for review
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Derivatives flashcards
  {
    id: "3",
    sourceId: 1,
    frontSide: "Derivace x²",
    backSide: "2x",
    nextRepetitionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    sourceId: 1,
    frontSide: "Pravidlo řetězení",
    backSide:
      "d/dx[f(g(x))] = f'(g(x)) × g'(x). Derivace složené funkce.",
    nextRepetitionDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // Due for review
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Matrix Operations flashcards
  {
    id: "5",
    sourceId: 1,
    frontSide: "Jednotková matice",
    backSide: "Čtvercová matice s 1 na diagonále a 0 jinde.",
    nextRepetitionDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Newton's Laws flashcards
  {
    id: "6",
    sourceId: 1,
    frontSide: "Newtonův první zákon",
    backSide:
      "Těleso v klidu zůstane v klidu a těleso v pohybu zůstane v pohybu stejnou rychlostí a směrem, pokud na něj nepůsobí síla.",
    nextRepetitionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Data Structures flashcards
  {
    id: "7",
    sourceId: 1,
    frontSide: "Časová složitost přístupu k prvku pole",
    backSide: "O(1) - konstantní čas",
    nextRepetitionDate: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // Due for review
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "8",
    sourceId: 1,
    frontSide: "Spojový seznam",
    backSide:
      "Lineární datová struktura, kde jsou prvky uloženy v uzlech, každý obsahuje data a odkaz na další uzel.",
    nextRepetitionDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "9",
    sourceId: 1,
    frontSide: "Rekurze",
    backSide: "Funkce, která volá sama sebe, dokud není splněna základní podmínka.",
    nextRepetitionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "10",
    sourceId: 1,
    frontSide: "Big O notace",
    backSide: "Matematický zápis popisující složitost algoritmu v nejhorším případě.",
    nextRepetitionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function getMockFlashcardById(id: string): Flashcard | undefined {
  return mockFlashcards.find((card) => card.id === id);
}

export function getMockFlashcardsBySourceId(sourceId: number): Flashcard[] {
  return mockFlashcards.filter((card) => card.sourceId === sourceId);
}
