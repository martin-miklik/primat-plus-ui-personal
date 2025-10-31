"use client";

import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { ReactNode } from "react";
import { FieldError as RHFFieldError } from "react-hook-form";

interface FormFieldWrapperProps {
  label: string;
  htmlFor: string;
  error?: RHFFieldError;
  description?: string;
  children: ReactNode;
  required?: boolean;
}

/**
 * Reusable form field wrapper using the new Field API
 *
 * Provides consistent structure for:
 * - Label with optional required indicator
 * - Input/control element
 * - Optional description text
 * - Error message display
 *
 * @example
 * <FormFieldWrapper
 *   label="Email"
 *   htmlFor="email"
 *   error={errors.email}
 *   description="We'll never share your email"
 *   required
 * >
 *   <Input id="email" {...register("email")} />
 * </FormFieldWrapper>
 */
export function FormFieldWrapper({
  label,
  htmlFor,
  error,
  description,
  children,
  required,
}: FormFieldWrapperProps) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={htmlFor}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </FieldLabel>
      {children}
      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError>{error.message}</FieldError>}
    </Field>
  );
}
