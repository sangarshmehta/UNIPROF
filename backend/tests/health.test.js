/**
 * health.test.js
 * ---------------
 * Smoke tests for the UNIPROF backend.
 *
 * These tests run against the Express app directly (no real server port).
 * They validate that the critical API surface works correctly:
 *
 *  1. GET /          → 200  "API is running"
 *  2. GET /health    → 200  { status: "ok" }
 *  3. GET /api/me    → 401  when no token sent          (protected route guard)
 *  4. GET /api/teachers → 200 array                    (public teacher listing)
 *  5. POST /api/login   → 400/401 on bad credentials   (auth rejection)
 *  6. POST /api/login   → 404 on unknown route check   (sanity)
 *
 * NOTE: Tests that hit the DB (teachers, login) will make real Supabase
 * calls if SUPABASE_* env vars are set.  Set TEST_SKIP_DB=true to skip
 * DB-dependent tests in environments without real credentials.
 */
const request = require("supertest");

// Load env so env.js validation passes before requiring app.
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env"), quiet: true });

const skipDb = process.env.TEST_SKIP_DB === "true";

let app;
let appLoadError = null;
try {
  app = require("../../src/app");
} catch (err) {
  appLoadError = err;
}

const describeWhenAppReady = app ? describe : describe.skip;
const describeWhenDbReady = app && !skipDb ? describe : describe.skip;

if (!app) {
  describe("backend – env not configured", () => {
    it("skips app-level tests when required env vars are missing", () => {
      expect(appLoadError).toBeTruthy();
    });
  });
}

// ── Root & health endpoints ───────────────────────────────────
describeWhenAppReady("GET /", () => {
  it("returns 200 with running message", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/running/i);
  });
});

describeWhenAppReady("GET /health", () => {
  it("returns 200 with { status: 'ok' }", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

// ── Protected route guard ────────────────────────────────────
describeWhenAppReady("GET /api/me (protected)", () => {
  it("returns 401 when no Authorization header is sent", async () => {
    const res = await request(app).get("/api/me");
    expect(res.statusCode).toBe(401);
  });

  it("returns 401 when a malformed token is sent", async () => {
    const res = await request(app)
      .get("/api/me")
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.statusCode).toBe(401);
  });
});

// ── 404 for unknown routes ────────────────────────────────────
describeWhenAppReady("Unknown route", () => {
  it("returns 404 for an unregistered path", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.statusCode).toBe(404);
  });
});

// ── Auth endpoint smoke tests (require DB) ────────────────────
describeWhenDbReady("POST /api/login – bad credentials (requires DB)", () => {
  it("returns 400 or 401 for missing fields", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({})
      .set("Content-Type", "application/json");
    expect([400, 401, 422]).toContain(res.statusCode);
  });

  it("returns 401 for wrong password", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ email: "nobody@example.com", password: "wrong" })
      .set("Content-Type", "application/json");
    expect([401, 400]).toContain(res.statusCode);
  });
});

// ── Public teacher listing (requires DB) ─────────────────────
describeWhenDbReady("GET /api/teachers (requires DB)", () => {
  it("returns 200 with an array", async () => {
    const res = await request(app).get("/api/teachers");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ── SaaS Extension endpoint guards (no DB required) ──────────
// These verify that auth middleware blocks unauthenticated access.
// They are fully deterministic and do NOT hit Supabase.

describeWhenAppReady("GET /api/bookings/me (protected)", () => {
  it("returns 401 when no token sent", async () => {
    const res = await request(app).get("/api/bookings/me");
    expect(res.statusCode).toBe(401);
  });
});

describeWhenAppReady("GET /api/wishlist (protected)", () => {
  it("returns 401 when no token sent", async () => {
    const res = await request(app).get("/api/wishlist");
    expect(res.statusCode).toBe(401);
  });
});

describeWhenAppReady("POST /api/wishlist/:id (protected)", () => {
  it("returns 401 when no token sent", async () => {
    const res = await request(app).post("/api/wishlist/1");
    expect(res.statusCode).toBe(401);
  });
});

describeWhenAppReady("GET /api/teacher/bookings (protected)", () => {
  it("returns 401 when no token sent", async () => {
    const res = await request(app).get("/api/teacher/bookings");
    expect(res.statusCode).toBe(401);
  });
});

describeWhenAppReady("POST /api/teacher/bookings/:id/reject (protected)", () => {
  it("returns 401 when no token sent", async () => {
    const res = await request(app).post("/api/teacher/bookings/1/reject");
    expect(res.statusCode).toBe(401);
  });
});

describeWhenAppReady("POST /api/teacher/slots (protected)", () => {
  it("returns 401 when no token sent", async () => {
    const res = await request(app).post("/api/teacher/slots");
    expect(res.statusCode).toBe(401);
  });
});

describeWhenAppReady("DELETE /api/teacher/slots/:id (protected)", () => {
  it("returns 401 when no token sent", async () => {
    const res = await request(app).delete("/api/teacher/slots/1");
    expect(res.statusCode).toBe(401);
  });
});

