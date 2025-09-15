import { TRPCError } from "@trpc/server";
import type { UserRole } from "~/lib/validation/admin";

export interface UserWithRole {
  id: string;
  role: string;
}

/**
 * Check if user has the required role
 */
export function hasRole(user: UserWithRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    VIEWER: 0,
    MEMBER: 1, 
    ADMIN: 2,
  };

  const userRoleLevel = roleHierarchy[user.role as UserRole] ?? 0;
  const requiredRoleLevel = roleHierarchy[requiredRole];

  return userRoleLevel >= requiredRoleLevel;
}

/**
 * Enforce role requirement, throw error if insufficient permissions
 */
export function requireRole(user: UserWithRole, requiredRole: UserRole): void {
  if (!hasRole(user, requiredRole)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `This action requires ${requiredRole} role or higher`,
    });
  }
}

/**
 * Check if user is admin
 */
export function isAdmin(user: UserWithRole): boolean {
  return hasRole(user, "ADMIN");
}

/**
 * Require admin role
 */
export function requireAdmin(user: UserWithRole): void {
  requireRole(user, "ADMIN");
}