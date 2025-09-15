"use client"

import * as React from "react"
import { Crown, Eye, Shield } from "lucide-react"
import { cn } from "~/lib/utils"
import { type UserRole } from "~/lib/validation/admin"

const ROLE_META: Record<UserRole, { color: string; Icon: React.ComponentType<{ className?: string }> }> = {
  ADMIN: { color: "#EF4444", Icon: Crown }, // red-500
  MEMBER: { color: "#3B82F6", Icon: Shield }, // blue-500
  VIEWER: { color: "#6B7280", Icon: Eye }, // gray-500
}

interface RolePillProps {
  role: UserRole
  className?: string
  size?: "sm" | "md"
}

export function RolePill({ role, className, size = "sm" }: RolePillProps) {
  const { color, Icon } = ROLE_META[role]
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
      <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      {role}
    </span>
  )}

