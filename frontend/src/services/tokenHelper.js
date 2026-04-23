/**
 * tokenHelper.js
 * ---------------
 * Single source of truth for reading/writing auth session data
 * in localStorage. Always use these helpers instead of calling
 * localStorage directly, so the key names are never duplicated
 * across the codebase.
 *
 * Keys used:
 *   uniprof_token   – JWT bearer token
 *   uniprof_role    – user role (student | teacher | admin)
 *   uniprof_name    – display name
 *   uniprof_gender  – gender (Male | Female | Other | '')
 */

const TOKEN_KEY  = "uniprof_token";
const ROLE_KEY   = "uniprof_role";
const NAME_KEY   = "uniprof_name";
const GENDER_KEY = "uniprof_gender";

// ── Getters ─────────────────────────────────────────────────
export function getToken()  { return localStorage.getItem(TOKEN_KEY)  ?? ""; }
export function getRole()   { return localStorage.getItem(ROLE_KEY)   ?? ""; }
export function getName()   { return localStorage.getItem(NAME_KEY)   ?? ""; }
export function getGender() { return localStorage.getItem(GENDER_KEY) ?? ""; }

// ── Setters ─────────────────────────────────────────────────
export function setToken(value)  { localStorage.setItem(TOKEN_KEY,  value ?? ""); }
export function setRole(value)   { localStorage.setItem(ROLE_KEY,   value ?? ""); }
export function setName(value)   { localStorage.setItem(NAME_KEY,   value ?? ""); }
export function setGender(value) { localStorage.setItem(GENDER_KEY, value ?? ""); }

// ── Bulk helpers ─────────────────────────────────────────────
/** Save a full auth session (all fields optional). */
export function saveSession({ token, role, name, gender } = {}) {
  if (token  !== undefined) setToken(token);
  if (role   !== undefined) setRole(role);
  if (name   !== undefined) setName(name);
  if (gender !== undefined) setGender(gender);
}

/** Remove all session data from localStorage. */
export function clearSession() {
  [TOKEN_KEY, ROLE_KEY, NAME_KEY, GENDER_KEY].forEach((key) =>
    localStorage.removeItem(key)
  );
}

/** Returns true when a token is present (user looks authenticated). */
export function isAuthenticated() {
  return Boolean(getToken());
}
