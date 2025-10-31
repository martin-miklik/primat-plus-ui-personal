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
import { Checkbox } from "@/components/ui/checkbox";
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
 * - Email and password validation with Zod
 * - Remember me checkbox
 * - Inline error messages via Field API
 * - Loading state during submission
 * - Submit on Enter (native form behavior)
 * - Accessible with ARIA labels
 *
 * @example
 * <LoginForm onSubmit={async (data) => {
 *   await loginMutation.mutateAsync(data);
 * }} />
 */
export function LoginForm({ onSubmit }: LoginFormProps) {
  const t = useTranslations("auth.login");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
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
        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="email">
            {t("email")} <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            aria-invalid={!!form.formState.errors.email}
            disabled={isSubmitting}
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <FieldError>{form.formState.errors.email.message}</FieldError>
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
            <FieldError>{form.formState.errors.password.message}</FieldError>
          )}
        </Field>

        <Field orientation="horizontal">
          <Checkbox
            id="remember"
            disabled={isSubmitting}
            {...form.register("remember")}
          />
          <FieldLabel htmlFor="remember" className="font-normal">
            {t("rememberMe")}
          </FieldLabel>
        </Field>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t("signingIn") : t("signIn")}
        </Button>
      </FieldGroup>
    </form>
  );
}
