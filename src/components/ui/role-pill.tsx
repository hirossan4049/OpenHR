"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { type UserRole } from "~/lib/validation/admin"

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "#EF4444", // red-500
  MEMBER: "#3B82F6", // blue-500
  VIEWER: "#6B7280", // gray-500
}

interface RolePillProps {
  role: UserRole
  className?: string
  size?: "sm" | "md"
}

export function RolePill({ role, className, size = "sm" }: RolePillProps) {
  const color = ROLE_COLORS[role]
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
      {role}
    </span>
  )}
