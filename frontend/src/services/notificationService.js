import { apiRequest } from "./apiClient";

export function getNotifications() {
  return apiRequest("/api/notifications");
}

export function getUnreadNotificationCount() {
  return apiRequest("/api/notifications/unread-count");
}

export function markNotificationRead(notificationId) {
  return apiRequest(`/api/notifications/${notificationId}/read`, {
    method: "POST",
  });
}

export function markAllNotificationsRead() {
  return apiRequest("/api/notifications/read-all", {
    method: "POST",
  });
}
