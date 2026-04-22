import { apiRequest } from "./apiClient";

const TOKEN_KEY = "uniprof_token";
const ROLE_KEY = "uniprof_role";
const NAME_KEY = "uniprof_name";
const GENDER_KEY = "uniprof_gender";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function getStoredRole() {
  return localStorage.getItem(ROLE_KEY) || "";
}

export function getStoredName() {
  return localStorage.getItem(NAME_KEY) || "";
}

export function getStoredGender() {
  return localStorage.getItem(GENDER_KEY) || "";
}

export function saveSession({ token, role, name, gender }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
  if (role) localStorage.setItem(ROLE_KEY, role);
  else localStorage.removeItem(ROLE_KEY);
  localStorage.setItem(NAME_KEY, name || "");
  localStorage.setItem(GENDER_KEY, gender || "");
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(GENDER_KEY);
}

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
