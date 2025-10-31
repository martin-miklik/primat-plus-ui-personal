import type React from "react";

import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

import type { VariantProps } from "class-variance-authority";
import { JSX } from "react";

type Variant = Exclude<
  VariantProps<typeof typographyVariants>["variant"],
  null | undefined
>;

const jsxElements: Record<Variant, keyof JSX.IntrinsicElements> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  body: "p",
  blockquote: "blockquote",
  code: "code",
  lead: "p",
  large: "div",
  small: "small",
  muted: "p",
};

const typographyVariants = cva("text-left text-foreground ", {
  variants: {
    variant: {
      h1: "font-archivoBlack text-2xl font-extrabold tracking-tight md:text-4xl",
      h2: "font-archivoBlack text-xl font-semibold tracking-tight md:text-3xl",
      h3: "font-archivoBlack text-lg font-semibold tracking-tight md:text-xl",
      h4: "font-archivoBlack text-base font-semibold tracking-tight md:text-lg",
      body: "leading-5",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

type TypographyProps = VariantProps<typeof typographyVariants> & {
  children: React.ReactNode;
  className?: string;
};

export function Typography({
  variant = "body",
  className,
  children,
}: TypographyProps) {
  const Component = jsxElements[variant ?? "body"];

  return (
    <Component className={cn(typographyVariants({ variant, className }))}>
      {children}
    </Component>
  );
}
