import { apiRequest } from "./apiClient";

export function getTeachers() {
  return apiRequest("/api/teachers");
}

export function getTeacherById(id) {
  return apiRequest(`/api/teachers/${id}`);
}

export function getTeacherSlots(teacherId) {
  return apiRequest(`/api/slots/${teacherId}`);
}

export function getTeacherDashboard() {
  return apiRequest("/api/teacher/dashboard");
}

export function getTeacherProfile() {
  return apiRequest("/api/teacher/profile");
}

export function updateTeacherProfile(payload) {
  return apiRequest("/api/teacher/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function getTeacherBookings() {
  return apiRequest("/api/teacher/bookings");
}

export function acceptBooking(bookingId) {
  return apiRequest(`/api/teacher/bookings/${bookingId}/accept`, {
    method: "POST",
  });
}
