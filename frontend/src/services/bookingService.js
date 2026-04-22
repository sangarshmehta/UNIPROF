import { apiRequest } from "./apiClient";

export function createBooking(payload) {
  return apiRequest("/api/book", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
