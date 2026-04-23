import { apiRequest } from "./apiClient";
import {
  clearSession as _clearSession,
  getGender as _getGender,
  getName as _getName,
  getRole as _getRole,
  getToken as _getToken,
  saveSession as _saveSession,
} from "./tokenHelper";

// ── Public re-exports so AuthContext and other callers don't need to
//    import tokenHelper directly. ──────────────────────────────────
export const getStoredToken  = _getToken;
export const getStoredRole   = _getRole;
export const getStoredName   = _getName;
export const getStoredGender = _getGender;
export const saveSession     = _saveSession;
export const clearSession    = _clearSession;

// ── API calls ────────────────────────────────────────────────
export async function login(payload) {
  return apiRequest("/api/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function register(payload) {
  return apiRequest("/api/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser() {
  return apiRequest("/api/me");
}

