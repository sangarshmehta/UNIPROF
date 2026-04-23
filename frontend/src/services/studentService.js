import { apiRequest } from "./apiClient";

export function getMyStudentProfile() {
  return apiRequest("/api/students/me");
}

export function updateMyStudentProfile(payload) {
  return apiRequest("/api/students/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function rateTeacher(payload) {
  return apiRequest("/api/rate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getWishlist() {
  return apiRequest("/api/wishlist");
}

export function toggleWishlist(teacherId) {
  return apiRequest(`/api/wishlist/${teacherId}`, {
    method: "POST"
  });
}
