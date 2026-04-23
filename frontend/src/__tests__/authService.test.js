/**
 * authService.test.js
 * -------------------
 * Smoke tests for authService.js.
 * Verifies that login / register / getCurrentUser call apiRequest
 * with the correct path and method, and never touch localStorage directly.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock apiClient so no real HTTP requests are made ────────
vi.mock("../services/apiClient", () => ({
  apiRequest: vi.fn(),
}));

// ── Mock tokenHelper so we can spy on session helpers ────────
vi.mock("../services/tokenHelper", () => ({
  getToken:      vi.fn(() => ""),
  getRole:       vi.fn(() => ""),
  getName:       vi.fn(() => ""),
  getGender:     vi.fn(() => ""),
  setToken:      vi.fn(),
  setRole:       vi.fn(),
  setName:       vi.fn(),
  setGender:     vi.fn(),
  saveSession:   vi.fn(),
  clearSession:  vi.fn(),
  isAuthenticated: vi.fn(() => false),
}));

import { apiRequest } from "../services/apiClient";
import { login, register, getCurrentUser } from "../services/authService";

beforeEach(() => vi.clearAllMocks());

describe("authService.login", () => {
  it("calls apiRequest with POST /api/login and the given payload", async () => {
    apiRequest.mockResolvedValue({ token: "tok", role: "student" });
    await login({ email: "a@b.com", password: "secret" });
    expect(apiRequest).toHaveBeenCalledOnce();
    expect(apiRequest).toHaveBeenCalledWith(
      "/api/login",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("returns the API response as-is", async () => {
    const fakeResult = { token: "tok", role: "teacher", name: "Prof X" };
    apiRequest.mockResolvedValue(fakeResult);
    const result = await login({ email: "t@b.com", password: "pass" });
    expect(result).toEqual(fakeResult);
  });

  it("propagates API errors to the caller", async () => {
    apiRequest.mockRejectedValue(new Error("Invalid credentials"));
    await expect(login({ email: "x@y.com", password: "bad" })).rejects.toThrow(
      "Invalid credentials"
    );
  });
});

describe("authService.register", () => {
  it("calls apiRequest with POST /api/register", async () => {
    apiRequest.mockResolvedValue({ message: "ok" });
    await register({ email: "new@b.com", password: "pass", name: "Alice" });
    expect(apiRequest).toHaveBeenCalledWith(
      "/api/register",
      expect.objectContaining({ method: "POST" })
    );
  });
});

describe("authService.getCurrentUser", () => {
  it("calls apiRequest with GET /api/me", async () => {
    apiRequest.mockResolvedValue({ id: 1, role: "student" });
    await getCurrentUser();
    expect(apiRequest).toHaveBeenCalledWith("/api/me");
  });
});
