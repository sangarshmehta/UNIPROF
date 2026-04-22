import { apiRequest } from "./apiClient";

export function uploadProfileImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest("/api/uploads/profile-image", {
    method: "POST",
    body: formData,
  });
}
