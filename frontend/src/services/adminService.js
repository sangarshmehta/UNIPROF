import { apiRequest } from "./apiClient";

export function getAdminUsers() {
  return apiRequest("/api/admin/users");
}

export function getAdminBookings() {
  return apiRequest("/api/admin/bookings");
}

export function setTeacherApproval(teacherId, approved) {
  return apiRequest(`/api/admin/teachers/${teacherId}/approval`, {
    method: "PATCH",
    body: JSON.stringify({ approved }),
  });
}

export function deleteUser(userId) {
  return apiRequest(`/api/admin/users/${userId}`, {
    method: "DELETE",
  });
}
