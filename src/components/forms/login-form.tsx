"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { useState } from "react";

interface LoginFormProps {
  onSubmit: (data: LoginInput) => Promise<void>;
}

/**
 * Login Form Component
 *
 * Features:
 * - Name and password validation with Zod
 * - Inline error messages via Field API
 * - Loading state during submission
 * - Submit on Enter (native form behavior)
 * - Accessible with ARIA labels
 * - Session persistence enabled by default (localStorage)
 *
 * @example
 * <LoginForm onSubmit={async (data) => {
 *   await loginMutation.mutateAsync(data);
 * }} />
 */
export function LoginForm({ onSubmit }: LoginFormProps) {
  const t = useTranslations("auth.login");
  const tv = useTranslations("validation");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      name: "",
      password: "",
    },
  });

  const handleSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="name">
            {t("name")} <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder={t("namePlaceholder")}
            aria-invalid={!!form.formState.errors.name}
            disabled={isSubmitting}
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <FieldError>
              {tv(form.formState.errors.name.message ?? "nameRequired")}
            </FieldError>
          )}
        </Field>

        <Field data-invalid={!!form.formState.errors.password}>
          <FieldLabel htmlFor="password">
            {t("password")} <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            aria-invalid={!!form.formState.errors.password}
            disabled={isSubmitting}
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <FieldError>
              {tv(form.formState.errors.password.message ?? "passwordMin")}
            </FieldError>
          )}
        </Field>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t("signingIn") : t("signIn")}
        </Button>
      </FieldGroup>
    </form>
  );
}
