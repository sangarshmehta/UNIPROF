/**
 * tokenHelper.test.js
 * -------------------
 * Smoke tests for the tokenHelper module.
 * These tests verify that the single-key auth strategy works correctly:
 * only uniprof_* keys are used, and clearSession removes all of them.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getToken,
  getRole,
  getName,
  getGender,
  setToken,
  setRole,
  setName,
  setGender,
  saveSession,
  clearSession,
  isAuthenticated,
} from "../services/tokenHelper";

// Use an in-memory localStorage mock so tests don't touch the real browser store.
const store = {};
const localStorageMock = {
  getItem:    (key) => store[key] ?? null,
  setItem:    (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; },
  clear:      () => Object.keys(store).forEach((k) => delete store[k]),
};

beforeEach(() => {
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorageMock,
    writable: true,
  });
  localStorageMock.clear();
});

// ── Getters return empty string when nothing stored ──────────
describe("getters – empty store", () => {
  it("getToken returns empty string", () => expect(getToken()).toBe(""));
  it("getRole returns empty string",  () => expect(getRole()).toBe(""));
  it("getName returns empty string",  () => expect(getName()).toBe(""));
  it("getGender returns empty string",() => expect(getGender()).toBe(""));
  it("isAuthenticated returns false", () => expect(isAuthenticated()).toBe(false));
});

// ── Setters round-trip ───────────────────────────────────────
describe("setters store and retrieve values", () => {
  it("setToken / getToken",  () => { setToken("tok123"); expect(getToken()).toBe("tok123"); });
  it("setRole / getRole",    () => { setRole("student"); expect(getRole()).toBe("student"); });
  it("setName / getName",    () => { setName("Alice"); expect(getName()).toBe("Alice"); });
  it("setGender / getGender",() => { setGender("Female"); expect(getGender()).toBe("Female"); });
});

// ── isAuthenticated ──────────────────────────────────────────
describe("isAuthenticated", () => {
  it("returns true when a token is set",  () => { setToken("abc"); expect(isAuthenticated()).toBe(true); });
  it("returns false after token cleared", () => {
    setToken("abc");
    clearSession();
    expect(isAuthenticated()).toBe(false);
  });
});

// ── saveSession bulk write ───────────────────────────────────
describe("saveSession", () => {
  it("stores all provided fields",  () => {
    saveSession({ token: "t1", role: "teacher", name: "Bob", gender: "Male" });
    expect(getToken()).toBe("t1");
    expect(getRole()).toBe("teacher");
    expect(getName()).toBe("Bob");
    expect(getGender()).toBe("Male");
  });
  it("partial update does not wipe existing values", () => {
    saveSession({ token: "t1", role: "student", name: "Carol", gender: "Female" });
    saveSession({ name: "Carol Updated" }); // only name provided
    expect(getToken()).toBe("t1");          // unchanged
    expect(getRole()).toBe("student");      // unchanged
    expect(getName()).toBe("Carol Updated");
  });
});

// ── clearSession ─────────────────────────────────────────────
describe("clearSession", () => {
  it("removes all four keys", () => {
    saveSession({ token: "t", role: "admin", name: "Dan", gender: "Male" });
    clearSession();
    expect(getToken()).toBe("");
    expect(getRole()).toBe("");
    expect(getName()).toBe("");
    expect(getGender()).toBe("");
  });
  it("does NOT touch other unrelated localStorage keys", () => {
    localStorage.setItem("other_key", "keep-me");
    saveSession({ token: "t" });
    clearSession();
    expect(localStorage.getItem("other_key")).toBe("keep-me");
  });
});
