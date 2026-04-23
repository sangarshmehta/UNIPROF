#!/usr/bin/env node
/**
 * scripts/check-deploy.js
 * ========================
 * Pre-deployment sanity checker for UNIPROF.
 * Run this before every production deployment:
 *
 *   node scripts/check-deploy.js
 *
 * Exit code 0  → all checks passed, safe to deploy.
 * Exit code 1  → one or more checks failed, DO NOT deploy.
 *
 * Checks performed:
 *  1. Required backend env vars are present.
 *  2. Required frontend env vars are present (if frontend/.env exists).
 *  3. CORS_ORIGIN is not a bare wildcard in production.
 *  4. Health endpoint responds 200 (if HEALTH_URL is provided).
 *  5. /api/teachers endpoint returns an array (smoke DB check).
 */

const fs   = require("fs");
const path = require("path");
const http  = require("http");
const https = require("https");

// ── Colour helpers ─────────────────────────────────────────
const c = {
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
  dim:    (s) => `\x1b[2m${s}\x1b[0m`,
};

let passed = 0;
let failed = 0;

function ok(label)    { passed++; console.log(`  ${c.green("✔")} ${label}`); }
function fail(label)  { failed++; console.log(`  ${c.red("✘")} ${label}`); }
function warn(label)  {           console.log(`  ${c.yellow("⚠")} ${label}`); }
function section(title) {
  console.log(`\n${c.bold(title)}`);
  console.log(c.dim("─".repeat(50)));
}

// ── Load .env file safely ───────────────────────────────────
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    env[key] = val;
  }
  return env;
}

// ── HTTP fetch helper ───────────────────────────────────────
function fetchUrl(url, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(url, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body }));
    });
    req.on("error", reject);
    req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

// ── Check 1: Backend env vars ────────────────────────────────
section("1. Backend environment variables");
const backendEnvPath = path.resolve(__dirname, "../backend/.env");
const rootEnvPath    = path.resolve(__dirname, "../.env");
const backendEnv = {
  ...loadEnvFile(rootEnvPath),
  ...loadEnvFile(backendEnvPath),
  ...process.env,
};

const REQUIRED_BACKEND = [
  "JWT_SECRET",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

for (const key of REQUIRED_BACKEND) {
  if (backendEnv[key] && backendEnv[key].trim()) {
    ok(`${key} is set`);
  } else {
    fail(`${key} is MISSING or empty`);
  }
}

// CORS_ORIGIN wildcard warning in production
if (backendEnv.NODE_ENV === "production" && backendEnv.CORS_ORIGIN === "*") {
  fail("CORS_ORIGIN=* is NOT safe in production – use a comma-separated origin list");
} else if (backendEnv.CORS_ORIGIN === "*") {
  warn("CORS_ORIGIN=* is set (OK for local dev, not for production)");
} else if (backendEnv.CORS_ORIGIN) {
  ok(`CORS_ORIGIN is set: ${backendEnv.CORS_ORIGIN}`);
} else {
  warn("CORS_ORIGIN is not set (will block all cross-origin requests in production)");
}

// ── Check 2: Frontend env vars ───────────────────────────────
section("2. Frontend environment variables");
const frontendEnvPath = path.resolve(__dirname, "../frontend/.env");
const frontendEnv = { ...loadEnvFile(frontendEnvPath), ...process.env };

if (frontendEnv.VITE_API_URL && frontendEnv.VITE_API_URL.trim()) {
  ok(`VITE_API_URL is set: ${frontendEnv.VITE_API_URL}`);
} else {
  fail("VITE_API_URL is MISSING – frontend API calls will fail");
}

// ── Check 3: Health & DB endpoints (optional, needs HEALTH_URL) ──
section("3. Live endpoint smoke checks");
const BASE_URL = backendEnv.HEALTH_URL || frontendEnv.VITE_API_URL;

if (!BASE_URL) {
  warn("Skipping live checks – set HEALTH_URL or VITE_API_URL to enable");
} else {
  (async () => {
    // Health check
    try {
      const { status, body } = await fetchUrl(`${BASE_URL}/health`);
      const parsed = JSON.parse(body);
      if (status === 200 && parsed.status === "ok") {
        ok(`GET /health → 200 { status: 'ok' }`);
      } else {
        fail(`GET /health returned unexpected response: ${status} ${body}`);
      }
    } catch (err) {
      fail(`GET /health failed: ${err.message}`);
    }

    // Teacher listing smoke check
    try {
      const { status, body } = await fetchUrl(`${BASE_URL}/api/teachers`);
      const parsed = JSON.parse(body);
      if (status === 200 && Array.isArray(parsed)) {
        ok(`GET /api/teachers → 200 array (${parsed.length} teachers)`);
      } else {
        fail(`GET /api/teachers returned unexpected response: ${status}`);
      }
    } catch (err) {
      fail(`GET /api/teachers failed: ${err.message}`);
    }

    // Protected route guard check
    try {
      const { status } = await fetchUrl(`${BASE_URL}/api/me`);
      if (status === 401) {
        ok(`GET /api/me (no token) → 401 as expected`);
      } else {
        fail(`GET /api/me should return 401 but got ${status}`);
      }
    } catch (err) {
      fail(`GET /api/me check failed: ${err.message}`);
    }

    printSummary();
  })();
} // end if BASE_URL

function printSummary() {
  section("Summary");
  console.log(`  Passed: ${c.green(String(passed))}`);
  console.log(`  Failed: ${failed > 0 ? c.red(String(failed)) : c.green("0")}`);
  if (failed > 0) {
    console.log(`\n${c.red(c.bold("✘ Pre-deploy check FAILED. Fix the issues above before deploying."))}\n`);
    process.exit(1);
  } else {
    console.log(`\n${c.green(c.bold("✔ All checks passed. Safe to deploy!"))}\n`);
    process.exit(0);
  }
}

// If no live checks, print summary immediately.
if (!BASE_URL) printSummary();
