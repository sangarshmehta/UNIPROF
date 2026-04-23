import API from "../config/api";
import { emitEvent } from "./appEvents";
import { getToken } from "./tokenHelper";

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
  if (!API) {
    const error = new Error("Frontend is misconfigured: missing VITE_API_URL");
    emitEvent("toast", { type: "error", message: error.message });
    throw error;
  }

  const baseUrl = String(API).replace(/\/+$/, "");
  let normalizedPath = String(path || "");
  if (!normalizedPath.startsWith("/")) normalizedPath = `/${normalizedPath}`;
  if (normalizedPath !== "/api" && !normalizedPath.startsWith("/api/")) {
    normalizedPath = `/api${normalizedPath}`;
  }

  const token = getToken();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...(!isFormData && options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  emitEvent("loading:start");
  try {
    if (normalizedPath.includes("/teacher/slots")) {
      // #region agent log
      fetch('http://127.0.0.1:7584/ingest/5045955f-c250-425b-86f0-a7ee0a45002a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'cfa3fe'},body:JSON.stringify({sessionId:'cfa3fe',runId:'initial',hypothesisId:'H1_H2_H4',location:'frontend/src/services/apiClient.js:52',message:'apiRequest outgoing teacher slots request',data:{normalizedPath,method:options?.method||'GET',hasToken:Boolean(token),hasBody:Boolean(options?.body)},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
    }
    const response = await fetch(`${baseUrl}${normalizedPath}`, {
      ...options,
      headers,
    });
    const payload = await parseResponse(response);
    return payload;
  } catch (error) {
    if (normalizedPath.includes("/teacher/slots")) {
      // #region agent log
      fetch('http://127.0.0.1:7584/ingest/5045955f-c250-425b-86f0-a7ee0a45002a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'cfa3fe'},body:JSON.stringify({sessionId:'cfa3fe',runId:'initial',hypothesisId:'H1_H4_H5',location:'frontend/src/services/apiClient.js:62',message:'apiRequest teacher slots request failed',data:{normalizedPath,errorMessage:error?.message||'unknown',status:error?.status||null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
    }
    emitEvent("toast", {
      type: "error",
      message: error.message || "Request failed",
    });
    throw error;
  } finally {
    emitEvent("loading:end");
  }
}

// Convenience wrapper for direct fetch-style usage.
// Example:
//   try { const data = await apiJson("/api/teachers"); setData(data); } catch (e) { console.error(e); }
export async function apiJson(path) {
  return apiRequest(path);
}
