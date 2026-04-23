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

export function getMyTeacherSlots() {
  return apiRequest("/api/teacher/slots");
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

export function rejectBooking(bookingId) {
  return apiRequest(`/api/teacher/bookings/${bookingId}/reject`, {
    method: "POST",
  });
}

export function publishSlot(payload) {
  return apiRequest("/api/teacher/slots", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteSlot(id) {
  return apiRequest(`/api/teacher/slots/${id}`, {
    method: "DELETE",
  });
}

