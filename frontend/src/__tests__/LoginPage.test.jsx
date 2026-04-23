/**
 * LoginPage.test.jsx
 * ------------------
 * Smoke tests for the LoginPage component.
 * Verifies it renders the key UI elements correctly.
 *
 * AuthContext and react-router hooks are mocked so the test
 * doesn't need a real AuthProvider or browser router.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// ── Mock useAuth so LoginPage doesn't need a real AuthProvider ──
vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({
    login: vi.fn().mockRejectedValue(new Error("Invalid credentials")),
    logout: vi.fn(),
  }),
}));

// ── Stub react-router hooks used inside LoginPage ──────────────
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ state: null }),
  };
});

import LoginPage from "../pages/LoginPage.jsx";

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe("LoginPage – rendering", () => {
  it("displays the UNIPROF heading", () => {
    renderLoginPage();
    expect(screen.getByText("UNIPROF")).toBeInTheDocument();
  });

  it("renders email and password inputs", () => {
    renderLoginPage();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
  });

  it("renders a Sign In submit button", () => {
    renderLoginPage();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });
});

describe("LoginPage – validation", () => {
  it("does not crash on submit click with empty fields", () => {
    renderLoginPage();
    const button = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(button);
    // Should still be in the document (no unmount/crash)
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });
});
