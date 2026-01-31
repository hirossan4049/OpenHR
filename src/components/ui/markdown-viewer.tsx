"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "~/lib/utils";

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Style links
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            />
          ),
          // Style images
          img: ({ node, ...props }) => (
            <img
              {...props}
              className="rounded-lg max-w-full h-auto"
              loading="lazy"
            />
          ),
          // Style code blocks
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;
            return isInline ? (
              <code
                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            ) : (
              <code
                className={cn("block bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono", className)}
                {...props}
              >
                {children}
              </code>
            );
          },
          // Style tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto">
              <table className="border-collapse border border-border" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="border border-border px-3 py-2 bg-muted font-semibold text-left" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-border px-3 py-2" {...props} />
          ),
          // Style blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-primary pl-4 italic text-muted-foreground"
              {...props}
            />
          ),
          // Style lists
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-6 space-y-1" {...props} />
          ),
          // Style headings
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold mt-5 mb-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />
          ),
          // Style paragraphs
          p: ({ node, ...props }) => (
            <p className="mb-4 last:mb-0" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
