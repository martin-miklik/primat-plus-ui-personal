"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Field, FieldLabel } from "@/components/ui/field";

// Educational-themed emojis
const EMOJIS = [
  { name: "Mathematics", emoji: "📐" },
  { name: "Physics", emoji: "⚛️" },
  { name: "Computer Science", emoji: "💻" },
  { name: "Biology", emoji: "🧬" },
  { name: "Chemistry", emoji: "⚗️" },
  { name: "History", emoji: "📜" },
  { name: "Literature", emoji: "📚" },
  { name: "Economics", emoji: "💰" },
  { name: "Geography", emoji: "🌍" },
  { name: "Art", emoji: "🎨" },
  { name: "Music", emoji: "🎵" },
  { name: "Sports", emoji: "⚽" },
  { name: "Language", emoji: "🗣️" },
  { name: "Philosophy", emoji: "🤔" },
  { name: "Psychology", emoji: "🧠" },
  { name: "Law", emoji: "⚖️" },
  { name: "Medicine", emoji: "⚕️" },
  { name: "Engineering", emoji: "⚙️" },
  { name: "Astronomy", emoji: "🔭" },
  { name: "Rocket Science", emoji: "🚀" },
  { name: "Book", emoji: "📖" },
  { name: "Pencil", emoji: "✏️" },
  { name: "Graduation", emoji: "🎓" },
  { name: "Light Bulb", emoji: "💡" },
] as const;

interface EmojiPickerProps {
  value?: string;
  onChange: (emoji: string) => void;
  label?: string;
  id?: string;
}

export function EmojiPicker({ value, onChange, label, id }: EmojiPickerProps) {
  return (
    <Field>
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      <div
        className="grid grid-cols-8 gap-2"
        role="radiogroup"
        aria-label="Emoji selection"
      >
        {EMOJIS.map((item) => (
          <button
            key={item.emoji}
            type="button"
            role="radio"
            aria-checked={value === item.emoji}
            aria-label={item.name}
            onClick={() => onChange(item.emoji)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-md border-2 text-2xl transition-all hover:scale-110 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              value === item.emoji
                ? "border-primary bg-accent scale-110"
                : "border-transparent"
            )}
            title={item.name}
          >
            {item.emoji}
          </button>
        ))}
      </div>
    </Field>
  );
}

// Export the emojis array for use in other components
export { EMOJIS };
