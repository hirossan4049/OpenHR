import { describe, it, expect } from "@jest/globals";
import { hasRole, requireRole, isAdmin } from "~/lib/auth/roles";
import type { UserWithRole } from "~/lib/auth/roles";

describe("Role-based Access Control", () => {
  const adminUser: UserWithRole = { id: "1", role: "ADMIN" };
  const memberUser: UserWithRole = { id: "2", role: "MEMBER" };
  const viewerUser: UserWithRole = { id: "3", role: "VIEWER" };

  describe("hasRole", () => {
    it("should allow admin to access all levels", () => {
      expect(hasRole(adminUser, "ADMIN")).toBe(true);
      expect(hasRole(adminUser, "MEMBER")).toBe(true);
      expect(hasRole(adminUser, "VIEWER")).toBe(true);
    });

    it("should allow member to access member and viewer levels", () => {
      expect(hasRole(memberUser, "ADMIN")).toBe(false);
      expect(hasRole(memberUser, "MEMBER")).toBe(true);
      expect(hasRole(memberUser, "VIEWER")).toBe(true);
    });

    it("should only allow viewer to access viewer level", () => {
      expect(hasRole(viewerUser, "ADMIN")).toBe(false);
      expect(hasRole(viewerUser, "MEMBER")).toBe(false);
      expect(hasRole(viewerUser, "VIEWER")).toBe(true);
    });
  });

  describe("isAdmin", () => {
    it("should correctly identify admin users", () => {
      expect(isAdmin(adminUser)).toBe(true);
      expect(isAdmin(memberUser)).toBe(false);
      expect(isAdmin(viewerUser)).toBe(false);
    });
  });

  describe("requireRole", () => {
    it("should not throw for users with sufficient permissions", () => {
      expect(() => requireRole(adminUser, "ADMIN")).not.toThrow();
      expect(() => requireRole(adminUser, "MEMBER")).not.toThrow();
      expect(() => requireRole(memberUser, "MEMBER")).not.toThrow();
      expect(() => requireRole(viewerUser, "VIEWER")).not.toThrow();
    });

    it("should throw for users with insufficient permissions", () => {
      expect(() => requireRole(memberUser, "ADMIN")).toThrow("This action requires ADMIN role or higher");
      expect(() => requireRole(viewerUser, "ADMIN")).toThrow("This action requires ADMIN role or higher");
      expect(() => requireRole(viewerUser, "MEMBER")).toThrow("This action requires MEMBER role or higher");
    });
  });
});