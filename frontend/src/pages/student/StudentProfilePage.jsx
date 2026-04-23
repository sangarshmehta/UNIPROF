import { useEffect, useState } from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import Alert from "../../components/ui/Alert.jsx";
import { getMyStudentProfile, updateMyStudentProfile } from "../../services/studentService";
import { uploadProfileImage } from "../../services/uploadService";

export default function StudentProfilePage() {
  const [form, setForm] = useState({ name: "", gender: "Male", profile_image: "", phone_number: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getMyStudentProfile();
        setForm({
          name: data?.name || "",
          gender: data?.gender || "Male",
          profile_image: data?.profile_image || "",
          phone_number: data?.phone_number || "",
        });
      } catch (requestError) {
        setError(requestError.message || "Could not load profile");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }
    try {
      setSaving(true);
      await updateMyStudentProfile(form);
      setSuccess("Profile updated successfully.");
    } catch (requestError) {
      setError(requestError.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      setUploading(true);
      const result = await uploadProfileImage(file);
      setForm((prev) => ({ ...prev, profile_image: result?.public_url || "" }));
    } catch (requestError) {
      setError(requestError.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <AppShell title="My Profile" subtitle="Manage your personal information and preferences.">
      <div className="max-w-2xl glass-card bg-[var(--card-light)] border border-[var(--border-color)] p-6 sm:p-8 slide-up">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm font-medium text-[var(--text-muted)]">Loading profile...</p>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full border-2 border-blue-100 dark:border-blue-900 overflow-hidden bg-[var(--bg-light)] flex items-center justify-center">
                  {form.profile_image ? (
                    <img src={form.profile_image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-blue-300 dark:text-blue-700">
                      {form.name ? form.name.charAt(0).toUpperCase() : "?"}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium text-[var(--text-main)]">Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-sm text-[var(--text-muted)] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-300 dark:hover:file:bg-blue-900 transition-colors"
                  onChange={handleImageUpload}
                />
                {uploading && <p className="text-xs text-blue-500 font-medium mt-1">Uploading image...</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[var(--text-muted)]">Full Name</label>
                <input
                  className={`w-full rounded-xl border bg-[var(--bg-light)] px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 ${
                    fieldErrors.name ? "border-red-400" : "border-[var(--border-color)]"
                  }`}
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                {fieldErrors.name ? <p className="input-error-text mt-1">{fieldErrors.name}</p> : null}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-[var(--text-muted)]">Gender</label>
                <select
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-light)] px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900"
                  value={form.gender}
                  onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5 text-[var(--text-muted)]">Phone Number <span className="font-normal opacity-70">(Private)</span></label>
                <input
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-light)] px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900"
                  placeholder="Enter your phone number"
                  value={form.phone_number}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone_number: event.target.value }))}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-color)]">
              <Alert message={error} />
              <Alert type="success" message={success} />
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}
