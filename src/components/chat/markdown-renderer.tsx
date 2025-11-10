"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Code block component with copy functionality
 */
function CodeBlock({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const language = className?.replace("language-", "") || "text";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      <div className="flex items-center justify-between bg-muted px-4 py-2 rounded-t-lg border border-b-0">
        <span className="text-xs font-mono text-muted-foreground uppercase">
          {language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              <span className="text-xs">Zkopírováno</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              <span className="text-xs">Kopírovat</span>
            </>
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 bg-muted rounded-b-lg border">
        <code className={cn("text-sm font-mono", className)}>{children}</code>
      </pre>
    </div>
  );
}

/**
 * Markdown renderer with custom components and styling
 */
export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code blocks
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeContent = String(children).replace(/\n$/, "");

            return !inline && match ? (
              <CodeBlock className={className}>
                {codeContent}
              </CodeBlock>
            ) : (
              <code
                className={cn(
                  "bg-muted px-1.5 py-0.5 rounded text-sm font-mono",
                  className
                )}
                {...props}
              >
                {children}
              </code>
            );
          },

          // Links
          a({ children, href, ...props }) {
            const isExternal = href?.startsWith("http");
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="text-primary hover:underline inline-flex items-center gap-1"
                {...props}
              >
                {children}
                {isExternal && <ExternalLink className="h-3 w-3" />}
              </a>
            );
          },

          // Headings
          h1({ children }) {
            return (
              <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-xl font-bold mt-5 mb-3 text-foreground">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground">
                {children}
              </h3>
            );
          },

          // Lists
          ul({ children }) {
            return (
              <ul className="list-disc list-inside space-y-2 my-4">
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="list-decimal list-inside space-y-2 my-4">
                {children}
              </ol>
            );
          },
          li({ children }) {
            return <li className="text-foreground leading-relaxed">{children}</li>;
          },

          // Paragraphs
          p({ children }) {
            return <p className="my-3 leading-relaxed text-foreground">{children}</p>;
          },

          // Blockquotes
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
                {children}
              </blockquote>
            );
          },

          // Tables
          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-muted">{children}</thead>;
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-border">{children}</tbody>;
          },
          tr({ children }) {
            return <tr>{children}</tr>;
          },
          th({ children }) {
            return (
              <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-4 py-2 text-sm text-foreground">{children}</td>
            );
          },

          // Horizontal rule
          hr() {
            return <hr className="my-6 border-border" />;
          },

          // Strong/Bold
          strong({ children }) {
            return <strong className="font-semibold text-foreground">{children}</strong>;
          },

          // Emphasis/Italic
          em({ children }) {
            return <em className="italic text-foreground">{children}</em>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}


