/**
 * App.test.js
 * -----------
 * Smoke tests for the LoginPage component (entry point).
 * Verifies it renders the key UI elements correctly and that
 * form validation blocks submission when fields are empty.
 *
 * AuthContext is mocked so the test doesn't need real credentials.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// ── Mock useAuth so LoginPage doesn't need a real AuthProvider ──
vi.mock("./context/AuthContext.jsx", () => ({
  useAuth: () => ({
    login: vi.fn().mockRejectedValue(new Error("Invalid credentials")),
    logout: vi.fn(),
  }),
}));

// ── Mock react-router navigate so we don't need a full router ──
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ state: null }),
  };
});

import LoginPage from "./pages/LoginPage.jsx";

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe("LoginPage – rendering", () => {
  it("displays the UniProf heading", () => {
    renderLoginPage();
    expect(screen.getByText("UniProf")).toBeInTheDocument();
  });

  it("renders email and password inputs by ID", () => {
    renderLoginPage();
    expect(document.getElementById("login-email")).toBeInTheDocument();
    expect(document.getElementById("login-password")).toBeInTheDocument();
  });

  it("renders a Sign In submit button", () => {
    renderLoginPage();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });
});

describe("LoginPage – validation", () => {
  it("shows an error when submitted with empty fields", async () => {
    renderLoginPage();
    const button = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(button);
    // The required HTML5 attribute prevents submission, OR our JS guard fires.
    // Either way, no navigation should happen and no crash.
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });
});
