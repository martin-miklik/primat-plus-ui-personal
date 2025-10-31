"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Field, FieldLabel } from "@/components/ui/field";

// Predefined color palette matching the brand and educational themes
const COLORS = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Orange", value: "#F59E0B" },
  { name: "Red", value: "#EF4444" },
  { name: "Pink", value: "#EC4899" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Violet", value: "#A855F7" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Gray", value: "#6B7280" },
] as const;

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  label?: string;
  id?: string;
}

export function ColorPicker({ value, onChange, label, id }: ColorPickerProps) {
  return (
    <Field>
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      <div
        className="grid grid-cols-6 gap-2"
        role="radiogroup"
        aria-label="Color selection"
      >
        {COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            role="radio"
            aria-checked={value === color.value}
            aria-label={color.name}
            onClick={() => onChange(color.value)}
            className={cn(
              "relative h-10 w-10 rounded-md border-2 transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              value === color.value
                ? "border-foreground scale-110"
                : "border-transparent"
            )}
            style={{ backgroundColor: color.value }}
          >
            {value === color.value && (
              <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-md" />
            )}
            <span className="sr-only">{color.name}</span>
          </button>
        ))}
      </div>
    </Field>
  );
}

// Export the colors array for use in other components
export { COLORS };
