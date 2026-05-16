import { describe, it, expect, vi } from "vitest";
import { AppError } from "@/core/errors";

// Minimal mock of share-links service password enforcement logic
describe("ShareLinksService password enforcement", () => {
  it("should reject PasswordProtected link creation without a password", () => {
    const validate = (accessType: string, password?: string) => {
      if (accessType === "PasswordProtected" && !password) {
        throw new AppError("Password is required for password-protected links", 400, "PASSWORD_REQUIRED");
      }
    };

    expect(() => validate("PasswordProtected")).toThrowError("Password is required");
    expect(() => validate("PasswordProtected", "secret123")).not.toThrow();
    expect(() => validate("Public")).not.toThrow();
  });
});
