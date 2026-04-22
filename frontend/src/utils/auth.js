const TOKEN_KEY = "uniprof_token";
const ROLE_KEY = "uniprof_role";

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function getAuthRole() {
  return localStorage.getItem(ROLE_KEY) || "";
}

export function setAuthSession({ token, role }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (role) localStorage.setItem(ROLE_KEY, role);
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}

export function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

