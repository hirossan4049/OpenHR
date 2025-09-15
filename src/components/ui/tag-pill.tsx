"use client"

import * as React from "react"
import { cn } from "~/lib/utils"

interface TagPillProps {
  name: string
  color?: string
  className?: string
  size?: "sm" | "md"
  showDot?: boolean
}

export function TagPill({ name, color = "#999999", className, size = "sm", showDot = true }: TagPillProps) {
  const bg = `${color}20`
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
        size === "sm" ? "text-xs" : "text-sm",
        className,
      )}
      style={{ backgroundColor: bg, borderColor: color }}
    >
      {showDot && (
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {name}
    </span>
  )
}

