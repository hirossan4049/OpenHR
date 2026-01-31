"use client";

import dynamic from "next/dynamic";
import { cn } from "~/lib/utils";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  height = 300,
  className,
}: MarkdownEditorProps) {
  return (
    <div className={cn("w-full", className)} data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || "")}
        preview="edit"
        height={height}
        textareaProps={{
          placeholder,
        }}
      />
      <p className="text-xs text-muted-foreground mt-1">
        Markdownが使用できます。画像はURLで挿入: ![alt](url)
      </p>
    </div>
  );
}
