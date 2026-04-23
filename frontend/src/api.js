/**
 * ⚠️  DEPRECATED — DO NOT USE THIS FILE.
 *
 * This file is retired. All API calls must go through:
 *   frontend/src/services/apiClient.js   – raw HTTP helper
 *   frontend/src/services/authService.js – auth helpers
 *   frontend/src/context/AuthContext.jsx – React auth state
 *
 * These re-exports are kept temporarily so that any lingering
 * import of this file does not crash the app.  Update your
 * import to the services above, then delete this file.
 */

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    "[UNIPROF] frontend/src/api.js is DEPRECATED.\n" +
    "Update your import to use services/authService.js or services/apiClient.js instead."
  );
}

export { login, register, getCurrentUser } from "./services/authService";
