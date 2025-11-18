/**
 * Job Status Indicator Component
 * 
 * Generic status display for any async job (upload, flashcard, test, chat).
 * Shows appropriate icon, message, and progress bar based on job state.
 * 
 * Based on docs/websocket-states-spec.md status messages.
 */

"use client";

import { motion } from "framer-motion";
import {
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  BookOpen,
  MessageSquare,
  FileBarChart,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ProcessType, JobStatus } from "@/types/websocket-events";

export interface JobStatusIndicatorProps {
  /** Type of process (upload, flashcards, test, chat) */
  process: ProcessType;
  
  /** Current job status */
  status: JobStatus;
  
  /** Progress percentage (0-100) */
  progress?: number;
  
  /** Error message if status is error */
  error?: string;
  
  /** Custom status message override */
  message?: string;
  
  /** Show progress bar */
  showProgress?: boolean;
  
  /** Size variant */
  size?: "sm" | "md" | "lg";
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get status configuration (icon, color, default message)
 */
function getStatusConfig(
  process: ProcessType,
  status: JobStatus
): {
  icon: typeof Sparkles;
  color: string;
  bgColor: string;
  message: string;
  animated: boolean;
} {
  // Process-specific configurations
  const processConfig = {
    upload: {
      icon: FileText,
      messages: {
        pending: "Připravujeme nahrání...",
        started: "Začínáme...",
        processing: "Zpracováváme soubor...",
        complete: "Hotovo! 🎉",
        error: "Něco se pokazilo",
      },
    },
    flashcards: {
      icon: BookOpen,
      messages: {
        pending: "Připravujeme kartičky...",
        started: "Připravujeme kartičky...",
        processing: "AI tvoří otázky...",
        complete: "Kartičky jsou ready! 🎴",
        error: "Nepodařilo se vytvořit kartičky",
      },
    },
    test: {
      icon: FileBarChart,
      messages: {
        pending: "Připravujeme test...",
        started: "Připravujeme test...",
        processing: "AI píše otázky...",
        complete: "Test je připraven! 📝",
        error: "Nepodařilo se vytvořit test",
      },
    },
    chat: {
      icon: MessageSquare,
      messages: {
        pending: "Připravujeme odpověď...",
        started: "AI přemýšlí...",
        processing: "AI přemýšlí...",
        complete: "Odpověď hotova",
        error: "Omlouváme se, zkuste to znovu",
      },
    },
  };

  const config = processConfig[process];

  // Status-specific styling
  switch (status) {
    case "complete":
      return {
        icon: CheckCircle2,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        message: config.messages.complete,
        animated: false,
      };

    case "error":
      return {
        icon: AlertCircle,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        message: config.messages.error,
        animated: false,
      };

    case "started":
    case "processing":
      return {
        icon: Sparkles,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        message:
          status === "started"
            ? config.messages.started
            : config.messages.processing,
        animated: true,
      };

    case "pending":
    default:
      return {
        icon: Loader2,
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        message: config.messages.pending,
        animated: true,
      };
  }
}

/**
 * Generic job status indicator component
 * 
 * @example
 * ```tsx
 * <JobStatusIndicator
 *   process="flashcards"
 *   status="processing"
 *   progress={60}
 *   showProgress
 * />
 * ```
 */
export function JobStatusIndicator({
  process,
  status,
  progress = 0,
  error,
  message,
  showProgress = true,
  size = "md",
  className,
}: JobStatusIndicatorProps) {
  const config = getStatusConfig(process, status);
  const Icon = config.icon;

  // Size configurations
  const sizeClasses = {
    sm: {
      container: "p-3",
      icon: "h-5 w-5",
      title: "text-sm",
      description: "text-xs",
    },
    md: {
      container: "p-4",
      icon: "h-6 w-6",
      title: "text-base",
      description: "text-sm",
    },
    lg: {
      container: "p-6",
      icon: "h-8 w-8",
      title: "text-lg",
      description: "text-base",
    },
  };

  const sizeClass = sizeClasses[size];
  const displayMessage = message || error || config.message;

  return (
    <div
      className={cn(
        "rounded-lg border",
        config.bgColor,
        sizeClass.container,
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        {config.animated ? (
          <motion.div
            animate={{
              rotate: status === "pending" ? 360 : 0,
              scale: status === "processing" ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: status === "pending" ? 1 : 0.5,
              repeat: status === "processing" ? Infinity : 0,
              ease: "linear",
            }}
          >
            <Icon className={cn(sizeClass.icon, config.color)} />
          </motion.div>
        ) : (
          <Icon className={cn(sizeClass.icon, config.color)} />
        )}

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className={cn("font-medium", config.color, sizeClass.title)}>
            {displayMessage}
          </p>

          {/* Progress Bar */}
          {showProgress && status !== "complete" && status !== "error" && (
            <div className="mt-2 space-y-1">
              <Progress value={progress} className="h-1.5" />
              <p
                className={cn(
                  "text-right text-muted-foreground",
                  sizeClass.description
                )}
              >
                {Math.round(progress)}%
              </p>
            </div>
          )}

          {/* Error details */}
          {status === "error" && error && (
            <p
              className={cn(
                "mt-1 text-muted-foreground",
                sizeClass.description
              )}
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact badge variant for inline status display
 */
export function JobStatusBadge({
  process,
  status,
  message,
  className,
}: Pick<JobStatusIndicatorProps, "process" | "status" | "message" | "className">) {
  const config = getStatusConfig(process, status);
  const Icon = config.icon;
  const displayMessage = message || config.message;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1",
        config.bgColor,
        className
      )}
    >
      {config.animated ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Icon className={cn("h-3 w-3", config.color)} />
        </motion.div>
      ) : (
        <Icon className={cn("h-3 w-3", config.color)} />
      )}
      <span className={cn("text-xs font-medium", config.color)}>
        {displayMessage}
      </span>
    </div>
  );
}





