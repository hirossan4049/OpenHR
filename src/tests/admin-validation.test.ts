import { describe, it, expect } from "@jest/globals";
import {
  userRoleSchema,
  createViewerAccountSchema,
  updateUserRoleSchema,
  createTagSchema,
  hexColorSchema,
  assignTagToUserSchema,
} from "~/lib/validation/admin";

describe("Admin Validation Schemas", () => {
  describe("userRoleSchema", () => {
    it("should validate correct role values", () => {
      expect(userRoleSchema.parse("ADMIN")).toBe("ADMIN");
      expect(userRoleSchema.parse("MEMBER")).toBe("MEMBER");
      expect(userRoleSchema.parse("VIEWER")).toBe("VIEWER");
    });

    it("should reject invalid role values", () => {
      expect(() => userRoleSchema.parse("INVALID")).toThrow();
      expect(() => userRoleSchema.parse("admin")).toThrow();
      expect(() => userRoleSchema.parse("")).toThrow();
    });
  });

  describe("createViewerAccountSchema", () => {
    it("should validate correct viewer account data", () => {
      const validData = {
        name: "Test Viewer",
        email: "viewer@example.com",
        password: "password123",
      };
      
      expect(() => createViewerAccountSchema.parse(validData)).not.toThrow();
    });

    it("should reject invalid data", () => {
      // Missing name
      expect(() => createViewerAccountSchema.parse({
        email: "viewer@example.com",
        password: "password123",
      })).toThrow();

      // Invalid email
      expect(() => createViewerAccountSchema.parse({
        name: "Test Viewer",
        email: "invalid-email",
        password: "password123",
      })).toThrow();

      // Password too short
      expect(() => createViewerAccountSchema.parse({
        name: "Test Viewer",
        email: "viewer@example.com",
        password: "123",
      })).toThrow();
    });
  });

  describe("hexColorSchema", () => {
    it("should validate correct HEX colors", () => {
      expect(hexColorSchema.parse("#FF5733")).toBe("#FF5733");
      expect(hexColorSchema.parse("#000000")).toBe("#000000");
      expect(hexColorSchema.parse("#ffffff")).toBe("#ffffff");
      expect(hexColorSchema.parse("#123ABC")).toBe("#123ABC");
    });

    it("should reject invalid HEX colors", () => {
      expect(() => hexColorSchema.parse("FF5733")).toThrow(); // Missing #
      expect(() => hexColorSchema.parse("#FF573")).toThrow(); // Too short
      expect(() => hexColorSchema.parse("#FF5733G")).toThrow(); // Invalid character
      expect(() => hexColorSchema.parse("#")).toThrow(); // Only #
      expect(() => hexColorSchema.parse("red")).toThrow(); // Color name
    });
  });

  describe("createTagSchema", () => {
    it("should validate correct tag data", () => {
      const validData = {
        name: "Frontend",
        color: "#FF5733",
        description: "Frontend developers",
      };
      
      expect(() => createTagSchema.parse(validData)).not.toThrow();
    });

    it("should allow optional description", () => {
      const validData = {
        name: "Backend",
        color: "#33FF57",
      };
      
      expect(() => createTagSchema.parse(validData)).not.toThrow();
    });

    it("should reject invalid tag data", () => {
      // Empty name
      expect(() => createTagSchema.parse({
        name: "",
        color: "#FF5733",
      })).toThrow();

      // Invalid color
      expect(() => createTagSchema.parse({
        name: "Frontend",
        color: "red",
      })).toThrow();

      // Name too long
      expect(() => createTagSchema.parse({
        name: "A".repeat(51),
        color: "#FF5733",
      })).toThrow();
    });
  });

  describe("updateUserRoleSchema", () => {
    it("should validate correct update role data", () => {
      const validData = {
        userId: "user123",
        role: "MEMBER" as const,
      };
      
      expect(() => updateUserRoleSchema.parse(validData)).not.toThrow();
    });

    it("should reject invalid data", () => {
      // Missing userId
      expect(() => updateUserRoleSchema.parse({
        role: "MEMBER",
      })).toThrow();

      // Invalid role
      expect(() => updateUserRoleSchema.parse({
        userId: "user123",
        role: "INVALID",
      })).toThrow();
    });
  });

  describe("assignTagToUserSchema", () => {
    it("should validate correct assignment data", () => {
      const validData = {
        userId: "user123",
        tagId: "tag456",
      };
      
      expect(() => assignTagToUserSchema.parse(validData)).not.toThrow();
    });

    it("should reject missing data", () => {
      // Missing userId
      expect(() => assignTagToUserSchema.parse({
        tagId: "tag456",
      })).toThrow();

      // Missing tagId
      expect(() => assignTagToUserSchema.parse({
        userId: "user123",
      })).toThrow();
    });
  });
});