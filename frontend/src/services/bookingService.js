import { apiRequest } from "./apiClient";

export function createBooking(payload) {
  return apiRequest("/api/book", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMyBookings() {
  return apiRequest("/api/bookings/me");
}
