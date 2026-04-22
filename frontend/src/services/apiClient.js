import API from "../config/api";
import { emitEvent } from "./appEvents";

const TOKEN_KEY = "uniprof_token";

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      (isJson && payload && typeof payload === "object" && payload.message) ||
      response.statusText ||
      "Request failed";
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...(!isFormData && options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  emitEvent("loading:start");
  try {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers,
    });
    const payload = await parseResponse(response);
    return payload;
  } catch (error) {
    emitEvent("toast", {
      type: "error",
      message: error.message || "Request failed",
    });
    throw error;
  } finally {
    emitEvent("loading:end");
  }
}
