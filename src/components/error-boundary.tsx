"use client";

import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryWithTranslationsProps {
  children: ReactNode;
  fallback?: ReactNode;
  translations: {
    title: string;
    defaultMessage: string;
    tryAgain: string;
    reloadPage: string;
  };
}

class ErrorBoundaryClass extends Component<
  ErrorBoundaryWithTranslationsProps,
  State
> {
  constructor(props: ErrorBoundaryWithTranslationsProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service (Sentry)
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // You can also log to Sentry here
    if (typeof window !== "undefined" && "Sentry" in window) {
      const Sentry = (
        window as typeof window & {
          Sentry?: {
            captureException: (error: Error, options?: unknown) => void;
          };
        }
      ).Sentry;
      Sentry?.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { translations } = this.props;

      return (
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold">{translations.title}</h2>
            <p className="text-muted-foreground mx-auto max-w-md">
              {this.state.error?.message || translations.defaultMessage}
            </p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() =>
                  this.setState({ hasError: false, error: undefined })
                }
                variant="outline"
              >
                {translations.tryAgain}
              </Button>
              <Button onClick={() => window.location.reload()}>
                {translations.reloadPage}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to provide translations
export function ErrorBoundary({ children, fallback }: Props) {
  const t = useTranslations("errorBoundary");

  const translations = {
    title: t("title"),
    defaultMessage: t("defaultMessage"),
    tryAgain: t("tryAgain"),
    reloadPage: t("reloadPage"),
  };

  return (
    <ErrorBoundaryClass translations={translations} fallback={fallback}>
      {children}
    </ErrorBoundaryClass>
  );
}
